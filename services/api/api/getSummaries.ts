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
    // Extract query parameters
    const { section } = req.query;
    
    // Build query based on parameters
    let query = firestore.collection("summaries").orderBy("date", "desc");
    
    // If section is specified, filter by it
    if (section && typeof section === "string") {
      query = query.where("section", "==", section);
    }
    
    // Execute the query
    const snapshot = await query.get();
    
    const summaries = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.status(200).json({ summaries });
  } catch (error) {
    console.error("Error fetching summaries:", error);
    res.status(500).json({ error: "Error fetching summaries data." });
  }
}
