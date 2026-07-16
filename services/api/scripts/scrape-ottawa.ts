import axios from "axios";
import * as cheerio from "cheerio";
import admin from "firebase-admin";
import OpenAI from "openai";
import crypto from "crypto";
import { CityStatusDTO, StatusStoryDTO } from "@scopes/shared-types";

// ottawa.ca 403s requests with no/generic user-agent (curl, bare axios), but
// serves normal server-rendered HTML to a real browser UA -> no headless
// browser needed, just ask nicely
const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"

async function fetchHtml(url: string): Promise<string> {
  const response = await axios.get<string>(url, {
    headers: { "User-Agent": BROWSER_USER_AGENT },
    timeout: 30000,
  });
  return response.data;
}

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(
        JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT as string)
      ),
    });
    console.log("Firebase Admin initialized successfully");
  } catch (error) {
    console.error("Firebase initialization error:", error);
    process.exit(1);
  }
}

const firestore = admin.firestore();
firestore.settings({ ignoreUndefinedProperties: true });

// Initialize OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to create a hash for document IDs
function createDocId(content: string): string {
  return crypto.createHash("md5").update(content).digest("hex");
}

// Define the main prompt for status listings
const statusListingPrompt = `
Extract the status listings from the provided HTML. For each listing, I need:
1. title: The name of the alert. It can either be : Rink of Dreams, Jim Tubman Chevrolet Rink,Sledding, Lansdowne Park skating court, Ben Franklin Place Skating Rink, winter weather parking, or Open air fires
2. link: The URL of the listing
3. icon: A description of the icon used (e.g. "skating not permitted")
4. description: A short description of the status, i.e. "Skating is not permitted at the Rink of Dreams"
5. date: Today's date from the header
6. bool: true only if this listing represents a restriction, ban, or closure currently in effect
   that citizens need to know about (e.g. skating/sledding NOT permitted, open-air fires banned or
   NOT permitted, a winter parking ban in effect, school buses cancelled). false if the activity is
   permitted/operating normally, even if conditional (e.g. "fires are permitted with a burn permit"
   is a normal condition, not a ban, so bool is false). Base this strictly on the description's own
   wording ("not permitted", "banned", "cancelled" -> true; "permitted", "in effect as usual",
   "running normally" -> false), not on the presence or color of an icon.

Return the results as a valid JSON array of objects with these properties.
`;

// Define the detailed page prompt
const detailedPagePrompt = `
Extract the key information from this Ottawa city status page. Create a structured JSON with:
1. title: The main title of the page
2. status: Summarize the page for a citizen of Ottawa. What do they need to know in one title
3. lastUpdated: The date when this information was last updated
4. description: A concise summary of the main content for a citizen of Ottawa
6. affectedAreas: Any specific areas mentioned (as an array)
7. recommendations: Any recommendations for citizens (as an array)

Return as a single valid JSON object with these fields.
`;

async function processWithGPT(content: string, prompt: string): Promise<any> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that extracts structured data from HTML content.",
        },
        { role: "user", content: prompt + "\n\nHTML content:\n" + content },
      ],
      temperature: 0.2, // Low temperature for more deterministic results
    });

    const jsonText = response.choices[0]?.message?.content || "";
    // Extract JSON from the response (in case GPT includes explanatory text)
    const jsonMatch = jsonText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in the GPT response");
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Error processing with GPT:", error);
    throw error;
  }
}

async function scrapeOttawaStatus() {
  console.log("Starting Ottawa status scraper...");

  try {
    console.log("Loading Ottawa.ca main page...");
    const html = await fetchHtml("https://ottawa.ca/en");
    const $ = cheerio.load(html);

    // Extract the status listing div
    console.log("Extracting status listings...");
    const statusListingDiv = $(".view-status-listing").first().prop("outerHTML") || ""

    if (!statusListingDiv) {
      throw new Error("Status listing div not found");
    }

    // Process status listings with GPT
    console.log("Processing status listings with GPT...");
    const statusListings = (await processWithGPT(
      statusListingDiv,
      statusListingPrompt
    )) as Array<Omit<CityStatusDTO, "id" | "scrapedAt">>;

    // Save status listings to Firestore
    console.log(`Found ${statusListings.length} status items to save`);
    for (const status of statusListings) {
      const docId = createDocId(status.title + status.link);
      await firestore
        .collection("ottawa_status")
        .doc(docId)
        .set({
          ...status,
          scrapedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      console.log(`Saved status: ${status.title}`);
    }

    // Get the main featured card link (the homepage banner, e.g. an active
    // emergency notice)
    console.log("Finding main feature link...");
    const featureLinkEl = $(".card-paragraph a").first();
    const featureLink = featureLinkEl.attr("href") || null;

    if (featureLink) {
      const fullUrl = featureLink.startsWith("http")
        ? featureLink
        : `https://ottawa.ca${featureLink}`;
      console.log(`Found feature link: ${fullUrl}`);

      // Load the detailed page
      console.log("Loading detailed page...");
      const detailHtml = await fetchHtml(fullUrl);
      const $detail = cheerio.load(detailHtml);

      // Extract the content of the detailed page
      console.log("Extracting detailed page content...");
      const pageContent = $detail(".region-content").first().prop("outerHTML") || ""

      if (pageContent) {
        // Process detailed page with GPT
        console.log("Processing detailed page with GPT...");
        const detailedInfo = (await processWithGPT(
          pageContent,
          detailedPagePrompt
        )) as Omit<StatusStoryDTO, "id" | "sourceUrl" | "scrapedAt">;

        // Save detailed info to Firestore
        const detailDocId = createDocId(fullUrl);
        await firestore
          .collection("ottawa_story")
          .doc(detailDocId)
          .set({
            ...detailedInfo,
            sourceUrl: fullUrl,
            scrapedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        console.log(
          `Saved detailed information for: ${detailedInfo.title || "Unknown"}`
        );
      } else {
        console.log("No content found on detailed page");
      }
    } else {
      console.log("No feature link found");
    }

    console.log("Ottawa status scraper completed successfully");
  } catch (error) {
    console.error("Error in Ottawa status scraper:", error);
    throw error;
  }
}

// Execute the scraper
scrapeOttawaStatus()
  .then(() => {
    console.log("Scraper execution completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error in scraper:", error);
    process.exit(1);
  });
