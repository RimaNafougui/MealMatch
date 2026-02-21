"use client";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { Chip } from "@heroui/chip";
import {
  Bot,
  WalletCards,
  ShoppingCart,
  Heart,
  Calendar,
  BookOpen,
  Leaf,
  BarChart3,
  Clock,
  Star,
  Zap,
  Shield,
} from "lucide-react";
import { title, subtitle } from "@/components/primitives";

const mainFeatures = [
  {
    icon: <Bot className="w-7 h-7 text-primary" />,
    color: "primary" as const,
    title: "Plans de repas IA",
    description:
      "Notre intelligence artificielle analyse tes préférences, restrictions alimentaires et budget pour générer des plans de repas parfaitement adaptés à toi.",
    details: [
      "Personnalisation complète selon tes goûts",
      "Adaptation aux régimes spéciaux (végétalien, sans gluten, etc.)",
      "Génération en quelques secondes",
      "Plans hebdomadaires complets",
    ],
  },
  {
    icon: <WalletCards className="w-7 h-7 text-danger" />,
    color: "danger" as const,
    title: "Budget étudiant",
    description:
      "Mange sainement sans te ruiner. MealMatch optimise tes repas pour respecter ton budget tout en garantissant une alimentation équilibrée.",
    details: [
      "Recettes économiques dès 2$ par repas",
      "Comparaison des prix automatique",
      "Optimisation des achats en vrac",
      "Suivi des dépenses alimentaires",
    ],
  },
  {
    icon: <ShoppingCart className="w-7 h-7 text-warning" />,
    color: "warning" as const,
    title: "Listes d'épicerie",
    description:
      "Plus besoin de griffonner ta liste de courses. MealMatch génère automatiquement ta liste d'épicerie organisée par rayon à partir de ton plan de repas.",
    details: [
      "Liste générée automatiquement",
      "Organisée par catégorie de produits",
      "Quantités précises calculées",
      "Partage facile avec un colocataire",
    ],
  },
  {
    icon: <Heart className="w-7 h-7 text-secondary" />,
    color: "secondary" as const,
    title: "Suivi nutritionnel",
    description:
      "Garde un œil sur ton apport en calories, protéines, lipides et glucides. MealMatch t'aide à atteindre tes objectifs nutritionnels.",
    details: [
      "Macronutriments détaillés par repas",
      "Suivi des calories journalières",
      "Objectifs personnalisables",
      "Rapports hebdomadaires",
    ],
  },
  {
    icon: <BookOpen className="w-7 h-7 text-success" />,
    color: "success" as const,
    title: "Bibliothèque de recettes",
    description:
      "Accède à plus de 120 recettes soigneusement sélectionnées, faciles à préparer et adaptées à la vie étudiante.",
    details: [
      "Plus de 120 recettes disponibles",
      "Instructions étape par étape",
      "Temps de préparation estimé",
      "Niveau de difficulté indiqué",
    ],
  },
  {
    icon: <Calendar className="w-7 h-7 text-primary" />,
    color: "primary" as const,
    title: "Planification flexible",
    description:
      "Planifie tes repas pour la semaine entière ou ajuste au jour le jour. La flexibilité est au cœur de MealMatch.",
    details: [
      "Planification sur 7 jours",
      "Modification facile à tout moment",
      "Sauvegarde de tes plans favoris",
      "Rappels et notifications",
    ],
  },
];

const quickFeatures = [
  { icon: <Zap className="w-5 h-5" />, label: "Génération rapide" },
  { icon: <Shield className="w-5 h-5" />, label: "Données sécurisées" },
  { icon: <Leaf className="w-5 h-5" />, label: "Options véganes" },
  { icon: <BarChart3 className="w-5 h-5" />, label: "Statistiques détaillées" },
  { icon: <Clock className="w-5 h-5" />, label: "Recettes rapides" },
  { icon: <Star className="w-5 h-5" />, label: "Favoris illimités" },
];

export default function FeaturesPage() {
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
          Fonctionnalités
        </Chip>
        <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
          Tout ce dont tu as <span className="text-success">besoin</span>
        </h1>
        <p className="text-default-500 text-lg max-w-2xl">
          MealMatch réunit tout ce qu'il te faut pour manger sainement, dépenser
          moins et cuisiner sans stress — spécialement conçu pour les étudiants.
        </p>
        <div className="flex gap-3 mt-2">
          <Button
            as={Link}
            href="/signup"
            color="success"
            size="lg"
            className="font-semibold"
          >
            Essayer gratuitement
          </Button>
          <Button as={Link} href="/pricing" variant="bordered" size="lg">
            Voir les tarifs
          </Button>
        </div>
      </section>

      {/* Quick feature pills */}
      <section className="flex flex-wrap justify-center gap-3">
        {quickFeatures.map((f, i) => (
          <Chip
            key={i}
            startContent={f.icon}
            variant="flat"
            color="default"
            className="text-sm px-3 py-4"
          >
            {f.label}
          </Chip>
        ))}
      </section>

      {/* Main features grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mainFeatures.map((feature, index) => (
          <Card
            key={index}
            isHoverable
            className="p-4 backdrop-blur-xl bg-white/70 dark:bg-black/40 border border-divider/50"
          >
            <CardHeader className="flex gap-4 pb-2">
              <Avatar
                isBordered
                radius="md"
                color={feature.color}
                icon={feature.icon}
                className="bg-default-50"
              />
              <h3 className="font-bold text-lg">{feature.title}</h3>
            </CardHeader>
            <CardBody className="flex flex-col gap-4">
              <p className="text-default-500 text-sm">{feature.description}</p>
              <ul className="flex flex-col gap-1.5">
                {feature.details.map((detail, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-success flex-shrink-0" />
                    {detail}
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        ))}
      </section>

      {/* CTA */}
      <section>
        <Card className="bg-gradient-to-r from-green-400 to-green-500 p-12 text-center border-none">
          <CardBody className="gap-6 items-center justify-center">
            <h2 className="text-4xl font-bold text-white">
              Prêt à transformer ta façon de manger ?
            </h2>
            <p className="text-white/90 text-lg max-w-xl">
              Rejoins des milliers d'étudiants qui mangent mieux grâce à
              MealMatch.
            </p>
            <Button
              as={Link}
              href="/signup"
              size="lg"
              className="bg-white text-success font-bold"
            >
              Commencer maintenant
            </Button>
          </CardBody>
        </Card>
      </section>
    </div>
    </div>
  );
}
