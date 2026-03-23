"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSplash } from "@/contexts/SplashContext";
import { LandingPage } from "@/components/Landing-page/LandingPage";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { hideSplash } = useSplash();

  useEffect(() => {
    if (status === "loading") return;

    if (session?.user) {
      // Navigate to dashboard — it will call hideSplash() once its data is loaded
      router.push("/dashboard");
    } else {
      // Unauthenticated: keep splash for 1.6s then reveal landing page
      const t = setTimeout(hideSplash, 1600);
      return () => clearTimeout(t);
    }
  }, [status, session, router, hideSplash]);

  // Render landing page underneath the splash so it's ready when splash fades
  if (!session?.user && status !== "loading") {
    return <LandingPage />;
  }

  return null;
}
