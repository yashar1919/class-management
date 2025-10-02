//eslint-disable-next-line
const https = require("https");

export function sendWelcomeSMS({
  to,
  firstname,
  lastname,
}: {
  to: string;
  firstname: string;
  lastname: string;
}) {
  const message = `${firstname} ${lastname}👋،\nبه کلاسکو خوش آمدید! مدیریت دانش‌آموزان و کلاس‌هایتان را با ما ساده‌تر کنید.`;

  const data = JSON.stringify({
    from: "50002710016871",
    to: to, // به صورت آرایه
    text: message,
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

  //eslint-disable-next-line
  const req = https.request(options, (res: any) => {
    console.log("statusCode: " + res.statusCode);

    //eslint-disable-next-line
    res.on("data", (d: any) => {
      process.stdout.write(d);
    });
  });

  //eslint-disable-next-line
  req.on("error", (error: any) => {
    console.error(error);
  });

  req.write(data);
  req.end();
}
