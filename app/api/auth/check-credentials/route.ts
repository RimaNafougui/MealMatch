import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/utils/supabase-server";
import { loginRateLimit } from "@/utils/rate-limit";

/**
 * Pre-flight credentials check — called by the login form BEFORE NextAuth signIn.
 *
 * Accepts either an email address or a username as `identifier`.
 * Returns a structured response so the client can show specific error messages:
 *   - user_not_found      → no account with that email/username exists
 *   - wrong_password      → account exists but password is incorrect
 *   - email_not_confirmed → account exists but email not yet verified
 *   - rate_limited        → too many attempts
 *   - ok                  → credentials valid; `resolvedEmail` is included so
 *                           the form can pass the real email to NextAuth signIn
 */

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(req: NextRequest) {
  try {
    // ── Rate limiting ────────────────────────────────────────────────────────
    const ip = getClientIp(req);
    const rl = await loginRateLimit(ip);
    if (!rl.success) {
      return NextResponse.json(
        { status: "rate_limited" },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) },
        },
      );
    }

    const body = await req.json();
    const identifier: string = (body.identifier ?? "").toString().trim().toLowerCase();
    const password: string = (body.password ?? "").toString();

    if (!identifier || !password) {
      return NextResponse.json({ status: "user_not_found" }, { status: 200 });
    }

    const supabase = getSupabaseServer();

    // ── Step 1: resolve identifier → email ───────────────────────────────────
    let resolvedEmail: string;

    if (isEmail(identifier)) {
      // Check that an account with this email actually exists in profiles
      const { data: profile } = await supabase
        .from("profiles")
        .select("email")
        .eq("email", identifier)
        .single();

      if (!profile) {
        return NextResponse.json({ status: "user_not_found" }, { status: 200 });
      }

      resolvedEmail = profile.email;
    } else {
      // Treat as username — look up the corresponding email
      const { data: profile } = await supabase
        .from("profiles")
        .select("email")
        .ilike("username", identifier)
        .single();

      if (!profile) {
        return NextResponse.json({ status: "user_not_found" }, { status: 200 });
      }

      resolvedEmail = profile.email;
    }

    // ── Step 2: attempt sign-in with the resolved email ──────────────────────
    const { error } = await supabase.auth.signInWithPassword({
      email: resolvedEmail,
      password,
    });

    if (error) {
      if (
        error.message.includes("Email not confirmed") ||
        error.message.includes("email not confirmed") ||
        error.code === "email_not_confirmed"
      ) {
        return NextResponse.json({ status: "email_not_confirmed" }, { status: 200 });
      }

      // Any other Supabase auth error at this point means the password is wrong
      // (we already confirmed the account exists above)
      return NextResponse.json({ status: "wrong_password" }, { status: 200 });
    }

    // ── Step 3: success — return the resolved email for NextAuth signIn ───────
    return NextResponse.json({ status: "ok", resolvedEmail }, { status: 200 });
  } catch {
    return NextResponse.json({ status: "user_not_found" }, { status: 200 });
  }
}
