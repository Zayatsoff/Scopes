import type { VercelRequest, VercelResponse } from "@vercel/node";
import admin from "firebase-admin";
import { GetWeatherAlertsResponseDTO, WeatherAlertDTO } from "@scopes/shared-types";

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT as string)
    )
  });
}

const firestore = admin.firestore();

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    // Get the most recent weather alerts
    const snapshot = await firestore
      .collection("weatherAlerts")
      .orderBy("scrapedAt", "desc")
      .get();
    
    const weatherAlerts: WeatherAlertDTO[] = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as WeatherAlertDTO)
    );

    res.status(200).json({ weatherAlerts } satisfies GetWeatherAlertsResponseDTO);
  } catch (error) {
    console.error("Error fetching weather alerts:", error);
    res.status(500).json({ error: "Error fetching weather alerts data." });
  }
}
