import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require an authenticated session
const PRIVATE_PREFIXES = [
  "/dashboard",
  "/profile",
  "/settings",
  "/explore",
  "/onboarding",
  "/api/user",
  "/api/profiles",
  "/api/meal-plan",
  "/api/recipes/user",
  "/api/favorites",
  "/api/saved-recipes",
  "/api/shopping-lists",
];

// Routes only accessible when NOT logged in
const AUTH_ONLY_ROUTES = ["/login", "/signup"];

function isPrivate(pathname: string) {
  return PRIVATE_PREFIXES.some((p) => pathname.startsWith(p));
}

function isAuthOnly(pathname: string) {
  return AUTH_ONLY_ROUTES.some((p) => pathname.startsWith(p));
}

// Security headers applied to every response
function addSecurityHeaders(res: NextResponse): NextResponse {
  // Prevent clickjacking
  res.headers.set("X-Frame-Options", "DENY");
  // Prevent MIME sniffing
  res.headers.set("X-Content-Type-Options", "nosniff");
  // Referrer policy — don't leak path on cross-origin requests
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  // Permissions policy — disable unused browser features
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()",
  );
  // Basic XSS protection for older browsers
  res.headers.set("X-XSS-Protection", "1; mode=block");
  // HSTS — enforce HTTPS (1 year, include subdomains)
  res.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains",
  );
  // CSP — allow HeroUI fonts, Supabase, and your own origin
  res.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js needs unsafe-eval in dev
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https: http:", // recipes use external images
      "connect-src 'self' https://*.supabase.co https://api.openai.com",
      "frame-ancestors 'none'",
    ].join("; "),
  );
  return res;
}

export default auth(async function middleware(req: NextRequest & { auth: any }) {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // ── Route protection ─────────────────────────────────────────────────────

  // Unauthenticated user hitting a private route → redirect to login
  if (isPrivate(pathname) && !session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    const res = NextResponse.redirect(loginUrl);
    return addSecurityHeaders(res);
  }

  // Authenticated user hitting login/signup → redirect to dashboard
  if (isAuthOnly(pathname) && session) {
    const res = NextResponse.redirect(new URL("/dashboard", req.url));
    return addSecurityHeaders(res);
  }

  // ── Allow request, apply security headers ────────────────────────────────
  const res = NextResponse.next();
  return addSecurityHeaders(res);
});

export const config = {
  // Run on all routes except Next.js internals and static files
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
