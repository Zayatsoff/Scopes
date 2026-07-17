import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GetNewsResponseDTO, NewsDTO } from "@scopes/shared-types";
import { getCollection } from "../lib/firestore-repo";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    // Fetch all news documents (consider pagination for large datasets)
    const snapshot = await getCollection("news").get();
    const newsItems: NewsDTO[] = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as NewsDTO)
    );
    res.status(200).json({ news: newsItems } satisfies GetNewsResponseDTO);
  } catch (error) {
    console.error("Error fetching news:", error);
    res.status(500).json({ error: "Error fetching news data." });
  }
}
