"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";

/**
 * Supabase email-verification callback.
 *
 * Supabase sends the user here with tokens in the URL hash:
 *   /auth/callback#access_token=...&type=signup
 *
 * Hash fragments are only available in the browser, so this must be a
 * client component. We call supabase.auth.getSession() which automatically
 * picks up the hash tokens, marks the email as confirmed, then we redirect
 * to /login?verified=true so the login form can show the success banner.
 */
export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    async function handleCallback() {
      try {
        // Parse the hash fragment that Supabase appended to the URL.
        // getSession() will detect the hash tokens and exchange them,
        // confirming the email on the Supabase side.
        const { error } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth callback error:", error.message);
          router.replace("/login?verified=error");
          return;
        }

        // Sign the user back out of the Supabase client session —
        // we only used this to confirm the email. The real session
        // is managed by NextAuth when the user logs in normally.
        await supabase.auth.signOut();

        router.replace("/login?verified=true");
      } catch (err) {
        console.error("Unexpected callback error:", err);
        router.replace("/login?verified=error");
      }
    }

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="w-8 h-8 rounded-full border-4 border-success border-t-transparent animate-spin" />
      <p className="text-default-500 text-sm">Vérification de votre compte…</p>
    </div>
  );
}
