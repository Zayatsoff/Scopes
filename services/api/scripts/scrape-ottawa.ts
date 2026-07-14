import * as puppeteer from "puppeteer";
import admin from "firebase-admin";
import OpenAI from "openai";
import crypto from "crypto";

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
6. bool: A boolean indicating if the status is active (true) or inactive (false)

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
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    console.log("Loading Ottawa.ca main page...");
    await page.goto("https://ottawa.ca/en", {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    // Extract the status listing div
    console.log("Extracting status listings...");
    const statusListingDiv = await page.evaluate(() => {
      const div = document.querySelector(".view-status-listing");
      return div ? div.outerHTML : "";
    });

    if (!statusListingDiv) {
      throw new Error("Status listing div not found");
    }

    // Process status listings with GPT
    console.log("Processing status listings with GPT...");
    const statusListings = await processWithGPT(
      statusListingDiv,
      statusListingPrompt
    );

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

    // Get the main featured card link
    console.log("Finding main feature link...");
    const featureLink = await page.evaluate(() => {
      const linkElement = document.querySelector(".card-paragraph a");
      return linkElement ? linkElement.getAttribute("href") : null;
    });

    if (featureLink) {
      const fullUrl = featureLink.startsWith("http")
        ? featureLink
        : `https://ottawa.ca${featureLink}`;
      console.log(`Found feature link: ${fullUrl}`);

      // Navigate to the detailed page
      console.log("Loading detailed page...");
      await page.goto(fullUrl, {
        waitUntil: "networkidle2",
        timeout: 60000,
      });

      // Extract the content of the detailed page
      console.log("Extracting detailed page content...");
      const pageContent = await page.evaluate(() => {
        const mainContent = document.querySelector(".region-content");
        return mainContent ? mainContent.outerHTML : "";
      });

      if (pageContent) {
        // Process detailed page with GPT
        console.log("Processing detailed page with GPT...");
        const detailedInfo = await processWithGPT(
          pageContent,
          detailedPagePrompt
        );

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
  } finally {
    await browser.close();
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
