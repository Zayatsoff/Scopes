import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GetSummariesResponseDTO, SummaryDTO } from "@scopes/shared-types";
import { getCollection } from "../lib/firestore-repo";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    // Extract query parameters
    const { section } = req.query;

    // Build query based on parameters
    let query = getCollection("summaries").orderBy("date", "desc");
    
    // If section is specified, filter by it
    if (section && typeof section === "string") {
      query = query.where("section", "==", section);
    }
    
    // Execute the query
    const snapshot = await query.get();
    
    const summaries: SummaryDTO[] = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as SummaryDTO)
    );

    res.status(200).json({ summaries } satisfies GetSummariesResponseDTO);
  } catch (error) {
    console.error("Error fetching summaries:", error);
    res.status(500).json({ error: "Error fetching summaries data." });
  }
}
