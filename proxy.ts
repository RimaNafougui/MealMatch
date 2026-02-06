import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const protectedRoutes = ["/profile", "/dashboard"];

  const guestRoutes = [
    "/login",
    "/signup",
    "/forgot-password",
    "/update-password",
  ];

  const sessionToken =
    req.cookies.get("authjs.session-token")?.value ||
    req.cookies.get("__Secure-authjs.session-token")?.value;

  const isLoggedIn = !!sessionToken;

  if (isLoggedIn && guestRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  if (
    !isLoggedIn &&
    protectedRoutes.some((route) => pathname.startsWith(route))
  ) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }
  if (isLoggedIn && protectedRoutes.some((route) => pathname.startsWith(route))) {
    // ⚠️ Ici on utilise ton client Supabase serveur existant
    const {
      data: { user },
    } = await supabase.auth.getUser(sessionToken);

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .single();

      if (!profile?.onboarding_completed && pathname !== "/onboarding") {
        const onboardingUrl = new URL("/onboarding", req.url);
        return NextResponse.redirect(onboardingUrl);
      }
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/profile/:path*",
    "/dashboard/:path*",
    "/login",
    "/signup",
    "/forgot-password",
    "/update-password",
  ],
};
