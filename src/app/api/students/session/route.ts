import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI!;
const dbName = "studentsDataDB";
const collectionName = "students";

let client: MongoClient | null = null;
async function connectDB() {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  return client.db(dbName).collection(collectionName);
}

// PUT: آپدیت وضعیت یک جلسه خاص
export async function PUT(req: NextRequest) {
  const { mongoId, sessionId, attended, absent } = await req.json();
  const collection = await connectDB();

  // فقط مقدار attended و absent را برای session موردنظر آپدیت کن
  const result = await collection.updateOne(
    { _id: new ObjectId(mongoId), "sessions.id": sessionId },
    {
      $set: {
        "sessions.$.attended": attended,
        "sessions.$.absent": absent,
      },
    }
  );

  return NextResponse.json({ modifiedCount: result.modifiedCount });
}
