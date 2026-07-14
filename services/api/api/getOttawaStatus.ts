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
    // Get the most recent status listings
    const snapshot = await firestore
      .collection("ottawa_status")
      .orderBy("scrapedAt", "desc")
      .get();
    
    const statusItems = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.status(200).json({ status: statusItems });
  } catch (error) {
    console.error("Error fetching Ottawa status:", error);
    res.status(500).json({ error: "Error fetching Ottawa status data." });
  }
}
