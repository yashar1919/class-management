import { NextRequest, NextResponse } from "next/server";
import { sendWelcomeSMS } from "@/services/smsService";

export async function POST(req: NextRequest) {
  const { name, phone, customText } = await req.json();

  // اگر customText وجود داشت، همان را ارسال کن، در غیر این صورت متن دیفالت
  const message =
    customText && customText.trim().length > 0
      ? customText
      : `${name} عزیز، زمان پرداخت شهریه کلاس شما فرا رسیده است. لطفا جهت ادامه جلسات، پرداخت را انجام دهید.`;

  try {
    await sendWelcomeSMS({
      to: phone,
      firstname: name,
      lastname: "",
      customText: message,
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { error: "SMS failed", details: (e as Error).message },
      { status: 500 }
    );
  }
}
