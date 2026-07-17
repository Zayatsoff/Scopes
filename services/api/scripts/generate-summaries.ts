import admin from "firebase-admin";
import OpenAI from "openai";
import { format, isToday } from "date-fns";
import { toZonedTime, formatInTimeZone } from "date-fns-tz";
import { SummaryDTO } from "@scopes/shared-types";
import { getCollection } from "../lib/firestore-repo";

type SummaryWrite = Omit<SummaryDTO, "id" | "generatedAt"> & {
  generatedAt: FirebaseFirestore.FieldValue;
};

// Eastern Time Zone identifier
const EASTERN_TIMEZONE = "America/New_York"; // Covers both EST and EDT with automatic switching

// Initialize OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Format date in Eastern Time Zone
function formatDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return formatInTimeZone(dateObj, EASTERN_TIMEZONE, "yyyy-MM-dd");
}

// Get today's date formatted in Eastern Time
const todayFormatted = formatDate(new Date());

async function generatePoliceSummary() {
  console.log("Starting police news summary generation...");

  try {
    // Get the most recent police news items (limited to 10)
    const snapshot = await getCollection("policeNews")
      .orderBy("date", "desc")
      .limit(10)
      .get();

    const newsItems = snapshot.docs.map((doc) => doc.data());

    if (newsItems.length === 0) {
      console.log("No police news items found to summarize");
      return;
    }

    console.log(`Found ${newsItems.length} police news items to summarize`);

    // Use today's date for the summary
    const summaryDate = todayFormatted;
    console.log(`Generating summary for date: ${summaryDate}`);

    // Prepare content for GPT
    const newsContent = newsItems
      .map(
        (item) =>
          `Title: ${item.title || "Untitled"}\nDate: ${
            item.date || "Unknown"
          }\nExcerpt: ${item.excerpt || "No excerpt available"}`
      )
      .join("\n\n");

    // Create prompt for GPT
    const prompt = `
    Summarize the following police news items into exactly 2 bullet points. 
    Focus on the most important or impactful information for Ottawa residents.
    Each bullet point should be concise (maximum 15 words).
    
    Here are the news items:
    ${newsContent}
    `;

    console.log("Sending request to OpenAI for police news summarization...");
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a precise news summarizer that creates brief, informative bullet points for local residents.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
    });

    const summary = response.choices[0]?.message?.content?.trim();

    if (!summary) {
      throw new Error("No summary received from OpenAI for police news");
    }

    console.log("Successfully generated police summary:", summary);

    // Create document ID based on section and date
    const docId = `Police_${summaryDate}`;

    // Save to Firestore (set will replace if document exists)
    const summaryWrite: SummaryWrite = {
      section: "Police",
      date: summaryDate,
      summary: summary,
      generatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await getCollection("summaries").doc(docId).set(summaryWrite);

    console.log(
      `Successfully saved police summary to Firestore with ID: ${docId}`
    );
  } catch (error) {
    console.error("Error generating police news summary:", error);
    throw error;
  }
}

async function generateWeatherSummary() {
  console.log("Starting weather alerts summary generation...");

  try {
    // Query all weather alerts from the collection without a date filter
    const snapshot = await getCollection("weatherAlerts")
      .orderBy("alertTime", "desc")
      .get();

    // Remove the filtering based on alertTime so that all alerts are included
    const alertItems = snapshot.docs.map((doc) => doc.data());

    console.log(
      `Found ${alertItems.length} weather alerts in the collection to summarize`
    );

    if (alertItems.length === 0) {
      console.log("No weather alerts found to summarize");
      return;
    }

    // Use today's date for the summary
    const summaryDate = todayFormatted;
    console.log(`Generating summary for date: ${summaryDate}`);

    // Prepare content for GPT
    const alertContent = alertItems
      .map(
        (item) =>
          `Title: ${item.title || "Untitled"}\nDate: ${
            item.date || "Unknown"
          }\nDescription: ${
            item.description || "No description available"
          }\nSeverity: ${item.severity || "Unknown"}`
      )
      .join("\n\n");

    // Create prompt for GPT
    const prompt = `
    Summarize the following weather alerts into exactly 2 bullet points. 
    Focus on the most important or impactful information for Ottawa residents.
    Each bullet point should be concise (maximum 15 words).
    If there are warnings or safety concerns, prioritize those.
    
    Here are the weather alerts:
    ${alertContent}
    `;

    console.log(
      "Sending request to OpenAI for weather alerts summarization..."
    );
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a precise weather alert summarizer that creates brief, informative bullet points for local residents.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
    });

    const summary = response.choices[0]?.message?.content?.trim();

    if (!summary) {
      throw new Error("No summary received from OpenAI for weather alerts");
    }

    console.log("Successfully generated weather summary:", summary);

    // Create document ID based on section and date
    const docId = `Weather_${summaryDate}`;

    // Save to Firestore (set will replace if document exists)
    const summaryWrite: SummaryWrite = {
      section: "Weather",
      date: summaryDate,
      summary: summary,
      generatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await getCollection("summaries").doc(docId).set(summaryWrite);

    console.log(
      `Successfully saved weather summary to Firestore with ID: ${docId}`
    );
  } catch (error) {
    console.error("Error generating weather alerts summary:", error);
    throw error;
  }
}

