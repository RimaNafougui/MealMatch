import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

<<<<<<< HEAD
  // Session Auth.js
=======
>>>>>>> b56e108f0177a381a6d8d1968dd82aa543bae5ad
  const session = await auth();
  const isLoggedIn = !!session;
  const needsUsername = (session as any)?.needsUsername === true;

<<<<<<< HEAD
  // Routes
=======
>>>>>>> b56e108f0177a381a6d8d1968dd82aa543bae5ad
  const protectedRoutes = ["/profile"];

  const guestRoutes = [
    "/login",
    "/signup",
    "/forgot-password",
    "/update-password",
  ];

<<<<<<< HEAD
  /*
   * 1️⃣ User logged in but needs username
   */
=======
>>>>>>> b56e108f0177a381a6d8d1968dd82aa543bae5ad
  if (
    isLoggedIn &&
    needsUsername &&
    pathname !== "/auth/complete-signup" &&
    !pathname.startsWith("/api")
  ) {
    return NextResponse.redirect(new URL("/auth/complete-signup", req.url));
  }

<<<<<<< HEAD
  /*
   * 2️⃣ User on complete-signup but shouldn't be
   */
  if (
    pathname === "/auth/complete-signup" &&
    (!isLoggedIn || !needsUsername)
  ) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  /*
   * 3️⃣ Logged-in users shouldn't see guest pages
   */
=======
  if (pathname === "/auth/complete-signup" && (!isLoggedIn || !needsUsername)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

>>>>>>> b56e108f0177a381a6d8d1968dd82aa543bae5ad
  if (
    isLoggedIn &&
    !needsUsername &&
    guestRoutes.some((route) => pathname.startsWith(route))
  ) {
    return NextResponse.redirect(new URL("/", req.url));
  }

<<<<<<< HEAD
  /*
   * 4️⃣ Protected routes require login
   */
=======
>>>>>>> b56e108f0177a381a6d8d1968dd82aa543bae5ad
  if (
    !isLoggedIn &&
    protectedRoutes.some((route) => pathname.startsWith(route))
  ) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

<<<<<<< HEAD
  /*
   * 5️⃣ complete-signup requires login
   */
=======
>>>>>>> b56e108f0177a381a6d8d1968dd82aa543bae5ad
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
  ],
};
