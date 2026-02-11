// utils/auth.ts
import { signIn } from "next-auth/react";

export async function loginAndCheckOnboarding(email: string, password: string) {
    // 1️⃣ Tentative de connexion
    const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
    });

    if (result?.error) {
        if (result.error.includes("EmailNotVerified")) {
            return { success: false, error: "Please check your email to verify your account before logging in." };
        }
        return { success: false, error: "Invalid email or password." };
    }

    // 2️⃣ Vérifier l'onboarding via API
    const res = await fetch("/api/profile/onboarding-status");
    const data = await res.json();

    return { success: true, onboardingCompleted: data.onboardingCompleted };
}
