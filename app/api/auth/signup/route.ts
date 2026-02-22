import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/utils/supabase-server";
import { generateUniqueUsername } from "@/utils/username-generator";
import { signupRateLimit } from "@/utils/rate-limit";

// Helper: get the real client IP, respecting common proxy headers.
function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(req: Request) {
  try {
    // ── Rate limiting ────────────────────────────────────────────────────────
    const ip = getClientIp(req);
    const rl = signupRateLimit(ip);
    if (!rl.success) {
      return NextResponse.json(
        { error: "Too many signup attempts. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) },
        },
      );
    }

    const supabase = getSupabaseServer();
    const body = await req.json();

    // ── Input extraction & basic sanitization ────────────────────────────────
    const email: string = (body.email ?? "").toString().trim().toLowerCase();
    const password: string = (body.password ?? "").toString();
    const name: string = (body.name ?? "").toString().trim().slice(0, 100);
    const rawUsername: string = (body.username ?? "").toString().trim();

    // ── Required field validation ────────────────────────────────────────────
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    // Basic email format guard (full validation is Supabase's job)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    // ── Username validation ──────────────────────────────────────────────────
    if (rawUsername) {
      if (rawUsername.length < 3 || rawUsername.length > 30) {
        return NextResponse.json(
          { error: "Username must be 3-30 characters" },
          { status: 400 },
        );
      }

      if (!/^[a-zA-Z0-9_-]+$/.test(rawUsername)) {
        return NextResponse.json(
          {
            error:
              "Username can only contain letters, numbers, dashes, and underscores",
          },
          { status: 400 },
        );
      }

      if (/^[-_]|[-_]$/.test(rawUsername)) {
        return NextResponse.json(
          {
            error: "Username cannot start or end with a dash or underscore",
          },
          { status: 400 },
        );
      }

      const { data: existingUser } = await supabase
        .from("profiles")
        .select("id")
        .ilike("username", rawUsername)
        .single();

      if (existingUser) {
        return NextResponse.json(
          { error: "Username is already taken" },
          { status: 400 },
        );
      }
    }

    // ── Create auth user ─────────────────────────────────────────────────────
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || null,
          username: rawUsername ? rawUsername.toLowerCase() : null,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
      },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 400 },
      );
    }

    // ── Ensure profile row exists (Supabase trigger may handle this) ─────────
    // We do a quick check without artificial delays; if the trigger hasn't fired
    // yet we create the profile ourselves.
    const { data: userRecord, error: dbError } = await supabase
      .from("profiles")
      .select("id, email, name, username")
      .eq("id", authData.user.id)
      .single();

    if (dbError || !userRecord) {
      let finalUsername: string;
      if (rawUsername) {
        finalUsername = rawUsername.toLowerCase();
      } else {
        finalUsername = await generateUniqueUsername(name, email);
      }

      const { error: insertError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        email: authData.user.email!,
        name: name || null,
        username: finalUsername,
      });

      if (insertError) {
        if (
          insertError.code === "23505" &&
          insertError.message?.includes("username")
        ) {
          return NextResponse.json(
            { error: "Username is already taken" },
            { status: 400 },
          );
        }
        // Non-fatal: profile trigger may create it asynchronously
        console.error("[signup] Profile insert error:", insertError.message);
      }
    } else if (userRecord && !userRecord.username) {
      const autoUsername = await generateUniqueUsername(name, email);

      await supabase
        .from("profiles")
        .update({
          username: autoUsername,
          updated_at: new Date().toISOString(),
        })
        .eq("id", authData.user.id);
    }

    return NextResponse.json(
      {
        message:
          "User created successfully. Please check your email to verify your account.",
        user: {
          id: authData.user.id,
          email: authData.user.email,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[signup] Unexpected error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
