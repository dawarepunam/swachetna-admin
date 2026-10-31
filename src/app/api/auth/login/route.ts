import { NextResponse } from "next/server";

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json({ error: "Email/Username and password are required" }, { status: 400 });
    }

    // Call Strapi Users-Permissions local auth endpoint
    const strapiRes = await fetch(`${STRAPI_URL}/api/auth/local`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: identifier.trim(),
        password,
      }),
    });

    const data = await strapiRes.json();

    if (!strapiRes.ok) {
      const errorMessage = data?.error?.message || "Invalid email or password. Please try again.";
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
    console.error("Auth login API error:", error);
    return NextResponse.json({ error: error?.message || "Server error during login" }, { status: 500 });
  }
}

