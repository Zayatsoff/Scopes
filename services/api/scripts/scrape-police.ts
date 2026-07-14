import admin from "firebase-admin";
import puppeteer from "puppeteer";
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
firestore.settings({ ignoreUndefinedProperties: true });

async function scrapePoliceNews() {
  const url = "https://www.ottawapolice.ca/modules/news/en";
  console.log("Starting Ottawa Police news scraper...");

  // Launch Puppeteer
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    // Set a realistic User-Agent to mimic a real browser
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );

    console.log(`Navigating to ${url}`);
    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    // Wait for the blog content container to be present on the page.
    console.log("Waiting for blog content container to load...");
    await page.waitForSelector("#blogContentContainer", { timeout: 30000 });

    // Now extract the HTML from the container.
    const blogContentHtml = await page.$eval(
      "#blogContentContainer",
      (el) => el.outerHTML
    );

    if (!blogContentHtml) {
      console.error("No blog content container found.");
      return;
    }

    console.log("Successfully extracted blog content HTML.");

    // Initialize OpenAI
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      console.error("OPENAI_API_KEY is not set in environment");
      process.exit(1);
    }
    const openai = new OpenAI({ apiKey: openaiApiKey });

    // Compose the prompt instruction for extracting blog posts.
    const systemPrompt =
      "You are an assistant that extracts blog posts information from HTML.";
    const userPrompt = `Extract the blog posts from the following HTML snippet.
Each blog post is contained within an element with class "blogItem". For each post extract the following fields:
• "title": the text content from the <h2> element (inside the <a> with class "newsTitle"),
• "link": the href attribute from the <a> element,
• "date": the date/time string from the element with class "blogPostDate" (convert it to ISO 8601 format if possible),
• "categories": an array of category names from the blogPostCategory section,
• "excerpt": a concise summary of the main excerpt text from the post's content (from the <p> tag).
Only process the posts that appear on the first page.
Return only a valid JSON array without any extra commentary.
Here is the HTML snippet:
${blogContentHtml}`;

    console.log("Sending HTML to OpenAI for processing...");
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.0,
    });

    let openaiResponse = completion.choices[0]?.message?.content;
    if (!openaiResponse) {
      console.error("No response received from OpenAI.");
      return;
    }

    // Clean the response:
    // 1. Remove markdown code fences if present.
    // 2. Remove extraneous asterisks.
    openaiResponse = openaiResponse
      .replace(/```json/gi, "")
      .replace(/```/gi, "")
      .replace(/\*+/g, "")
      .trim();

    let posts: Array<any>;
    try {
      posts = JSON.parse(openaiResponse);
    } catch (error) {
      console.error("Failed to parse JSON from OpenAI response:", openaiResponse);
      return;
    }
    console.log(`OpenAI extracted ${posts.length} post(s).`);

    // Process each post – skip posts with missing fields and avoid duplicates.
    for (const post of posts) {
      if (!post.title || !post.date) {
        console.log("Skipping post lacking title or date:", post);
        continue;
      }
      // Create a unique ID based on title and date.
      const uniqueStr = post.title + post.date;
      const docId = crypto.createHash("md5").update(uniqueStr).digest("hex");

      // Check for duplicates in Firestore (collection "policeNews")
      const docRef = firestore.collection("policeNews").doc(docId);
      const docSnap = await docRef.get();
      if (docSnap.exists) {
        console.log(`Post "${post.title}" already exists. Skipping.`);
        continue;
      }
      // Save the post data to Firestore.
      await docRef.set({
        ...post,
        scrapedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`Saved post "${post.title}" with ID: ${docId}`);
    }
    console.log("Ottawa Police news scraping completed.");
  } catch (error) {
    console.error("Error in Ottawa Police news scraper:", error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

// Execute the scraper
console.log("Starting Ottawa Police news scraper...");
scrapePoliceNews()
  .then(() => {
    console.log("Scraper finished successfully.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error in scraper:", error);
    process.exit(1);
  });
