import { NextResponse } from "next/server";

export async function GET() {
  try {
    const testNotification = {
      title: "🎓 کلاسکو - پیام خودکار",
      message: `تست هر 10 ثانیه - ${new Date().toLocaleTimeString("fa-IR")}`,
      url: "/class",
      icon: "/icon512_rounded.png",
      badge: "/icon512_maskable.png",
      requireInteraction: false,
    };

    // ارسال به API اصلی
    const sendResponse = await fetch(
      `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/notifications/send`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testNotification),
      }
    );

    if (!sendResponse.ok) {
      throw new Error("Failed to send notification");
    }

    const result = await sendResponse.json();

    return NextResponse.json({
      success: true,
      message: "Auto notification sent",
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (error) {
    console.error("[API] Auto notification error:", error);
    return NextResponse.json(
      {
        error: "Failed to send auto notification",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
