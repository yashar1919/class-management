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
    <div style="font-family: sans-serif; padding: 32px;">
      <h2 style="color: #00bba7;">سلام ${firstname} ${lastname} عزیز 👋</h2>
      <p>به <b>Classco</b> خوش آمدید! امیدواریم تجربه خوبی داشته باشید.</p>
      <hr style="margin: 24px 0;" />
      <p style="font-size: 12px; color: #888;">اگر سوالی داشتی، با ما در تماس باش.</p>
    </div>
  `;
  return resend.emails.send({
    from: "Class-Co <noreply@class-co.ir>",
    to,
    subject: "خوش آمدید به Classco!",
    html,
  });
}
