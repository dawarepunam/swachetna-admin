import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name, avatar, googleId } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid Google email is required" }, { status: 400 });
    }

    const cleanName = name || email.split("@")[0].replace(/[^a-zA-Z0-9]/g, " ");
    const userPayload = {
      id: googleId || `google-${Date.now()}`,
      name: cleanName,
      email: email.trim().toLowerCase(),
      phone: "+91 98765 43210",
      avatar: avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}`,
      provider: "google",
      jwt: `jwt-google-${Date.now()}`,
    };

    return NextResponse.json({
      success: true,
      user: userPayload,
      message: "Google Authentication successful",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Google auth failed" }, { status: 500 });
  }
}

