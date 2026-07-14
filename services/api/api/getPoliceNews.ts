// api/getPoliceNews.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import admin from "firebase-admin";

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
    // Query the policeNews collection, ordering by date descending
    const snapshot = await firestore
      .collection("policeNews")
      .orderBy("date", "desc")
      .get();

    const policeNewsItems = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json({ policeNews: policeNewsItems });
  } catch (error) {
    console.error("Error fetching police news:", error);
    res.status(500).json({ error: "Error fetching police news data." });
  }
}
