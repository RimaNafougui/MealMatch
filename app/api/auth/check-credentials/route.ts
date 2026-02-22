import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/utils/supabase-server";
import { loginRateLimit } from "@/utils/rate-limit";

/**
 * Pre-flight credentials check — called by the login form BEFORE NextAuth signIn.
 * Returns a structured response so the client can distinguish:
 *   - email_not_confirmed → show verification banner
 *   - invalid_credentials → show wrong password message
 *   - ok                  → proceed with NextAuth signIn
 *
 * We never expose Supabase session tokens here; this is purely a check.
 */

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(req: NextRequest) {
  try {
    // ── Rate limiting: 5 attempts per IP per minute ──────────────────────────
    const ip = getClientIp(req);
    const rl = loginRateLimit(ip);
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
    const email: string = (body.email ?? "").toString().trim().toLowerCase();
    const password: string = (body.password ?? "").toString();

    if (!email || !password) {
      return NextResponse.json({ status: "invalid_credentials" }, { status: 200 });
    }

    const supabase = getSupabaseServer();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      if (
        error.message.includes("Email not confirmed") ||
        error.message.includes("email not confirmed") ||
        error.code === "email_not_confirmed"
      ) {
        return NextResponse.json({ status: "email_not_confirmed" }, { status: 200 });
      }
      return NextResponse.json({ status: "invalid_credentials" }, { status: 200 });
    }

    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch {
    return NextResponse.json({ status: "invalid_credentials" }, { status: 200 });
  }
}
