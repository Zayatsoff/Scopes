import type { VercelRequest, VercelResponse } from "@vercel/node";
import admin from "firebase-admin";
import { formatInTimeZone } from "date-fns-tz";

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT as string)
    ),
  });
}

const firestore = admin.firestore();

// Eastern Time Zone identifier
const EASTERN_TIMEZONE = "America/New_York"; // Covers both EST and EDT

// Format date in Eastern Time Zone
function formatDateInEastern(date: Date): string {
  return formatInTimeZone(date, EASTERN_TIMEZONE, "yyyy-MM-dd");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Get today's date in Eastern Time
    const today = new Date();
    const todayFormatted = formatDateInEastern(today);

    // Document ID based on today's date
    const docId = `traffic_${todayFormatted}`;

    // Get the document for today's date
    const doc = await firestore.collection("trafficAlerts").doc(docId).get();

    if (!doc.exists) {
      // If today's document doesn't exist, try to get the most recent one
      const snapshot = await firestore
        .collection("trafficAlerts")
        .orderBy("scrapedAt", "desc")
        .limit(1)
        .get();

      if (snapshot.empty) {
        return res.status(404).json({ error: "No traffic alerts found." });
      }

      const latestDoc = snapshot.docs[0];
      return res.status(200).json({
        trafficAlerts: latestDoc.data(),
        note: "Showing most recent traffic alerts, not from today.",
      });
    }

    // Return today's traffic alerts
    res.status(200).json({ trafficAlerts: doc.data() });
  } catch (error) {
    console.error("Error fetching traffic alerts:", error);
    res.status(500).json({ error: "Error fetching traffic alerts data." });
  }
}
