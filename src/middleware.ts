import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "classco_secret"
);

const protectedRoutes = [
  "/class",
  "/info",
  "/profile",
  "/reports",
  "/lesson-plan",
  "/settings",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  console.log("MIDDLEWARE: pathname =", pathname);

  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    const token = req.cookies.get("access_token")?.value;
    console.log("MIDDLEWARE: access_token =", token);

    if (!token) {
      console.log("MIDDLEWARE: No token, redirecting to /login");
      return NextResponse.redirect(new URL("/login", req.url));
    }
    try {
      await jwtVerify(token, JWT_SECRET);
      console.log("MIDDLEWARE: JWT verified");
      return NextResponse.next();
    } catch (err) {
      console.log("MIDDLEWARE: JWT ERROR =", err);
      return NextResponse.redirect(new URL("/login", req.url));
    }
  } else {
    console.log("MIDDLEWARE: Public route, passing through");
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/class/:path*",
    "/info/:path*",
    "/profile/:path*",
    "/reports/:path*",
    "/lesson-plan/:path*",
    "/settings/:path*",
  ],
};
