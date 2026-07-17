import type { VercelRequest, VercelResponse } from "@vercel/node";
import { CityStatusDTO, GetOttawaStatusResponseDTO } from "@scopes/shared-types";
import { getCollection } from "../lib/firestore-repo";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    // Get the most recent status listings
    const snapshot = await getCollection("ottawa_status")
      .orderBy("scrapedAt", "desc")
      .get();
    
    const statusItems: CityStatusDTO[] = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as CityStatusDTO)
    );

    res.status(200).json({ status: statusItems } satisfies GetOttawaStatusResponseDTO);
  } catch (error) {
    console.error("Error fetching Ottawa status:", error);
    res.status(500).json({ error: "Error fetching Ottawa status data." });
  }
}
