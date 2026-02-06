import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/utils/supabase-server";

export async function POST(req: Request) {
  try {
    const supabase = getSupabaseServer();
    const { email, password, name, username } = await req.json();

    if (!email || !password || !username) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id")
      .ilike("username", username)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: "Username is already taken" },
        { status: 400 },
      );
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || null,
          username: username.toLowerCase(),
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback`,
      },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }
    return NextResponse.json(
      {
        message: "Inscription réussie ! Veuillez vérifier vos courriels.",
        user: {
          id: authData.user?.id,
          email: authData.user?.email,
          username: username.toLowerCase(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
