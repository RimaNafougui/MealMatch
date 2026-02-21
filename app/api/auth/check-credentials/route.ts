import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/utils/supabase-server";

/**
 * Pre-flight credentials check — called by the login form BEFORE NextAuth signIn.
 * Returns a structured response so the client can distinguish:
 *   - email_not_confirmed → show verification banner
 *   - invalid_credentials → show wrong password message
 *   - ok                  → proceed with NextAuth signIn
 *
 * We never expose Supabase session tokens here; this is purely a check.
 */
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

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
