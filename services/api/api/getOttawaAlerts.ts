import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GetOttawaAlertsResponseDTO, StatusStoryDTO } from "@scopes/shared-types";
import { getCollection } from "../lib/firestore-repo";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    // Get the most recent alerts
    const snapshot = await getCollection("ottawa_story")
      .orderBy("scrapedAt", "desc")
      .get();
    
    const alertItems: StatusStoryDTO[] = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as StatusStoryDTO)
    );

    res.status(200).json({ alerts: alertItems } satisfies GetOttawaAlertsResponseDTO);
  } catch (error) {
    console.error("Error fetching Ottawa alerts:", error);
    res.status(500).json({ error: "Error fetching Ottawa alerts data." });
  }
}
