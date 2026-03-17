// app/billing/success/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@heroui/button";
import { useRouter } from "next/navigation";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function BillingSuccessPage() {
    const [plan, setPlan] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        async function loadPlan() {
            const { data } = await supabase.auth.getUser();
            const userId = data.user?.id ?? null;

            if (!userId) return;

            const { data: profile } = await supabase
                .from("profiles")
                .select("plan")
                .eq("id", userId)
                .single();

            if (profile?.plan) setPlan(profile.plan);
        }

        loadPlan();
    }, []);

    return (
        <div className="max-w-2xl mx-auto p-6 text-center flex flex-col gap-6">
            <h1 className="text-4xl font-bold text-success">Paiement réussi 🎉</h1>
            <p className="text-default-500 text-lg">
                {plan
                    ? `Ton plan "${plan}" est maintenant actif !`
                    : "Ton abonnement a été pris en compte."}
            </p>
            <Button onPress={() => router.push("/")} className="mx-auto">
                Retour à l'accueil
            </Button>
        </div>
    );
}