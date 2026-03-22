// app/billing/success/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@heroui/button";
import { useRouter } from "next/navigation";

export default function BillingSuccessPage() {
    const [plan, setPlan] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        async function loadPlan() {
            try {
                const res = await fetch("/api/user/plan");
                if (!res.ok) return;
                const data = await res.json();
                if (data.plan) setPlan(data.plan);
            } catch {
                // non-blocking — fallback message shown
            }
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