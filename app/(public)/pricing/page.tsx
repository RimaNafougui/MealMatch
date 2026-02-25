// app/pricing/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";

import { CheckCircle2, Zap, Star, Users } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const STUDENT_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_STUDENT!;
const PREMIUM_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM!;

const plans = [
  { name: "Gratuit", type: "free", price: "0 $CA", period: "pour toujours", description: "Parfait pour commencer ton voyage culinaire", color: "default" as const, icon: <Users className="w-5 h-5" />, popular: false, features: ["5 plans de repas par mois", "Accès à 50 recettes", "Liste d'épicerie basique", "Suivi nutritionnel simplifié", "Support communauté"], unavailable: ["Plans de repas illimités", "IA avancée", "Export PDF", "Support prioritaire"] },
  { name: "Étudiant", type: "student", price: "2,99 $CA", period: "par mois", description: "Idéal pour les étudiants et les amateurs de cuisine", color: "success" as const, icon: <Zap className="w-5 h-5" />, popular: true, features: ["Plans de repas illimités", "Accès à toutes les recettes (120+)", "IA avancée et personnalisée", "Liste d'épicerie intelligente", "Suivi nutritionnel complet", "Export PDF de tes plans", "Favoris illimités", "Support prioritaire"], unavailable: [] },
  { name: "Premium", type: "premium", price: "5,99 $CA", period: "par mois", description: "Pour les utilisateurs avancés et les familles actives ", color: "primary" as const, icon: <Star className="w-5 h-5" />, popular: false, features: ["Tout ce qui est inclus dans Étudiant", "Plans familiaux (jusqu'à 4 personnes)", "Recettes exclusives premium", "Planification sur 4 semaines", "Conseils nutritionniste IA", "Intégration calendrier", "API access", "Support dédié 24h/7j"], unavailable: [] },
];

const faq = [
  { q: "Puis-je changer de plan à tout moment ?", a: "Oui, tu peux upgrader ou downgrader ton plan à tout moment. Les changements prennent effet immédiatement." },
  { q: "Est-ce qu'il y a un engagement ?", a: "Non, aucun engagement. Tu peux annuler ton abonnement à tout moment sans frais supplémentaires." },
  { q: "Comment fonctionne l'essai gratuit ?", a: "Le plan gratuit est disponible sans limite de temps." },
  { q: "Quels moyens de paiement acceptez-vous ?", a: "Cartes de crédit et débit (Visa, Mastercard, Amex) et PayPal." },
  { q: "Y a-t-il une remise pour les étudiants ?", a: "Notre plan Étudiant est déjà conçu pour être accessible." },
];

export default function PricingPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState("free");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  // window.location.origin sécurisé
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      let uid = data.user?.id ?? null;

      // ✅ En dev: injecte un userId factice si non connecté
      if (!uid && origin.includes("localhost")) {
        uid = "dev-user-local";
      }

      setUserId(uid);

      if (!uid || uid === "dev-user-local") return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", uid)
        .single();

      if (profile?.plan) setCurrentPlan(profile.plan);
    }

    loadUser();
  }, [origin]);

  function getPriceId(type: string) {
    if (type === "student") return STUDENT_PRICE_ID;
    if (type === "premium") return PREMIUM_PRICE_ID;
    return null;
  }

  async function startCheckout(priceId: string, planType: string) {
    if (!userId) {
      alert("Connecte-toi pour passer à un plan payant.");
      return;
    }

    if (planType === currentPlan) return;

    setLoadingPlan(planType);

    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId, userId, origin, plan: planType }),
    });

    const { url } = await res.json();
    if (url) window.location.href = url; // Redirige vers Stripe
  }

  return (
    <div className="max-w-7xl mx-auto px-6 pt-16 pb-12 flex flex-col gap-16">
      {/* Hero */}
      <section className="text-center flex flex-col items-center gap-4">
        <Chip color="success" variant="flat">Tarification</Chip>
        <h1 className="text-4xl lg:text-6xl font-bold">Simple et transparent</h1>
        <p className="text-default-500 max-w-2xl">
          Commence gratuitement, passe au plan payant quand tu en as besoin. Pas de surprise, pas de frais cachés.
        </p>
      </section>

      {/* Pricing */}
      <section className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrent = currentPlan === plan.type;
          const priceId = getPriceId(plan.type);

          return (
            <Card key={plan.name} className="p-4 relative">
              {plan.popular && (
                <Chip color="success" className="absolute top-3 left-1/2 -translate-x-1/2">Populaire</Chip>
              )}

              {isCurrent && (
                <Chip color="primary" size="sm" className="absolute top-3 right-3">Plan actuel</Chip>
              )}

              <CardHeader className="flex flex-col gap-2 pt-6">
                <Chip startContent={plan.icon}>{plan.name}</Chip>
                <div>
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-default-500 text-sm ml-1">/ {plan.period}</span>
                </div>
                <p className="text-default-500 text-sm">{plan.description}</p>
              </CardHeader>

              <Divider className="my-2" />

              <CardBody className="flex flex-col gap-2">
                {plan.features.map((f, i) => (
                  <div key={i} className="flex gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    {f}
                  </div>
                ))}
                {plan.unavailable.map((f, i) => (
                  <div key={i} className="flex gap-2 text-sm text-default-400 line-through">
                    <CheckCircle2 className="w-4 h-4" />
                    {f}
                  </div>
                ))}
              </CardBody>

              <CardFooter>
                {plan.type === "free" ? (
                  <Button fullWidth isDisabled={isCurrent} onPress={() => alert("Plan gratuit actif")}>
                    {isCurrent ? "Plan actif" : "Commencer gratuitement"}
                  </Button>
                ) : (
                  <Button
                    fullWidth
                    isDisabled={isCurrent}
                    isLoading={loadingPlan === plan.type}
                    onPress={() => startCheckout(priceId!, plan.type)}
                  >
                    {isCurrent ? "Plan actif" : `Choisir ${plan.name}`}
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </section>
    </div>
  );
}