import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import webpush from "web-push";

const client = new MongoClient(process.env.MONGODB_URI as string);

// Configure web-push
webpush.setVapidDetails(
  "mailto:" + (process.env.VAPID_EMAIL || "admin@classco.app"),
  process.env.VAPID_PUBLIC_KEY as string,
  process.env.VAPID_PRIVATE_KEY as string
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title = "کلاسکو",
      message = "شما پیام جدیدی دارید!",
      url = "/",
      icon = "/icon512_rounded.png",
      badge = "/icon512_maskable.png",
      tag = "classco-notification",
      requireInteraction = true,
      targetEndpoint = null, // اگر null باشد، به همه ارسال می‌شود
    } = body;

    // Connect to MongoDB
    await client.connect();
    const db = client.db();
    const subscriptions = db.collection("push_subscriptions");

    // Get active subscriptions
    const query = targetEndpoint
      ? { endpoint: targetEndpoint, isActive: true }
      : { isActive: true };

    const activeSubscriptions = await subscriptions.find(query).toArray();

    if (activeSubscriptions.length === 0) {
      return NextResponse.json(
        { error: "No active subscriptions found" },
        { status: 404 }
      );
    }

    // Prepare notification payload
    const notificationPayload = JSON.stringify({
      title,
      body: message,
      icon,
      badge,
      tag,
      url,
      requireInteraction,
      vibrate: [200, 100, 200],
      timestamp: Date.now(),
      actions: [
        {
          action: "view",
          title: "مشاهده",
          icon: "/icon512_maskable.png",
        },
        {
          action: "dismiss",
          title: "بستن",
        },
      ],
    });

    // Send notifications to all active subscriptions
    const sendPromises = activeSubscriptions.map(async (subscription) => {
      try {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: subscription.keys,
        };

        await webpush.sendNotification(pushSubscription, notificationPayload);

        // Update last sent timestamp
        await subscriptions.updateOne(
          { _id: subscription._id },
          { $set: { lastSentAt: new Date() } }
        );

        return { success: true, endpoint: subscription.endpoint };
      } catch (error) {
        console.error(
          "[API] Failed to send to:",
          subscription.endpoint.substring(0, 50),
          error
        );

        // If subscription is invalid, mark as inactive
        if (
          error instanceof Error &&
          (error.message.includes("410") || error.message.includes("invalid"))
        ) {
          await subscriptions.updateOne(
            { _id: subscription._id },
            { $set: { isActive: false, errorAt: new Date() } }
          );
        }

        return {
          success: false,
          endpoint: subscription.endpoint,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    });

    const results = await Promise.all(sendPromises);
    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    console.log(
      `[API] Notifications sent: ${successful} successful, ${failed} failed`
    );

    return NextResponse.json({
      success: true,
      message: `Notifications sent to ${successful} subscribers`,
      details: {
        total: activeSubscriptions.length,
        successful,
        failed,
        results: results.map((r) => ({
          endpoint: r.endpoint.substring(0, 50) + "...",
          success: r.success,
          error: r.success ? undefined : r.error,
        })),
      },
    });
  } catch (error) {
    console.error("[API] Send notification error:", error);
    return NextResponse.json(
      { error: "Failed to send notifications" },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

// GET endpoint برای تست - ارسال نوتیفیکیشن هر 10 ثانیه
export async function GET() {
  try {
    const testNotification = {
      title: "تست کلاسکو 🎓",
      message: `پیام تست - ${new Date().toLocaleTimeString("fa-IR")}`,
      url: "/class",
      icon: "/icon512_rounded.png",
    };

    // ارسال نوتیفیکیشن
    const response = await fetch(
      `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/notifications/send`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(testNotification),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to send test notification");
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      message: "Test notification sent",
      ...result,
    });
  } catch (error) {
    console.error("[API] Test notification error:", error);
    return NextResponse.json(
      { error: "Failed to send test notification" },
      { status: 500 }
    );
  }
}
