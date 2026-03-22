import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabaseServer } from "@/utils/supabase-server";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Adresse email invalide"),
});

// PATCH — update the authenticated user's email address
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Données invalides" },
        { status: 400 },
      );
    }

    const { email } = parsed.data;

    if (email === session.user.email) {
      return NextResponse.json(
        { error: "C'est déjà ton adresse email actuelle" },
        { status: 400 },
      );
    }

    const supabase = getSupabaseServer();

    const { error } = await supabase.auth.admin.updateUserById(session.user.id, { email });

    if (error) {
      if (error.message.includes("already")) {
        return NextResponse.json(
          { error: "Cette adresse email est déjà utilisée" },
          { status: 409 },
        );
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: "Un email de confirmation a été envoyé à ta nouvelle adresse.",
    });
  } catch (err) {
    console.error("PATCH /api/user/email error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
