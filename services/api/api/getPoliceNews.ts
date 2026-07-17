// api/getPoliceNews.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GetPoliceNewsResponseDTO, PoliceNewsDTO } from "@scopes/shared-types";
import { getCollection } from "../lib/firestore-repo";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    // Query the policeNews collection, ordering by date descending
    const snapshot = await getCollection("policeNews")
      .orderBy("date", "desc")
      .get();

    const policeNewsItems: PoliceNewsDTO[] = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as PoliceNewsDTO)
    );

    res.status(200).json({ policeNews: policeNewsItems } satisfies GetPoliceNewsResponseDTO);
  } catch (error) {
    console.error("Error fetching police news:", error);
    res.status(500).json({ error: "Error fetching police news data." });
  }
}
