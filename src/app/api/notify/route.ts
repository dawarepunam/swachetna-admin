import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { to, type, name, data } = body;

    if (!to || !to.includes("@")) {
      return NextResponse.json({ error: "Valid email address is required" }, { status: 400 });
    }

    const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    let subject = "Swachetna Foundation Notification";
    let message = "";

    if (type === "welcome") {
      subject = "Welcome to Swachetna Foundation!";
      message = `Hello ${name || "Patron"},\n\nYour account has been created successfully. Welcome to Swachetna Foundation! You can now track your orders, manage saved delivery addresses, and support rural artisan communities.\n\nTime: ${timestamp}`;
    } else if (type === "profile_updated") {
      subject = "Swachetna Account: Personal Information Updated";
      message = `Hello ${name || "Patron"},\n\nYour Swachetna Foundation profile information has been successfully updated on ${timestamp}.\n\nIf you did not make this change, please reach out to support@swachetna.org immediately.`;
    } else if (type === "google_login") {
      subject = "New Login to Swachetna via Google";
      message = `Hello ${name || "Patron"},\n\nYour Swachetna Foundation account was accessed via Google Single Sign-On on ${timestamp}.`;
    }

    // Log the notification payload for server tracing
    console.log(`[EMAIL DISPATCH] To: ${to} | Subject: "${subject}"`);
    console.log(`[EMAIL CONTENT]\n${message}\n----------------------------------`);

    // If an external SMTP or Resend/SendGrid API key is provided in .env.local, we can bridge it here
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (RESEND_API_KEY) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Swachetna Foundation <orders@swachetna.org>",
            to: [to],
            subject,
            text: message,
          }),
        });
      } catch (err) {
        console.warn("External email dispatch error:", err);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Notification sent to ${to}`,
      timestamp,
      subject,
    });
  } catch (error: any) {
    console.error("Notify API Error:", error);
    return NextResponse.json({ error: error?.message || "Failed to send notification" }, { status: 500 });
  }
}

