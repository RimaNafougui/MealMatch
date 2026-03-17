// app/(public)/billing/cancel/page.tsx
"use client";

import { Button } from "@heroui/button";
import { useRouter } from "next/navigation";

export default function BillingCancelPage() {
    const router = useRouter();

    return (
        <div className="max-w-2xl mx-auto p-6 text-center flex flex-col gap-6">
            <h1 className="text-4xl font-bold text-danger">Paiement échoué ❌</h1>
            <p className="text-default-500 text-lg">
                Il y a eu un problème avec ton paiement. Vérifie tes informations ou réessaie.
            </p>
            <Button onPress={() => router.push("/pricing")} className="mx-auto">
                Retour à la tarification
            </Button>
        </div>
    );
}