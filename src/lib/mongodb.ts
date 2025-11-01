import { MongoClient, Db } from "mongodb";

// Global connection cache
let cachedClient: MongoClient | undefined;
let cachedDb: Db | undefined;

export async function connectToDatabase(): Promise<{
  client: MongoClient;
  db: Db;
}> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  const client = new MongoClient(process.env.MONGODB_URI, {
    maxPoolSize: 10, // Maximum number of connections in the pool
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
  });

  try {
    await client.connect();
    console.log("[DB] Connected to MongoDB");

    const db = client.db();

    cachedClient = client;
    cachedDb = db;

    return { client, db };
  } catch (error) {
    console.error("[DB] Failed to connect to MongoDB:", error);
    throw error;
  }
}

export async function closeDatabaseConnection(): Promise<void> {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = undefined;
    cachedDb = undefined;
    console.log("[DB] Disconnected from MongoDB");
  }
}
