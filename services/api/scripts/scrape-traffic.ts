import axios from "axios";
import OpenAI from "openai";
import { formatInTimeZone } from "date-fns-tz";
import { TrafficAlertsDocDTO, TrafficEventDTO } from "@scopes/shared-types";
import { getCollection } from "../lib/firestore-repo";

// Initialize OpenAI API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Eastern Time Zone identifier
const EASTERN_TIMEZONE = "America/New_York"; // Covers both EST and EDT

// Format date in Eastern Time Zone
function formatDateInEastern(date: Date, formatStr: string): string {
  return formatInTimeZone(date, EASTERN_TIMEZONE, formatStr);
}

// Traffic data endpoint
const TRAFFIC_API_URL =
  "https://traffic.ottawa.ca/map/service/events?accept-language=en";

// List of roads to check
const ROADS_TO_CHECK = [
  "Queensway",
  "Highway 417",
  "417",
  "Carling Avenue",
  "Carling",
  "Bronson Avenue",
  "Bronson",
  "Hunt Club Road",
  "Hunt Club",
  "Bank Street",
  "Bank St",
  "Bank",
  "Merivale Road",
  "Merivale",
  "Innes Road",
  "Innes",
  "Highway 416",
  "416",
  "Eagleson Road",
  "Eagleson",
  "Fallowfield Road",
  "Fallowfield",
  "Wellington St",
  "Wellington",
];

// Function to generate improved headlines for traffic events
async function generateImprovedHeadlines(
  events: TrafficEventDTO[]
): Promise<TrafficEventDTO[]> {
  if (events.length === 0) return events;

  console.log("Generating improved headlines for traffic events...");

  const eventsWithDetails = events.map((event) => ({
    id: event.id,
    message: event.message || "",
    originalHeadline: event.headline || "",
    eventType: event.eventType || "",
    status: event.status || "",
    cause: event.cause || "",
  }));

  const prompt = `
  I have a list of traffic events with details. For each event, create a concise, clear headline 
  that summarizes the key information about the traffic incident or situation.
  
  The headline should:
  - Be under 60 characters when possible
  - Mention the specific road or location
  - Include the type of incident or status (closure, delay, construction, etc.)
  - Be formatted for public consumption
  
  Return the results as a JSON array with each object having:
  - id: The original event ID
  - headline: The new, improved headline
  
  Here are the events:
  ${JSON.stringify(eventsWithDetails, null, 2)}
  `;

  try {
    const openaiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a traffic information specialist who creates clear, concise headlines for traffic alerts.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
    });

    const content = openaiResponse.choices[0]?.message?.content?.trim();

    if (!content) {
      throw new Error(
        "No response received from OpenAI for headline generation"
      );
    }

    // Extract JSON array from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("No valid JSON array found in the GPT headline response");
    }

    const newHeadlines = JSON.parse(jsonMatch[0]);
    console.log(`Generated ${newHeadlines.length} improved headlines`);

    // Update original events with new headlines
    const updatedEvents = events.map((event) => {
      const newHeadlineData = newHeadlines.find((h: any) => h.id === event.id);
      if (newHeadlineData) {
        return {
          ...event,
          improvedHeadline: newHeadlineData.headline,
        };
      }
      return event;
    });

    return updatedEvents;
  } catch (error) {
    console.error("Error generating improved headlines:", error);
    // Return original events if headline generation fails
    return events;
  }
}

async function scrapeTrafficAlerts() {
  console.log("Starting traffic alerts scraper...");

  try {
    // Fetch traffic data
    console.log(`Fetching traffic data from: ${TRAFFIC_API_URL}`);
    const apiResponse = await axios.get(TRAFFIC_API_URL);
    const trafficData = apiResponse.data;

    if (
      !trafficData ||
      !trafficData.events ||
      !Array.isArray(trafficData.events)
    ) {
      console.error("Invalid traffic data format received");
      return;
    }

    console.log(`Received ${trafficData.events.length} traffic events`);

    // Extract messages and IDs for OpenAI to process
    const eventMessages = trafficData.events.map((event: TrafficEventDTO) => ({
      id: event.id,
      message: event.message || "",
    }));

    // Create prompt for OpenAI
    const prompt = `
    I have a list of traffic events with IDs and messages. I need you to identify which events mention any of these roads:
    ${ROADS_TO_CHECK.join(", ")}
    
    For each event that mentions any of these roads, return ONLY the ID number.
    Return the list of IDs as a JSON array like this: [123, 456, 789]
    Do not include explanations, just return the array.
    
    Here are the events:
    ${JSON.stringify(eventMessages)}
    `;

    console.log("Sending request to OpenAI for traffic event filtering...");
    const openaiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a precise traffic data analyzer. You only respond with a JSON array of IDs for events that mention specific roads.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.1,
    });

    const content = openaiResponse.choices[0]?.message?.content?.trim();

    if (!content) {
      throw new Error("No response received from OpenAI");
    }

    // Extract JSON array from response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("No valid JSON array found in the GPT response");
    }

    let relevantIds: (string | number)[];
    try {
      relevantIds = JSON.parse(jsonMatch[0]);
      console.log(
        `OpenAI identified ${relevantIds.length} events mentioning target roads`
      );
    } catch (error) {
      console.error("Failed to parse IDs from OpenAI response:", error);
      throw error;
    }

    // Filter events based on IDs returned by GPT
    const relevantEvents = trafficData.events.filter((event: TrafficEventDTO) =>
      relevantIds.includes(event.id)
    );

    console.log(
      `Found ${relevantEvents.length} events mentioning target roads`
    );

    if (relevantEvents.length === 0) {
      console.log("No relevant traffic events found. Nothing to save.");
      return;
    }

    // Generate improved headlines for relevant events
    const eventsWithImprovedHeadlines = await generateImprovedHeadlines(
      relevantEvents
    );

    // Get current time in Eastern Time Zone
    const now = new Date();
    const easternDate = formatDateInEastern(now, "yyyy-MM-dd");
    const easternTime = formatDateInEastern(now, "yyyy-MM-dd'T'HH:mm:ssXXX");

    // Create document with today's date
    const docId = `traffic_${easternDate}`;

    // Save to Firestore (will replace if document already exists)
    const docBody: TrafficAlertsDocDTO = {
      events: eventsWithImprovedHeadlines,
      scrapedAt: easternTime,
      date: easternDate,
    };
    await getCollection("trafficAlerts").doc(docId).set(docBody);

    console.log(
      `Successfully saved ${eventsWithImprovedHeadlines.length} traffic alerts to Firestore with ID: ${docId}`
    );
  } catch (error) {
    console.error("Error in traffic alerts scraper:", error);
    throw error;
  }
}

// Execute the scraper
console.log(
  `Starting traffic alerts scraper at ${formatDateInEastern(
    new Date(),
    "yyyy-MM-dd HH:mm:ss"
  )}`
);
scrapeTrafficAlerts()
  .then(() => {
    console.log("Traffic alerts scraper finished successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error in traffic alerts scraper:", error);
    process.exit(1);
  });
