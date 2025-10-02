import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
//eslint-disable-next-line
const bcrypt = require("bcrypt");
import { SignJWT } from "jose";
import { serialize } from "cookie";
import { sendWelcomeEmail } from "@/services/emailService";
import { sendWelcomeSMS } from "@/services/smsService";

const uri = process.env.MONGODB_URI!;
const dbName = "studentsDataDB";
const collectionName = "users";

const JWT_SECRET = process.env.JWT_SECRET || "classco_secret";
const JWT_EXPIRE = 60 * 60 * 24 * 30; // 30 روز

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
  const { firstname, lastname, emailOrPhone, gender, birthDate, password } =
    await req.json();

  const collection = await connectDB();

  // چک وجود کاربر با ایمیل یا موبایل
  const existing = await collection.findOne({
    $or: [
      { emailOrPhone: emailOrPhone },
      { email: emailOrPhone }, // اگر قبلاً با email ذخیره شده باشد
    ],
  });
  if (existing) {
    return NextResponse.json(
      { error: "کاربری با این ایمیل یا شماره موبایل وجود دارد" },
      { status: 409 }
    );
  }

  // رمز را هش کن
  const hashed = await bcrypt.hash(password, 10);

  // ذخیره اطلاعات کامل کاربر
  const result = await collection.insertOne({
    firstname,
    lastname,
    emailOrPhone,
    gender,
    birthDate,
    password: hashed,
    createdAt: new Date(),
  });

  // بعد از ثبت موفق کاربر:
  if (/^09\d{9}$/.test(emailOrPhone)) {
    // اگر شماره موبایل بود
    try {
      await sendWelcomeSMS({
        to: emailOrPhone,
        firstname: firstname,
        lastname: lastname,
      });
      console.log("Welcome SMS sent to:", emailOrPhone);
    } catch (e) {
      console.error("Failed to send welcome SMS:", e);
    }
  } else if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrPhone)) {
    // اگر ایمیل بود
    try {
      await sendWelcomeEmail({
        to: emailOrPhone,
        firstname,
        lastname,
      });
      console.log("Welcome email sent to:", emailOrPhone);
    } catch (e) {
      console.error("Failed to send welcome email:", e);
    }
  }

  return NextResponse.json({ insertedId: result.insertedId });
}

// PUT /api/users (Login)
export async function PUT(req: NextRequest) {
  const { emailOrPhone, password } = await req.json();
  const collection = await connectDB();

  // جستجو با ایمیل یا شماره موبایل
  const user = await collection.findOne({
    $or: [
      { emailOrPhone: emailOrPhone },
      { email: emailOrPhone }, // اگر قبلاً با email ذخیره شده باشد
    ],
  });

  if (!user) {
    return NextResponse.json(
      { error: "User is not found :(" },
      { status: 404 }
    );
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return NextResponse.json(
      { error: "Incorrect your password❌" },
      { status: 401 }
    );
  }

  // ساخت JWT با jose
  const secret = new TextEncoder().encode(JWT_SECRET);
  const token = await new SignJWT({ emailOrPhone: user.emailOrPhone })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(`${JWT_EXPIRE}s`)
    .sign(secret);

  // ست کردن کوکی HttpOnly
  const cookie = serialize("access_token", token, {
    httpOnly: true,
    path: "/",
    maxAge: JWT_EXPIRE,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  const response = NextResponse.json({
    success: true,
    emailOrPhone: user.emailOrPhone,
  });
  response.headers.set("Set-Cookie", cookie);

  return response;
}

// PATCH /api/users (Edit Profile)
export async function PATCH(req: NextRequest) {
  const { firstname, lastname, emailOrPhone, gender, birthDate, newPassword } =
    await req.json();
  const collection = await connectDB();

  const user = await collection.findOne({
    $or: [{ emailOrPhone: emailOrPhone }, { email: emailOrPhone }],
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  //eslint-disable-next-line
  const updateFields: any = {
    firstname,
    lastname,
    emailOrPhone,
    gender,
    birthDate,
    updatedAt: new Date(),
  };

  if (newPassword && newPassword.length >= 4) {
    const hashed = await bcrypt.hash(newPassword, 10);
    updateFields.password = hashed;
  }

  await collection.updateOne({ _id: user._id }, { $set: updateFields });

  const updatedUser = await collection.findOne({ _id: user._id });
  return NextResponse.json(updatedUser);
}
/* export async function PUT(req: NextRequest) {
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

  // ساخت JWT با jose
  const secret = new TextEncoder().encode(JWT_SECRET);
  const token = await new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(`${JWT_EXPIRE}s`)
    .sign(secret);

  // ست کردن کوکی HttpOnly
  const cookie = serialize("access_token", token, {
    httpOnly: true,
    path: "/",
    maxAge: JWT_EXPIRE,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  const response = NextResponse.json({ success: true, email: user.email });
  response.headers.set("Set-Cookie", cookie);

  return response;
} */
