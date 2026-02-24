// app/(public)/pricing/page.tsx
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
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
  {
    name: "Gratuit",
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
    type: "free",
  },
  {
    name: "Étudiant",
    price: "2,99 $CA",
    period: "par mois",
    description: "Tout ce dont un étudiant a besoin pour bien manger.",
    color: "success" as const,
    icon: <Zap className="w-5 h-5" />,
    popular: true,
    features: [
      "Plans de repas illimités",
      "Accès à toutes les recettes",
      "IA avancée",
      "Export PDF",
      "Support prioritaire",
    ],
    unavailable: [],
    type: "student",
  },
  {
    name: "Premium",
    price: "5,99 $CA",
    period: "par mois",
    description: "Pour les gourmets.",
    color: "primary" as const,
    icon: <Star className="w-5 h-5" />,
    popular: false,
    features: [
      "Tout Étudiant",
      "Plans familiaux",
      "Recettes premium",
      "Support dédié",
    ],
    unavailable: [],
    type: "premium",
  },
];

export default function PricingPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  async function startCheckout(priceId: string, planName: string) {
    if (!userId) {
      window.location.href = "/signup";
      return;
    }

    setLoadingPlan(planName);

    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ priceId, userId }),
    });

    const { url } = await res.json();
    window.location.href = url;
  }

  function getPriceId(type: string) {
    if (type === "student") return STUDENT_PRICE_ID;
    if (type === "premium") return PREMIUM_PRICE_ID;
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 pt-16 pb-12">
      <section className="text-center mb-12">
        <Chip color="success" variant="flat">Tarification</Chip>
        <h1 className="text-5xl font-bold mt-4">Simple et transparent</h1>
      </section>

      <section className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const priceId = getPriceId(plan.type);

          return (
            <Card key={plan.name} className="p-4">
              <CardHeader className="flex flex-col items-start gap-2">
                <Chip startContent={plan.icon}>{plan.name}</Chip>
                <div className="text-3xl font-bold">{plan.price}</div>
                <p className="text-default-500 text-sm">{plan.description}</p>
              </CardHeader>

              <Divider />

              <CardBody className="flex flex-col gap-2">
                {plan.features.map((f, i) => (
                  <div key={i} className="flex gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    {f}
                  </div>
                ))}
              </CardBody>

              <CardFooter>
                {plan.type === "free" ? (
                  <Button as={Link} href="/signup" fullWidth>
                    Commencer gratuitement
                  </Button>
                ) : (
                  <Button
                    fullWidth
                    color={plan.popular ? "success" : plan.color}
                    isLoading={loadingPlan === plan.name}
                    onPress={() =>
                      startCheckout(priceId!, plan.name)
                    }
                  >
                    Choisir {plan.name}
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