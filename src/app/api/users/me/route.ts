import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "classco_secret"
);

export async function GET(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;
  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return NextResponse.json({ email: payload.email });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
