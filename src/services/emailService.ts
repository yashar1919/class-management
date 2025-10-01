import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail({
  to,
  firstname,
  lastname,
}: {
  to: string;
  firstname: string;
  lastname: string;
}) {
  const html = `
    <div style="background: #f6f8fa; padding: 40px 0; font-family: Tahoma, Arial, sans-serif;">
      <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 16px; box-shadow: 0 4px 24px #0001; padding: 32px 28px;">
        <div style="text-align: center; margin-bottom: 28px;">
          <img src="https://class-co.ir/emailPic.png" alt="Classco Logo" style="width: 180px; border-radius: 12px; margin-bottom: 18px;" />
        </div>
        <h2 style="color: #00bba7; text-align: center; margin-bottom: 8px;">${firstname} ${lastname} عزیز، خوش آمدید!</h2>
        <p style="color: #222; font-size: 16px; text-align: center; margin-bottom: 24px;">
          از اینکه به جمع معلمان حرفه‌ای <b>Classco</b> پیوستید، بسیار خوشحالیم.<br/>
          این سامانه به شما کمک می‌کند تا مدیریت دانش‌آموزان، جلسات و امور مالی کلاس‌هایتان را ساده‌تر و دقیق‌تر انجام دهید.
        </p>
        <div style="background: #f0f4f8; border-radius: 10px; padding: 18px 16px; margin-bottom: 24px;">
          <ul style="color: #444; font-size: 15px; line-height: 2; margin: 0; padding-left: 18px;">
            <li>ثبت و مدیریت اطلاعات دانش‌آموزان</li>
            <li>پیگیری تعداد جلسات و وضعیت پرداخت‌ها</li>
            <li>دسترسی آسان و سریع به سوابق کلاس‌ها</li>
          </ul>
        </div>
        <p style="color: #444; font-size: 15px; margin-bottom: 24px;">
          امیدواریم تجربه‌ای حرفه‌ای و لذت‌بخش با Classco داشته باشید.<br/>
          هرگونه پیشنهاد یا انتقاد خود را می‌توانید مستقیماً با بنیان‌گذار سامانه در میان بگذارید:
        </p>
        <div style="background: #e6f7f4; border-radius: 8px; padding: 12px 10px; text-align: center; margin-bottom: 24px;">
          <span style="color: #00bba7; font-weight: bold;">یاشار طالبی</span><br/>
          <a href="mailto:yashar.taleby@gmail.com" style="color: #007b8f; text-decoration: none;">yashar.taleby@gmail.com</a>
        </div>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;" />
        <div style="text-align: center;">
          <p style="font-size: 13px; color: #888;">با آرزوی موفقیت برای شما<br/>تیم Classco</p>
        </div>
      </div>
    </div>
  `;
  console.log("Sending welcome email to:", to);
  try {
    const result = await resend.emails.send({
      from: "Classco <noreply@class-co.ir>",
      to,
      subject: "خوش آمدید به Classco!",
      html,
    });
    console.log("Resend result:", result);
    return result;
  } catch (err) {
    console.error("Resend error:", err);
    throw err;
  }
}
