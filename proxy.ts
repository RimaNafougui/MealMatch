import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const protectedRoutes = ["/profile", "/dashboard"];

  // Route definitions
  const protectedRoutes = ["/profile"];
  const guestRoutes = [
    "/login",
    "/signup",
    "/forgot-password",
    "/update-password",
  ];

  // If logged in and needs username, redirect to complete-signup
  // (except if already on that page or on API routes)
  if (
    isLoggedIn &&
    needsUsername &&
    pathname !== "/auth/complete-signup" &&
    !pathname.startsWith("/api")
  ) {
    return NextResponse.redirect(new URL("/auth/complete-signup", req.url));
  }

  // If on complete-signup but doesn't need username, redirect home
  if (pathname === "/auth/complete-signup" && (!isLoggedIn || !needsUsername)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Redirect logged-in users away from guest routes
  if (
    isLoggedIn &&
    !needsUsername &&
    guestRoutes.some((route) => pathname.startsWith(route))
  ) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Protect routes that require login
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

  // Protect complete-signup route (must be logged in)
  if (pathname === "/auth/complete-signup" && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
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
    "/auth/complete-signup",
  ],
};
