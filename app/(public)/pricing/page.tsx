"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { CheckCircle2, Zap, Star, Users } from "lucide-react";

const plansData = [
  {
    name: "Gratuit",
    type: "free",
    price: "0 $CA",
    period: "pour toujours",
    description: "Parfait pour commencer et découvrir MealMatch.",
    color: "default" as const,
    icon: <Users className="w-5 h-5" />,
    popular: false,
    features: [
      "5 plans de repas par mois",
      "Accès à 50 recettes",
      "Liste d'épicerie basique",
      "Suivi nutritionnel simplifié",
      "Support communauté",
    ],
    unavailable: [
      "Plans de repas illimités",
      "IA avancée",
      "Export PDF",
      "Support prioritaire",
    ],
    cta: "Commencer gratuitement",
    variant: "bordered" as const,
  },
  {
    name: "Étudiant",
    type: "student",
    price: "2,99 $CA",
    period: "par mois",
    description: "Tout ce dont un étudiant a besoin pour bien manger.",
    color: "success" as const,
    icon: <Zap className="w-5 h-5" />,
    popular: true,
    features: [
      "Plans de repas illimités",
      "Accès à toutes les recettes (120+)",
      "IA avancée et personnalisée",
      "Liste d'épicerie intelligente",
      "Suivi nutritionnel complet",
      "Export PDF de tes plans",
      "Favoris illimités",
      "Support prioritaire",
    ],
    unavailable: [],
    cta: "Choisir Étudiant",
    variant: "solid" as const,
  },
  {
    name: "Premium",
    type: "premium",
    price: "5,99 $CA",
    period: "par mois",
    description: "Pour les gourmets qui veulent le meilleur de MealMatch.",
    color: "primary" as const,
    icon: <Star className="w-5 h-5" />,
    popular: false,
    features: [
      "Tout ce qui est inclus dans Étudiant",
      "Plans familiaux (jusqu'à 4 personnes)",
      "Recettes exclusives premium",
      "Planification sur 4 semaines",
      "Conseils nutritionniste IA",
      "Intégration calendrier",
      "API access",
      "Support dédié 24h/7j",
    ],
    unavailable: [],
    cta: "Choisir Premium",
    variant: "bordered" as const,
  },
];

export default function PricingPage() {
  const { data: session, status } = useSession();
  const userId = session?.user?.id ?? null;

  const [currentPlan, setCurrentPlan] = useState("free");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlan() {
      if (!userId) return;
      try {
        const res = await fetch("/api/user/plan");
        const data = await res.json();
        setCurrentPlan(data.plan ?? "free");
      } catch (err) {
        console.error("Impossible de récupérer le plan:", err);
      }
    }
    fetchPlan();
  }, [userId]);

  async function startCheckout(planType: string) {
    if (!userId) {
      alert("Connecte-toi d'abord !");
      return;
    }
    if (planType === currentPlan) return;

    setLoadingPlan(planType);

    try {
      // ⚡ On envoie juste l'ID utilisateur au backend
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planType, userId }),
      });

      const { url, error } = await res.json();
      if (error) throw new Error(error);
      if (url) window.location.href = url;
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Erreur lors du checkout");
      setLoadingPlan(null);
    }
  }

  if (status === "loading") {
    return (
      <div className="h-screen flex items-center justify-center">
        Chargement…
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 pt-16 pb-12">
      <div className="flex flex-col gap-16 py-12">
        {/* Hero */}
        <section className="text-center flex flex-col items-center gap-4">
          <Chip color="success" variant="flat" size="sm" className="font-semibold">
            Tarification
          </Chip>
          <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
            Simple et <span className="text-success">transparent</span>
          </h1>
          <p className="text-default-500 text-lg max-w-2xl">
            Commence gratuitement, passe au plan payant quand tu en as besoin. Pas de surprise, pas de frais cachés.
          </p>
        </section>

        {/* Pricing cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plansData.map((plan, i) => {
            const isCurrent = plan.type === currentPlan;
            return (
              <Card key={i} className="p-4 border backdrop-blur-xl bg-white/70 dark:bg-black/40 relative">
                {isCurrent && (
                  <div className="absolute top-3 right-3">
                    <Chip color="success" variant="solid" size="sm" className="font-bold">
                      Plan actuel
                    </Chip>
                  </div>
                )}
                {plan.popular && !isCurrent && (
                  <div className="absolute top-3 left-1/2 -translate-x-1/2">
                    <Chip color="success" variant="solid" size="sm" className="font-bold">
                      Populaire
                    </Chip>
                  </div>
                )}

                <CardHeader className="flex flex-col items-start gap-3 pt-6">
                  <Chip color={plan.color} variant="flat" size="sm" startContent={plan.icon}>
                    {plan.name}
                  </Chip>
                  <div>
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-default-500 text-sm ml-1">/ {plan.period}</span>
                  </div>
                  <p className="text-default-500 text-sm">{plan.description}</p>
                </CardHeader>

                <Divider className="my-2" />

                <CardBody className="flex flex-col gap-2 py-4">
                  {plan.features.map((f, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                  {plan.unavailable.map((f, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-default-400 line-through">
                      <CheckCircle2 className="w-4 h-4 text-default-300 flex-shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </CardBody>

                <CardFooter>
                  <Button
                    fullWidth
                    color={plan.popular ? "success" : plan.color}
                    variant={plan.popular ? "solid" : plan.variant}
                    onPress={() => !isCurrent && startCheckout(plan.type)}
                    isDisabled={!userId || isCurrent}
                    isLoading={loadingPlan === plan.type}
                  >
                    {isCurrent ? "Plan actif" : plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </section>
      </div>
    </div>
  );
}