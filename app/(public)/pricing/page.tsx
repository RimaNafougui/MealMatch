"use client";
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { CheckCircle2, Zap, Star, Users } from "lucide-react";

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
    cta: "Commencer gratuitement",
    href: "/signup",
    variant: "bordered" as const,
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
    href: "/signup",
    variant: "solid" as const,
  },
  {
    name: "Premium",
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
    href: "/signup",
    variant: "bordered" as const,
  },
];

const faq = [
  {
    q: "Puis-je changer de plan à tout moment ?",
    a: "Oui, tu peux upgrader ou downgrader ton plan à tout moment. Les changements prennent effet immédiatement.",
  },
  {
    q: "Est-ce qu'il y a un engagement ?",
    a: "Non, aucun engagement. Tu peux annuler ton abonnement à tout moment sans frais supplémentaires.",
  },
  {
    q: "Comment fonctionne l'essai gratuit ?",
    a: "Le plan gratuit est disponible sans limite de temps. Tu peux passer au plan payant quand tu le souhaites.",
  },
  {
    q: "Quels moyens de paiement acceptez-vous ?",
    a: "Nous acceptons les cartes de crédit et débit (Visa, Mastercard, American Express) et PayPal. Tous les prix sont en dollars canadiens (CAD).",
  },
  {
    q: "Y a-t-il une remise pour les étudiants ?",
    a: "Notre plan Étudiant est déjà conçu pour être accessible. Contacte le support avec ta carte étudiante pour des offres spéciales.",
  },
];

export default function PricingPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 pt-16 pb-12">
      <div className="flex flex-col gap-16 py-12">
        {/* Hero */}
        <section className="text-center flex flex-col items-center gap-4">
          <Chip
            color="success"
            variant="flat"
            size="sm"
            className="font-semibold"
          >
            Tarification
          </Chip>
          <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
            Simple et <span className="text-success">transparent</span>
          </h1>
          <p className="text-default-500 text-lg max-w-2xl">
            Commence gratuitement, passe au plan payant quand tu en as besoin.
            Pas de surprise, pas de frais cachés.
          </p>
        </section>

        {/* Pricing cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`p-4 border ${
                plan.popular
                  ? "border-success shadow-lg shadow-success/20 scale-[1.02]"
                  : "border-divider/50"
              } backdrop-blur-xl bg-white/70 dark:bg-black/40 relative`}
            >
              {plan.popular && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2">
                  <Chip
                    color="success"
                    variant="solid"
                    size="sm"
                    className="font-bold"
                  >
                    Populaire
                  </Chip>
                </div>
              )}
              <CardHeader className="flex flex-col items-start gap-3 pt-6">
                <div className="flex items-center gap-2">
                  <Chip
                    color={plan.color}
                    variant="flat"
                    size="sm"
                    startContent={plan.icon}
                  >
                    {plan.name}
                  </Chip>
                </div>
                <div>
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-default-500 text-sm ml-1">
                    / {plan.period}
                  </span>
                </div>
                <p className="text-default-500 text-sm">{plan.description}</p>
              </CardHeader>

              <Divider className="my-2" />

              <CardBody className="flex flex-col gap-2 py-4">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
                {plan.unavailable.map((feature, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-sm text-default-400 line-through"
                  >
                    <CheckCircle2 className="w-4 h-4 text-default-300 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </CardBody>

              <CardFooter>
                <Button
                  as={Link}
                  href={plan.href}
                  color={plan.popular ? "success" : plan.color}
                  variant={plan.popular ? "solid" : plan.variant}
                  fullWidth
                  className="font-semibold"
                >
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </section>

        {/* FAQ */}
        <section className="flex flex-col gap-8 max-w-3xl mx-auto w-full">
          <h2 className="text-3xl font-bold text-center">
            Questions fréquentes
          </h2>
          <div className="flex flex-col gap-4">
            {faq.map((item, index) => (
              <Card
                key={index}
                className="p-4 border border-divider/50 bg-white/50 dark:bg-black/20"
              >
                <CardBody className="flex flex-col gap-2 p-2">
                  <h3 className="font-semibold text-base">{item.q}</h3>
                  <p className="text-default-500 text-sm">{item.a}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section>
          <Card className="bg-gradient-to-r from-green-400 to-green-500 p-12 text-center border-none">
            <CardBody className="gap-6 items-center justify-center">
              <h2 className="text-4xl font-bold text-white">
                Commence dès aujourd'hui
              </h2>
              <p className="text-white/90 text-lg max-w-xl">
                Rejoins MealMatch gratuitement et découvre une façon plus
                intelligente de manger.
              </p>
              <div className="flex gap-3">
                <Button
                  as={Link}
                  href="/signup"
                  size="lg"
                  className="bg-white text-success font-bold"
                >
                  S'inscrire gratuitement
                </Button>
                <Button
                  as={Link}
                  href="/support"
                  size="lg"
                  variant="bordered"
                  className="text-white border-white"
                >
                  Contacter le support
                </Button>
              </div>
            </CardBody>
          </Card>
        </section>
      </div>
    </div>
  );
}
