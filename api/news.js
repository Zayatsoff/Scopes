import admin from 'firebase-admin';

// Initialize Firebase Admin (only if not already initialized)
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

export default async function handler(req, res) {
  try {
    const firestore = admin.firestore();
    const source = req.query.source;
    
    let query = firestore.collection('news').orderBy('date', 'desc').limit(100);
    
    // Add source filter if provided
    if (source) {
      query = query.where('source', '==', source);
    }
    
    const snapshot = await query.get();
    
    const news = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    res.status(200).json({ news });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Error fetching news data' });
  }
} 