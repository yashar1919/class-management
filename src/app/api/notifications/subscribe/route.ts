import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint, keys } = body;

    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return NextResponse.json(
        { error: "Invalid subscription data" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const { db } = await connectToDatabase();
    const subscriptions = db.collection("push_subscriptions");

    // Check if subscription already exists
    const existingSubscription = await subscriptions.findOne({ endpoint });

    if (existingSubscription) {
      // Update existing subscription
      await subscriptions.updateOne(
        { endpoint },
        {
          $set: {
            keys,
            updatedAt: new Date(),
            isActive: true,
          },
        }
      );
    } else {
      // Insert new subscription
      await subscriptions.insertOne({
        endpoint,
        keys,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      });
    }

    console.log("[API] Push subscription saved:", {
      endpoint: endpoint.substring(0, 50) + "...",
    });

    return NextResponse.json({
      success: true,
      message: "Subscription saved successfully",
    });
  } catch (error) {
    console.error("[API] Subscribe error:", error);
    return NextResponse.json(
      { error: "Failed to save subscription" },
      { status: 500 }
    );
  }
}
