import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { email, name } = await req.json();

    // Generate test SMTP service account from ethereal.email (works locally without config!)
    let testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });

    const info = await transporter.sendMail({
      from: '"Vault Sentinel" <demo@vaultsentinel.com>',
      to: email || "test@example.com",
      subject: "Vault Sentinel - Your Google Meet Link",
      text: `Hi ${name || 'there'},\n\nYour platform assessment is confirmed. Here is your Google Meet link:\nhttps://meet.google.com/xqz-urwi-kmt\n\nBest,\nThe Vault Sentinel Team`,
      html: `<b>Hi ${name || 'there'},</b><br><br>Your platform assessment is confirmed. Here is your Google Meet link:<br><a href="https://meet.google.com/xqz-urwi-kmt">https://meet.google.com/xqz-urwi-kmt</a><br><br>Best,<br>The Vault Sentinel Team`,
    });

    const messageUrl = nodemailer.getTestMessageUrl(info);
    console.log("Email sent! Preview URL: ", messageUrl);

    return NextResponse.json({ 
      success: true, 
      status: "Delivered internally via ethereal mail route.",
      previewUrl: messageUrl
    });
  } catch (error) {
    console.error("Mailing Error", error);
    return NextResponse.json({ success: false, error: "Failed to send email" }, { status: 500 });
  }
}
