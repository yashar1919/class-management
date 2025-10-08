import https from "https";

interface SMSParams {
  to: string;
  firstname: string;
  lastname: string;
  customText?: string;
}

export async function sendWelcomeSMS({
  to,
  firstname,
  lastname,
  customText,
}: SMSParams): Promise<void> {
  const username = process.env.MELIPAYAMAK_USERNAME;
  const password = process.env.MELIPAYAMAK_PASSWORD;

  console.log("🔧 SMS Service - Starting SMS send process...");
  console.log("📱 SMS Target:", to);
  console.log("👤 User:", `${firstname} ${lastname}`);

  // چک کردن متغیرهای محیطی
  if (!username || !password) {
    console.error("❌ SMS Service - Missing environment variables:");
    console.error("MELIPAYAMAK_USERNAME:", username ? "✅ Set" : "❌ Missing");
    console.error("MELIPAYAMAK_PASSWORD:", password ? "✅ Set" : "❌ Missing");
    throw new Error("SMS credentials not configured");
  }

  console.log("✅ SMS Service - Environment variables are set");

  const message =
    customText ||
    `${firstname} ${lastname}👋،\nبه کلاسکو خوش آمدید! مدیریت دانش‌آموزان و کلاس‌هایتان را با ما ساده‌تر کنید.`;

  const data = JSON.stringify({
    from: "50002710016871",
    username,
    password,
    to: to,
    text: message,
  });

  console.log("📝 SMS Service - Request data prepared:", {
    from: "50002710016871",
    username: username,
    to: to,
    messageLength: message.length,
  });

  const options = {
    hostname: "console.melipayamak.com",
    port: 443,
    path: "/api/send/simple/b99a1c5dac4e4d0c83f4f3023ba00df2",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(data),
    },
  };

  console.log("🌐 SMS Service - Request options:", options);

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      console.log("📡 SMS Service - Response status code:", res.statusCode);
      console.log("📡 SMS Service - Response headers:", res.headers);

      let responseBody = "";

      res.on("data", (chunk) => {
        responseBody += chunk.toString();
      });

      res.on("end", () => {
        console.log("📨 SMS Service - Full response body:", responseBody);

        if (res.statusCode === 200) {
          console.log("✅ SMS Service - SMS sent successfully!");
          resolve();
        } else {
          console.error(
            "❌ SMS Service - SMS send failed with status:",
            res.statusCode
          );
          console.error("❌ SMS Service - Response body:", responseBody);
          reject(
            new Error(`SMS send failed: ${res.statusCode} - ${responseBody}`)
          );
        }
      });
    });

    req.on("error", (error) => {
      console.error("💥 SMS Service - Request error:", error);
      // Log additional error details if available
      const nodeError = error as NodeJS.ErrnoException;
      console.error("💥 SMS Service - Error details:", {
        message: error.message,
        code: nodeError.code,
        errno: nodeError.errno,
        syscall: nodeError.syscall,
      });
      reject(error);
    });

    req.on("timeout", () => {
      console.error("⏰ SMS Service - Request timeout");
      req.destroy();
      reject(new Error("SMS request timeout"));
    });

    // Set a timeout for the request (30 seconds)
    req.setTimeout(30000);

    console.log("📤 SMS Service - Sending request...");
    req.write(data);
    req.end();
  });
}
