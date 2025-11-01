import { NextResponse } from "next/server";

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      message: "Service Worker endpoint is working",
      timestamp: new Date().toISOString(),
      env: {
        hasVapidPublic: !!process.env.VAPID_PUBLIC_KEY,
        hasVapidPrivate: !!process.env.VAPID_PRIVATE_KEY,
        hasMongoDB: !!process.env.MONGODB_URI,
      },
    });
  } catch (error) {
    console.error("[API] Service Worker test error:", error);
    return NextResponse.json(
      {
        error: "Service Worker test failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
