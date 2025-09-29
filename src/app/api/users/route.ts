import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
//eslint-disable-next-line
const bcrypt = require("bcrypt");

const uri = process.env.MONGODB_URI!;
const dbName = "studentsDataDB";
const collectionName = "users";

let client: MongoClient | null = null;
async function connectDB() {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  return client.db(dbName).collection(collectionName);
}

// POST /api/users (Signup)
export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const collection = await connectDB();

  // آیا کاربر وجود دارد؟
  const existing = await collection.findOne({ email });
  if (existing) {
    return NextResponse.json({ error: "User already exists" }, { status: 409 });
  }

  // رمز را هش کن
  const hashed = await bcrypt.hash(password, 10);
  const result = await collection.insertOne({ email, password: hashed });
  return NextResponse.json({ insertedId: result.insertedId });
}

// PUT /api/users (Login)
export async function PUT(req: NextRequest) {
  const { email, password } = await req.json();
  const collection = await connectDB();

  const user = await collection.findOne({ email });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  // اینجا می‌توان توکن یا session بسازی (برای سادگی فقط پیام موفقیت می‌دهیم)
  return NextResponse.json({ success: true, email: user.email });
}
