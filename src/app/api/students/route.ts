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

// POST: افزودن دانش‌آموز جدید
export async function POST(req: NextRequest) {
  const data = await req.json();
  if (!data.userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }
  const collection = await connectDB();
  const result = await collection.insertOne(data);
  return NextResponse.json({ insertedId: result.insertedId });
}

// GET: دریافت لیست دانش‌آموزان
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }
  const collection = await connectDB();
  const students = await collection.find({ userId }).toArray();
  return NextResponse.json(students);
}

// PUT: آپدیت وضعیت یک جلسه خاص
export async function PUT(req: NextRequest) {
  const { id, data } = await req.json();
  if (!id || !data.userId) {
    return NextResponse.json(
      { error: "id and userId are required" },
      { status: 400 }
    );
  }
  const collection = await connectDB();
  const result = await collection.updateOne(
    { _id: new ObjectId(id), userId: data.userId },
    { $set: data }
  );
  return NextResponse.json({ modifiedCount: result.modifiedCount });
}

// DELETE: حذف دانش‌آموز
export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  const collection = await connectDB();
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return NextResponse.json({ deletedCount: result.deletedCount });
}
