import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { MongoClient } from "mongodb";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "classco_secret"
);
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

export async function GET(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const collection = await connectDB();
    // جستجو با ایمیل یا شماره موبایل
    const user = await collection.findOne({
      $or: [
        { emailOrPhone: payload.emailOrPhone },
        { email: payload.emailOrPhone },
      ],
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    //remove password from output
    //eslint-disable-next-line
    const { password, ...userData } = user;
    return NextResponse.json(userData);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const collection = await connectDB();
    // حذف کاربر با ایمیل یا شماره موبایل
    const result = await collection.deleteOne({
      $or: [
        { emailOrPhone: payload.emailOrPhone },
        { email: payload.emailOrPhone },
      ],
    });
    // حذف کوکی توکن
    const response = NextResponse.json({
      success: true,
      deletedCount: result.deletedCount,
    });
    response.headers.set(
      "Set-Cookie",
      "access_token=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax"
    );
    return response;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
