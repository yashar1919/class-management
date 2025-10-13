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

// PUT: آپدیت دانش‌آموز و برگرداندن سند به‌روز شده
export async function PUT(req: NextRequest) {
  const { id, data } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  // Add userId to the query for security
  const userId = data.userId;
  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const collection = await connectDB();

  // Update and return the updated document
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id), userId },
    { $set: data },
    { returnDocument: "after" } // Return the updated document
  );

  if (!result) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  // Convert _id to mongoId for consistency
  const updatedStudent = { ...result, mongoId: result._id };
  return NextResponse.json(updatedStudent);
}

// DELETE: حذف دانش‌آموز
export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  const collection = await connectDB();
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return NextResponse.json({ deletedCount: result.deletedCount });
}
