import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();

    // Création du client Supabase côté serveur (nouvelle signature)
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            cookies: req.cookies,
        }
    );

    // Récupérer la session de l'utilisateur
    const {
        data: { session },
    } = await supabase.auth.getSession();

    // Redirection vers login si non connecté
    if (!session) {
        const loginUrl = new URL("/login", req.url);
        return NextResponse.redirect(loginUrl);
    }

    // Vérifier si l'onboarding est complété
    const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", session.user.id)
        .single();

    if (!profile?.onboarding_completed) {
        const onboardingUrl = new URL("/onboarding", req.url);
        return NextResponse.redirect(onboardingUrl);
    }

    return res;
}

// Appliquer le middleware aux routes protégées
export const config = {
    matcher: ["/dashboard/:path*", "/profile/:path*"],
};