async function generateTrafficSummary() {
  console.log("Starting traffic alerts summary generation...");

  try {
    // Get the most recent traffic alerts document
    const snapshot = await getCollection("trafficAlerts")
      .orderBy("scrapedAt", "desc")
      .limit(1)
      .get();

    if (snapshot.empty) {
      console.log("No traffic alerts found");
      return;
    }

    const trafficData = snapshot.docs[0].data();

    // Extract the events from the JSON structure
    const alertItems = trafficData.events || [];

    console.log(`Found ${alertItems.length} traffic events to summarize`);

    if (alertItems.length === 0) {
      console.log("No traffic events found to summarize");
      return;
    }

    // Use today's date for the summary
    const summaryDate = todayFormatted;
    console.log(`Generating summary for date: ${summaryDate}`);

    // Create prompt for GPT with today's date explicitly included
    const prompt = `
    Today is ${formatInTimeZone(
      new Date(),
      EASTERN_TIMEZONE,
      "MMMM d, yyyy"
    )} in Ottawa (Eastern Time).
    
    Summarize the following traffic alerts into exactly 2 bullet points for Ottawa residents.
    PRIORITIZE ANY CRASHES, ACCIDENTS, AND COLLISIONS FIRST, then major closures or lane reductions.
    Each bullet point should be concise (maximum 15 words).
    
    Here are the current traffic alerts:
    ${alertItems
      .map(
        (item: {
          eventType: any;
          improvedHeadline: any;
          headline: any;
          message: any;
          status: any;
          priority: any;
        }) =>
          `Type: ${item.eventType || "Unknown"}\n` +
          `Headline: ${item.improvedHeadline || item.headline || "Unknown"}\n` +
          `Details: ${item.message || "No details available"}\n` +
          `Status: ${item.status || "Unknown"}\n` +
          `Priority: ${item.priority || "Unknown"}`
      )
      .join("\n\n")}
    `;

    console.log(
      "Sending request to OpenAI for traffic alerts summarization..."
    );
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a precise traffic alert summarizer that creates brief, informative bullet points for local residents.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
    });

    const summary = response.choices[0]?.message?.content?.trim();

    if (!summary) {
      throw new Error("No summary received from OpenAI for traffic alerts");
    }

    console.log("Successfully generated traffic summary:", summary);

    // Create document ID based on section and date
    const docId = `Traffic_${summaryDate}`;

    // Save to Firestore (set will replace if document exists)
    const summaryWrite: SummaryWrite = {
      section: "Traffic",
      date: summaryDate,
      summary: summary,
      generatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await getCollection("summaries").doc(docId).set(summaryWrite);

    console.log(
      `Successfully saved traffic summary to Firestore with ID: ${docId}`
    );
  } catch (error) {
    console.error("Error generating traffic alerts summary:", error);
    throw error;
  }
}

// Execute all summary generators
async function generateAllSummaries() {
  console.log(
    `Starting summary generation process for Eastern Time date: ${todayFormatted}`
  );

  try {
    await generatePoliceSummary();
    await generateWeatherSummary();
    await generateTrafficSummary(); // Added traffic summary generation
    console.log("All summaries generated successfully");
  } catch (error) {
    console.error("Error in summary generation:", error);
    throw error;
  }
}

// Execute the main function
console.log(
  `Starting summary generator for Eastern Time date: ${todayFormatted}`
);
generateAllSummaries()
  .then(() => {
    console.log("Summary generation completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error in summary generator:", error);
    process.exit(1);
  });
