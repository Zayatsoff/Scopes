import admin from "firebase-admin";

// dev is the safe default -> collections only resolve unsuffixed when the
// env explicitly opts into production, so a missing/misconfigured env var
// can never accidentally read or write real data
export function resolveCollectionName(
  name: string,
  env: string | undefined
): string {
  return env === "production" ? name : `${name}_dev`;
}

let firestore: admin.firestore.Firestore | undefined;

export function getFirestore(): admin.firestore.Firestore {
  if (!firestore) {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(
          JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT as string)
        ),
      });
    }
    firestore = admin.firestore();
    firestore.settings({ ignoreUndefinedProperties: true });
  }
  return firestore;
}

export function getCollection(
  name: string
): admin.firestore.CollectionReference {
  return getFirestore().collection(
    resolveCollectionName(name, process.env.FIRESTORE_ENV)
  );
}
