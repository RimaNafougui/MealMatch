import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const session = await auth();
  const isLoggedIn = !!session;
  const needsUsername = (session as any)?.needsUsername;

  const protectedRoutes = ["/profile"];
  const guestRoutes = [
    "/login",
    "/signup",
    "/forgot-password",
    "/update-password",
  ];

  if (
    isLoggedIn &&
    needsUsername &&
    pathname !== "/auth/complete-signup" &&
    !pathname.startsWith("/api")
  ) {
    return NextResponse.redirect(new URL("/auth/complete-signup", req.url));
  }

  if (pathname === "/auth/complete-signup" && (!isLoggedIn || !needsUsername)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (
    isLoggedIn &&
    !needsUsername &&
    guestRoutes.some((route) => pathname.startsWith(route))
  ) {
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

  if (pathname === "/auth/complete-signup" && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/profile/:path*",
    "/login",
    "/signup",
    "/forgot-password",
    "/update-password",
    "/auth/complete-signup",
  ],
};
