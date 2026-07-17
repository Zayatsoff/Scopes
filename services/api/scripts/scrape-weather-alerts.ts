import Parser from "rss-parser";
import puppeteer from "puppeteer";
import admin from "firebase-admin";
import OpenAI from "openai";
import crypto from "crypto";
import { WeatherAlertDTO } from "@scopes/shared-types";
import { getCollection } from "../lib/firestore-repo";

type WeatherAlertWrite = Omit<WeatherAlertDTO, "id" | "scrapedAt"> & {
  scrapedAt: FirebaseFirestore.FieldValue;
};

type WeatherAlertGptFields = Partial<
  Pick<
    WeatherAlertDTO,
    "title" | "summary" | "locationsAffected" | "effectiveTime" | "alertTime"
  >
>;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Create RSS parser
const parser = new Parser({
  requestOptions: {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml,application/rss+xml;q=0.9,image/webp,*/*;q=0.8",
    },
    timeout: 10000,
  },
});

// RSS feed URL for Environment Canada weather alerts (Ottawa coordinates)
const WEATHER_ALERTS_RSS =
  "https://weather.gc.ca/rss/alerts/45.403_-75.687_e.xml";

// Create a hash for document ID
function createDocId(content: string): string {
  return crypto.createHash("md5").update(content).digest("hex");
}

// Function to clear the "weatherAlerts" collection.
async function clearWeatherAlertsCollection() {
  console.log("Clearing weatherAlerts collection...");
  const collectionRef = getCollection("weatherAlerts");
  const snapshot = await collectionRef.get();
  const deletePromises = snapshot.docs.map((doc) => doc.ref.delete());
  await Promise.all(deletePromises);
  console.log("weatherAlerts collection cleared.");
}

// Process HTML content with GPT to extract structured information.
async function processWithGPT(content: string): Promise<any> {
  try {
    const prompt = `
Extract the following information from this Environment Canada weather alert page:
1. Alert title (create your own title)
2. Alert summary (a concise summary of the alert)
3. Locations affected (list all areas/regions mentioned)
4. When this alert takes effect (start time)
5. Time of alert (when it was issued)

Return the data as a valid JSON object with these fields:
- title
- summary
- locationsAffected (as an array)
- effectiveTime
- alertTime

Only extract the factual information present in the HTML. If any field is not clearly present, set it to null.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that extracts structured data from weather alert HTML content.",
        },
        {
          role: "user",
          content: prompt + "\n\nHTML content:\n" + content,
        },
      ],
      temperature: 0.2,
    });

    const jsonText = response.choices[0]?.message?.content || "";
    // Extract JSON from the response.
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in the GPT response");
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Error processing with GPT:", error);
    throw error;
  }
}

async function scrapeWeatherAlerts() {
  console.log("Starting weather alerts scraper...");

  // Empty the weatherAlerts collection before processing new alerts.
  await clearWeatherAlertsCollection();

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    // Fetch RSS feed.
    console.log(`Fetching weather alerts from: ${WEATHER_ALERTS_RSS}`);
    const feed = await parser.parseURL(WEATHER_ALERTS_RSS);
    console.log(`Found ${feed.items?.length || 0} alert items`);

    if (!feed.items || feed.items.length === 0) {
      console.log("No weather alerts found. Exiting.");
      return;
    }

    // Process each alert.
    for (const item of feed.items) {
      try {
        if (!item.link) {
          console.warn("Alert item has no link. Skipping.");
          continue;
        }

        // If the alert title indicates there are no active warnings,
        // process the item directly.
        if (
          item.title &&
          (item.title.toLowerCase().includes("no watches") ||
            item.title.toLowerCase().includes("no warnings"))
        ) {
          console.log(
            "Special 'no active alerts' message detected, processing without browser scraping."
          );
          const docId = createDocId(
            (item.title || "") + (item.link || "") + (item.pubDate || "")
          );

          const alertItem: WeatherAlertWrite = {
            title: item.title,
            link: item.link,
            pubDate: item.pubDate,
            isoDate: item.isoDate,
            summary: item.summary, // Uses the feed-provided summary.
            locationsAffected: [],
            effectiveTime: null,
            alertTime: (item as any).updated || item.pubDate,
            type: "weatherAlert",
            scrapedAt: admin.firestore.FieldValue.serverTimestamp(),
          };

          await getCollection("weatherAlerts").doc(docId).set(alertItem);
          console.log(`Successfully saved special alert: ${alertItem.title}`);
          continue;
        }

        // Otherwise, process the alert using Puppeteer and GPT.
        console.log(`Processing alert: ${item.title}`);
        console.log(`Alert link: ${item.link}`);

        // Create a document ID based on title, link, and publication date.
        const docId = createDocId(
          (item.title || "") + (item.link || "") + (item.pubDate || "")
        );

        // Visit the alert page to get full HTML content.
        const page = await browser.newPage();
        await page.setUserAgent(
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        );

        console.log(`Navigating to alert page: ${item.link}`);
        await page.goto(item.link, {
          waitUntil: "networkidle2",
          timeout: 60000,
        });

        // Extract the main content of the page.
        const content = await page.evaluate(() => {
          const mainContent = document.querySelector("main");
          return mainContent ? mainContent.outerHTML : document.body.outerHTML;
        });

        await page.close();

        if (!content) {
          console.warn("Could not extract content from alert page. Skipping.");
          continue;
        }

        console.log("Processing HTML with GPT...");
        const alertData = (await processWithGPT(content)) as WeatherAlertGptFields;

        // Combine the RSS data with the GPT-extracted data.
        const alertItem: WeatherAlertWrite = {
          title: alertData.title || item.title,
          link: item.link,
          pubDate: item.pubDate,
          isoDate: item.isoDate,
          summary: alertData.summary,
          locationsAffected: alertData.locationsAffected || [],
          effectiveTime: alertData.effectiveTime,
          alertTime: alertData.alertTime,
          type: "weatherAlert",
          scrapedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        await getCollection("weatherAlerts").doc(docId).set(alertItem);
        console.log(`Successfully saved alert: ${alertItem.title}`);
      } catch (alertError) {
        console.error(`Error processing alert: ${item.title}`, alertError);
      }
    }

    console.log("Weather alerts scraping completed successfully");
  } catch (error) {
    console.error("Error in weather alerts scraper:", error);
    throw error;
  } finally {
    await browser.close();
  }
}

// Execute the scraper.
scrapeWeatherAlerts()
  .then(() => {
    console.log("Weather alerts scraper finished successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error in weather alerts scraper:", error);
    process.exit(1);
  });
