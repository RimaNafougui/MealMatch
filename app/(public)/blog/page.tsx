"use client";
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { Chip } from "@heroui/chip";
import { Avatar } from "@heroui/avatar";
import {
  BookOpen,
  Clock,
  UtensilsCrossed,
  Leaf,
  WalletCards,
  Brain,
  ShoppingCart,
  Heart,
} from "lucide-react";

const featured = {
  category: "Nutrition",
  categoryColor: "success" as const,
  icon: <Brain className="w-5 h-5" />,
  title:
    "Comment l'IA révolutionne la planification de repas pour les étudiants",
  excerpt:
    "Découvrez comment MealMatch utilise l'intelligence artificielle pour créer des plans de repas parfaitement adaptés à ton budget, tes goûts et tes besoins nutritionnels — en quelques secondes.",
  author: "Équipe MealMatch",
  date: "15 février 2026",
  readTime: "5 min",
  tags: ["IA", "Planification", "Étudiants"],
};

const posts = [
  {
    category: "Budget",
    categoryColor: "warning" as const,
    icon: <WalletCards className="w-5 h-5 text-warning" />,
    title: "Manger sainement avec 50 $ par semaine : guide complet",
    excerpt:
      "On t'explique comment optimiser chaque dollar de ton budget épicerie sans sacrifier la qualité ni la variété de tes repas.",
    author: "Équipe MealMatch",
    date: "10 février 2026",
    readTime: "7 min",
    tags: ["Budget", "Astuces"],
  },
  {
    category: "Recettes",
    categoryColor: "danger" as const,
    icon: <UtensilsCrossed className="w-5 h-5 text-danger" />,
    title: "5 recettes rapides pour les soirs de semaine chargés",
    excerpt:
      "Moins de 20 minutes en cuisine, des ingrédients simples et des résultats délicieux. Ces recettes vont devenir tes nouvelles favorites.",
    author: "Équipe MealMatch",
    date: "5 février 2026",
    readTime: "4 min",
    tags: ["Recettes", "Rapide"],
  },
  {
    category: "Alimentation végétale",
    categoryColor: "success" as const,
    icon: <Leaf className="w-5 h-5 text-success" />,
    title: "Débuter une alimentation végétalienne sans se perdre",
    excerpt:
      "Transition vers une alimentation à base de plantes ? Voici les bases nutritionnelles, les substituts essentiels et des recettes pour bien démarrer.",
    author: "Équipe MealMatch",
    date: "28 janvier 2026",
    readTime: "6 min",
    tags: ["Végétalien", "Nutrition"],
  },
  {
    category: "Épicerie",
    categoryColor: "primary" as const,
    icon: <ShoppingCart className="w-5 h-5 text-primary" />,
    title: "L'art de la liste d'épicerie intelligente",
    excerpt:
      "Une bonne liste d'épicerie, c'est la clé pour éviter le gaspillage et rester dans ton budget. Voici comment la structurer efficacement.",
    author: "Équipe MealMatch",
    date: "20 janvier 2026",
    readTime: "5 min",
    tags: ["Épicerie", "Organisation"],
  },
  {
    category: "Nutrition",
    categoryColor: "secondary" as const,
    icon: <Heart className="w-5 h-5 text-secondary" />,
    title: "Macronutriments 101 : comprendre protéines, glucides et lipides",
    excerpt:
      "Un guide simple et accessible pour comprendre le rôle de chaque macronutriment et comment les équilibrer dans tes repas quotidiens.",
    author: "Équipe MealMatch",
    date: "12 janvier 2026",
    readTime: "8 min",
    tags: ["Nutrition", "Santé"],
  },
  {
    category: "Astuces",
    categoryColor: "warning" as const,
    icon: <BookOpen className="w-5 h-5 text-warning" />,
    title: "Meal prep du dimanche : prépare toute ta semaine en 2 heures",
    excerpt:
      "Le meal prep, c'est le secret des étudiants qui mangent bien sans y passer des heures chaque soir. Voici une méthode qui fonctionne vraiment.",
    author: "Équipe MealMatch",
    date: "3 janvier 2026",
    readTime: "6 min",
    tags: ["Meal Prep", "Organisation"],
  },
];

const categories = [
  { label: "Tous", color: "default" as const },
  { label: "Nutrition", color: "success" as const },
  { label: "Budget", color: "warning" as const },
  { label: "Recettes", color: "danger" as const },
  { label: "Astuces", color: "primary" as const },
];

