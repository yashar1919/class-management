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
  const collection = await connectDB();
  const result = await collection.insertOne(data);
  return NextResponse.json({ insertedId: result.insertedId });
}

// GET: دریافت لیست دانش‌آموزان
export async function GET() {
  const collection = await connectDB();
  const students = await collection.find({}).toArray();
  return NextResponse.json(students);
}

// PUT: ویرایش دانش‌آموز
export async function PUT(req: NextRequest) {
  const { id, data } = await req.json();
  const collection = await connectDB();
  const result = await collection.updateOne(
    { _id: new ObjectId(id) },
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
