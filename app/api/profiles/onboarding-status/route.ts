import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabaseServer } from "@/utils/supabase-server";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { onboardingCompleted: false },
      { status: 401 }
    );
  }

  const supabase = getSupabaseServer();

  const { data } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", session.user.id)
    .single();

  return NextResponse.json({
    onboardingCompleted: data?.onboarding_completed ?? false,
  });
}
