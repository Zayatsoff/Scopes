import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GetWeatherAlertsResponseDTO, WeatherAlertDTO } from "@scopes/shared-types";
import { getCollection } from "../lib/firestore-repo";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    // Get the most recent weather alerts
    const snapshot = await getCollection("weatherAlerts")
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
