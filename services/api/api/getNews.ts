import type { VercelRequest, VercelResponse } from "@vercel/node";
import admin from "firebase-admin";
import { GetNewsResponseDTO, NewsDTO } from "@scopes/shared-types";

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
    // Fetch all news documents (consider pagination for large datasets)
    const snapshot = await firestore.collection("news").get();
    const newsItems: NewsDTO[] = snapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as NewsDTO)
    );
    res.status(200).json({ news: newsItems } satisfies GetNewsResponseDTO);
  } catch (error) {
    console.error("Error fetching news:", error);
    res.status(500).json({ error: "Error fetching news data." });
  }
}
