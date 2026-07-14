import Parser from "rss-parser";
import admin from "firebase-admin";
import crypto from "crypto";
import OpenAI from "openai";

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
// Set Firestore configuration BEFORE any operations
firestore.settings({ ignoreUndefinedProperties: true });
console.log("Firestore configuration set with ignoreUndefinedProperties: true");

// Initialize OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Create an organization mapping.
// Extend or modify this list as needed.
const organizationMapping: { [domain: string]: string } = {
  "cbc.ca": "CBC News",
  "ottawacitizen.com": "Ottawa Citizen",
  "globalnews.ca": "Global News",
  "obj.ca": "Ottawa Business Journal",
};

// Create a parser with detailed headers
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

// RSS feeds to process along with their original URLs
const rssFeeds = [
  "https://www.cbc.ca/webfeed/rss/rss-canada-ottawa",
  "https://ottawacitizen.com/feed",
  "https://globalnews.ca/ottawa/feed/",
  "https://obj.ca/feed/",
];

// Available tags
const availableTags = [
  "politics",
  "science",
  "business",
  "community",
  "health",
  "sports",
];

// Sanitize a string for use as a document ID
function sanitizeForDocId(input: string): string {
  // Remove all slashes and other problematic characters
  return input.replace(/[/\\#?]/g, "-");
}

// Function to generate tags using OpenAI
async function generateTags(
  title: string,
  description: string
): Promise<string[]> {
  try {
    console.log("Generating tags for article...");

    const prompt = `
    Categorize the following news article into one or more of these categories: politics, science, business, community, health, sports.
    
    Return only the most relevant tags separated by commas (at least one tag, maximum two tags).
    
    Title: ${title}
    Description: ${description}
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a precise news categorizer that assigns appropriate tags to news articles.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
    });

    const tagText =
      response.choices[0]?.message?.content?.trim() || "community";

    // Parse the tags from the response and validate them
    const rawTags = tagText.split(",").map((tag) => tag.trim().toLowerCase());

    // Filter to only include valid tags from our available set
    const validTags = rawTags.filter((tag) => availableTags.includes(tag));

    // If no valid tags were found, default to "community"
    if (validTags.length === 0) {
      console.log("No valid tags returned by AI, defaulting to 'community'");
      return ["community"];
    }

    console.log(`Generated tags: ${validTags.join(", ")}`);
    return validTags;
  } catch (error) {
    console.error("Error generating tags:", error);
    // Default to community tag if there's an error
    return ["community"];
  }
}

// Simplified scraper
async function scrapeFeeds() {
  for (const feedUrl of rssFeeds) {
    console.log(`\n======= PROCESSING FEED: ${feedUrl} =======\n`);

    try {
      // Get feed data
      const feed = await parser.parseURL(feedUrl);
      console.log(`Successfully fetched feed: ${feed.title || feedUrl}`);
      console.log(`Found ${feed.items?.length || 0} items to process`);

      if (!feed.items || feed.items.length === 0) {
        console.log("No items found in feed, skipping");
        continue;
      }

      // Process each item in the feed
      for (const item of feed.items) {
        try {
          // Create a clean data object with only string values
          const data: Record<string, any> = {};

          // Determine the source using the organization mapping.
          try {
            const urlObj = new URL(feedUrl);
            let hostname = urlObj.hostname;
            // Remove 'www.' prefix if present
            if (hostname.startsWith("www.")) {
              hostname = hostname.substring(4);
            }
            data.source = organizationMapping[hostname] || hostname;
          } catch (e) {
            data.source = "unknown";
          }

          // Title
          if (item.title && typeof item.title === "string") {
            data.title = item.title.trim();
          }

          // Link
          if (item.link && typeof item.link === "string") {
            data.link = item.link.trim();
          }

          // Date - try isoDate first, then pubDate
          if (item.isoDate && typeof item.isoDate === "string") {
            data.date = item.isoDate.trim();
          } else if (item.pubDate && typeof item.pubDate === "string") {
            try {
              const date = new Date(item.pubDate);
              if (!isNaN(date.getTime())) {
                data.date = date.toISOString();
              }
            } catch (e) {
              // Skip date if invalid
            }
          }

          // Description
          if (item.contentSnippet && typeof item.contentSnippet === "string") {
            data.description = item.contentSnippet.trim();
          }

          // Author - explicitly handle with careful checks
          // Only add the authors field if we have a valid value.
          if (
            item.creator &&
            typeof item.creator === "string" &&
            item.creator.trim() !== ""
          ) {
            data.authors = item.creator.trim();
          } else if (
            item["dc:creator"] &&
            typeof item["dc:creator"] === "string" &&
            item["dc:creator"].trim() !== ""
          ) {
            data.authors = item["dc:creator"].trim();
          }
          // If no author was found, do NOT set data.authors at all.

          // Check if we have enough data to save
          if (!data.title && !data.description) {
            console.log("Skipping item without title or description");
            continue;
          }

          // Generate tags for the article
          const tags = await generateTags(
            data.title || "",
            data.description || ""
          );

          // Add tags to data object
          data.tags = tags;

          // Generate a document ID
          let idBase = "";
          if (item.guid && typeof item.guid === "string") {
            idBase = item.guid;
          } else if (item.link && typeof item.link === "string") {
            idBase = item.link;
          } else {
            idBase = `${data.source}-${Date.now()}-${Math.random()}`;
          }

          // Create a clean document ID (no slashes or special chars)
          const docId = crypto
            .createHash("md5")
            .update(sanitizeForDocId(idBase))
            .digest("hex");

          console.log(
            `Saving article: "${
              data.title || "(Untitled)"
            }" with ID: ${docId} and tags: ${data.tags.join(", ")}`
          );

          // Save to Firestore
          await firestore.collection("news").doc(docId).set(data);
          console.log("✓ Item saved successfully");
        } catch (itemError) {
          console.error("Error processing feed item:", itemError);
        }
      }
    } catch (feedError) {
      console.error(`Error processing feed ${feedUrl}:`, feedError);
    }
  }

  console.log("\n======= SCRAPING COMPLETED =======\n");
}

// Run the scraper
console.log("Starting RSS scraper...");
scrapeFeeds()
  .then(() => console.log("Scraper finished successfully"))
  .catch((error) => {
    console.error("Fatal error in scraper:", error);
    process.exit(1);
  });