export default function BlogPage() {
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
          Blog
        </Chip>
        <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
          Conseils pour <span className="text-success">mieux manger</span>
        </h1>
        <p className="text-default-500 text-lg max-w-2xl">
          Recettes, nutrition, budget et astuces pour les étudiants qui veulent
          manger mieux sans se compliquer la vie.
        </p>
      </section>

      {/* Category filters */}
      <section className="flex flex-wrap justify-center gap-2">
        {categories.map((cat, i) => (
          <Chip
            key={i}
            color={cat.color}
            variant={i === 0 ? "solid" : "flat"}
            className="cursor-pointer text-sm px-2 py-4"
          >
            {cat.label}
          </Chip>
        ))}
      </section>

      {/* Featured post */}
      <section>
        <Card className="p-6 backdrop-blur-xl bg-white/70 dark:bg-black/40 border border-success/30 shadow-lg shadow-success/10">
          <CardHeader className="flex flex-col items-start gap-3 pb-2">
            <div className="flex items-center gap-2">
              <Chip
                color={featured.categoryColor}
                variant="flat"
                size="sm"
                startContent={featured.icon}
                className="font-semibold"
              >
                {featured.category}
              </Chip>
              <Chip
                variant="flat"
                color="default"
                size="sm"
                className="font-semibold"
              >
                ✦ Article à la une
              </Chip>
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight">
              {featured.title}
            </h2>
            <p className="text-default-500 text-base leading-relaxed">
              {featured.excerpt}
            </p>
          </CardHeader>
          <CardFooter className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4">
            <div className="flex items-center gap-3">
              <Avatar name="MM" size="sm" color="success" isBordered />
              <div>
                <p className="text-sm font-semibold">{featured.author}</p>
                <div className="flex items-center gap-2 text-default-400 text-xs">
                  <span>{featured.date}</span>
                  <span>·</span>
                  <Clock className="w-3 h-3" />
                  <span>{featured.readTime} de lecture</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {featured.tags.map((tag, i) => (
                <Chip key={i} size="sm" variant="bordered" className="text-xs">
                  {tag}
                </Chip>
              ))}
            </div>
          </CardFooter>
        </Card>
      </section>

      {/* Posts grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post, index) => (
          <Card
            key={index}
            isHoverable
            className="p-4 backdrop-blur-xl bg-white/70 dark:bg-black/40 border border-divider/50 flex flex-col"
          >
            <CardHeader className="flex flex-col items-start gap-3 pb-2">
              <Chip
                color={post.categoryColor}
                variant="flat"
                size="sm"
                startContent={post.icon}
                className="font-semibold"
              >
                {post.category}
              </Chip>
              <h3 className="font-bold text-base leading-snug">{post.title}</h3>
            </CardHeader>
            <CardBody className="flex flex-col gap-3 py-2 flex-grow">
              <p className="text-default-500 text-sm leading-relaxed">
                {post.excerpt}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
                {post.tags.map((tag, i) => (
                  <Chip
                    key={i}
                    size="sm"
                    variant="bordered"
                    className="text-xs"
                  >
                    {tag}
                  </Chip>
                ))}
              </div>
            </CardBody>
            <CardFooter className="flex items-center justify-between pt-3">
              <div className="flex items-center gap-2">
                <Avatar
                  name="MM"
                  size="sm"
                  color="success"
                  isBordered
                  className="w-6 h-6 text-tiny"
                />
                <div className="flex items-center gap-1.5 text-default-400 text-xs">
                  <span>{post.date}</span>
                  <span>·</span>
                  <Clock className="w-3 h-3" />
                  <span>{post.readTime}</span>
                </div>
              </div>
            </CardFooter>
          </Card>
        ))}
      </section>

      {/* Newsletter CTA */}
      <section>
        <Card className="bg-gradient-to-r from-green-400 to-green-500 p-12 text-center border-none">
          <CardBody className="gap-6 items-center justify-center">
            <h2 className="text-4xl font-bold text-white">
              Ne rate aucun article
            </h2>
            <p className="text-white/90 text-lg max-w-xl">
              Reçois nos meilleurs conseils nutrition, recettes et astuces
              budget directement dans ta boîte courriel.
            </p>
            <div className="flex gap-3 flex-wrap justify-center">
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
                href="/features"
                size="lg"
                variant="bordered"
                className="text-white border-white"
              >
                Découvrir MealMatch
              </Button>
            </div>
          </CardBody>
        </Card>
      </section>
    </div>
    </div>
  );
}
