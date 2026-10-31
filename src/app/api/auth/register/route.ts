import { NextResponse } from "next/server";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, email, password, phone } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Call Strapi Users-Permissions register endpoint
    // Note: Default Strapi User schema accepts username, email, password. Custom fields like phone are not in default schema.
    const strapiRes = await fetch(`${STRAPI_URL}/api/auth/local/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username?.trim() || email.split("@")[0],
        email: email.trim().toLowerCase(),
        password,
      }),
    });

    const data = await strapiRes.json();

    if (!strapiRes.ok) {
      const errorMessage = data?.error?.message || "Registration failed. Email or username might already be in use.";
      return NextResponse.json({ error: errorMessage }, { status: strapiRes.status || 400 });
    }

    return NextResponse.json({
      jwt: data.jwt,
      user: {
        id: data.user?.id,
        username: data.user?.username,
        email: data.user?.email,
        phone: data.user?.phone || "",
      },
    });
  } catch (error: any) {
    console.error("Auth register API error:", error);
    return NextResponse.json({ error: error?.message || "Server error during registration" }, { status: 500 });
  }
}

