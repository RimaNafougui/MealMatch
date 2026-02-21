"use client";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { Chip } from "@heroui/chip";
import { Progress } from "@heroui/progress";
import { Divider } from "@heroui/divider";
import {
  Flame,
  Beef,
  Droplets,
  Wheat,
  Apple,
  Fish,
  Salad,
  Activity,
  Target,
  BookOpen,
  Heart,
} from "lucide-react";

const macros = [
  {
    name: "Protéines",
    icon: <Beef className="w-5 h-5 text-danger" />,
    color: "danger" as const,
    recommended: "15-25%",
    grams: "56-100g",
    description:
      "Les protéines construisent et réparent les muscles. Essentielles pour les étudiants actifs.",
    sources: ["Viande maigre", "Œufs", "Légumineuses", "Tofu", "Produits laitiers"],
    value: 20,
  },
  {
    name: "Glucides",
    icon: <Wheat className="w-5 h-5 text-warning" />,
    color: "warning" as const,
    recommended: "45-65%",
    grams: "225-325g",
    description:
      "Source d'énergie principale du corps. Privilégie les glucides complexes pour une énergie durable.",
    sources: ["Riz brun", "Pâtes complètes", "Avoine", "Patate douce", "Quinoa"],
    value: 55,
  },
  {
    name: "Lipides",
    icon: <Droplets className="w-5 h-5 text-primary" />,
    color: "primary" as const,
    recommended: "20-35%",
    grams: "44-78g",
    description:
      "Indispensables pour le cerveau et l'absorption des vitamines. Opte pour les bonnes graisses.",
    sources: ["Avocat", "Huile d'olive", "Noix", "Graines", "Poisson gras"],
    value: 28,
  },
];

const vitamins = [
  {
    name: "Vitamine C",
    icon: <Apple className="w-5 h-5 text-warning" />,
    benefit: "Immunité & énergie",
    sources: "Agrumes, poivrons, kiwi",
    rda: "75-90mg",
  },
  {
    name: "Vitamine D",
    icon: <Activity className="w-5 h-5 text-yellow-500" />,
    benefit: "Os & humeur",
    sources: "Poisson gras, œufs, soleil",
    rda: "600-800 UI",
  },
  {
    name: "Fer",
    icon: <Beef className="w-5 h-5 text-red-500" />,
    benefit: "Énergie & concentration",
    sources: "Viande rouge, lentilles, épinards",
    rda: "8-18mg",
  },
  {
    name: "Oméga-3",
    icon: <Fish className="w-5 h-5 text-blue-500" />,
    benefit: "Cerveau & cœur",
    sources: "Saumon, sardines, noix",
    rda: "250-500mg EPA+DHA",
  },
  {
    name: "Magnésium",
    icon: <Salad className="w-5 h-5 text-green-500" />,
    benefit: "Stress & sommeil",
    sources: "Noix, légumes verts, chocolat noir",
    rda: "310-420mg",
  },
  {
    name: "Calcium",
    icon: <Heart className="w-5 h-5 text-pink-500" />,
    benefit: "Os & muscles",
    sources: "Produits laitiers, sardines, brocoli",
    rda: "1000-1300mg",
  },
];

const tips = [
  {
    title: "Petit-déjeuner équilibré",
    description:
      "Ne saute jamais le petit-déjeuner. Un repas riche en protéines et glucides complexes améliore ta concentration tout au long de la matinée.",
    icon: "🌅",
  },
  {
    title: "Hydratation",
    description:
      "Bois au moins 1,5 à 2 litres d'eau par jour. La déshydratation réduit les performances cognitives jusqu'à 20%.",
    icon: "💧",
  },
  {
    title: "Collations saines",
    description:
      "Préfère les fruits, noix ou yaourts aux chips et sucreries. Ces collations stabilisent ta glycémie et t'évitent les coups de fatigue.",
    icon: "🍎",
  },
  {
    title: "Cuisiner en batch",
    description:
      "Prépare tes repas en grande quantité le week-end. Ça te fera économiser du temps et de l'argent en semaine.",
    icon: "🍲",
  },
  {
    title: "Couleurs dans l'assiette",
    description:
      "Vise 5 couleurs différentes de légumes et fruits par jour. Chaque couleur apporte des antioxydants et micronutriments uniques.",
    icon: "🌈",
  },
  {
    title: "Manger sans écran",
    description:
      "Mange sans regarder ton téléphone ou ordinateur. La pleine conscience alimentaire améliore la digestion et évite la surconsommation.",
    icon: "🧘",
  },
];

const calorieProfiles = [
  { profile: "Sédentaire (homme)", calories: "2000-2400 kcal" },
  { profile: "Sédentaire (femme)", calories: "1600-2000 kcal" },
  { profile: "Actif (homme)", calories: "2400-3000 kcal" },
  { profile: "Actif (femme)", calories: "2000-2400 kcal" },
  { profile: "Très actif (homme)", calories: "3000+ kcal" },
  { profile: "Très actif (femme)", calories: "2400+ kcal" },
];

export default function NutritionPage() {
  return (
    <div className="flex flex-col gap-16 py-12">
      {/* Hero */}
      <section className="text-center flex flex-col items-center gap-4">
        <Chip color="success" variant="flat" size="sm" className="font-semibold">
          Guide Nutritionnel
        </Chip>
        <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
          Mange{" "}
          <span className="text-success">intelligemment</span>
        </h1>
        <p className="text-default-500 text-lg max-w-2xl">
          Comprends les bases de la nutrition pour mieux choisir tes repas, optimiser ton
          énergie et prendre soin de ta santé — même avec un budget étudiant.
        </p>
        <Button as={Link} href="/signup" color="success" size="lg" className="font-semibold mt-2">
          Suivre ma nutrition avec MealMatch
        </Button>
      </section>

      {/* Calories */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Flame className="w-6 h-6 text-danger" />
          <h2 className="text-2xl font-bold">Besoins caloriques journaliers</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-4 border border-divider/50 bg-white/70 dark:bg-black/40">
            <CardHeader>
              <h3 className="font-semibold">Apport recommandé par profil</h3>
            </CardHeader>
            <CardBody className="flex flex-col gap-2 pt-0">
              {calorieProfiles.map((p, i) => (
                <div key={i} className="flex justify-between items-center py-1.5">
                  <span className="text-sm text-default-600">{p.profile}</span>
                  <Chip size="sm" variant="flat" color="default" className="font-semibold text-xs">
                    {p.calories}
                  </Chip>
                </div>
              ))}
            </CardBody>
          </Card>

          <Card className="p-4 border border-divider/50 bg-white/70 dark:bg-black/40">
            <CardHeader>
              <h3 className="font-semibold">Comment calculer tes besoins</h3>
            </CardHeader>
            <CardBody className="flex flex-col gap-3 pt-0">
              <p className="text-default-500 text-sm">
                Tes besoins caloriques dépendent de plusieurs facteurs : âge, sexe, taille,
                poids et niveau d'activité physique.
              </p>
              <div className="bg-default-50 dark:bg-default-100/10 rounded-xl p-4">
                <p className="text-xs font-semibold text-success uppercase mb-2">Formule simplifiée</p>
                <p className="text-sm font-mono">
                  BMR × Facteur d'activité = Calories totales
                </p>
                <Divider className="my-2" />
                <div className="flex flex-col gap-1 text-xs text-default-500">
                  <span>Sédentaire : BMR × 1.2</span>
                  <span>Légèrement actif : BMR × 1.375</span>
                  <span>Modérément actif : BMR × 1.55</span>
                  <span>Très actif : BMR × 1.725</span>
                </div>
              </div>
              <p className="text-xs text-default-400">
                MealMatch calcule automatiquement tes besoins selon ton profil.
              </p>
            </CardBody>
          </Card>
        </div>
      </section>

      {/* Macronutrients */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <Target className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">Les macronutriments</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {macros.map((macro, index) => (
            <Card
              key={index}
              isHoverable
              className="p-4 border border-divider/50 bg-white/70 dark:bg-black/40"
            >
              <CardHeader className="flex gap-3 pb-2">
                <Avatar
                  isBordered
                  radius="md"
                  color={macro.color}
                  icon={macro.icon}
                  className="bg-default-50"
                />
                <div>
                  <p className="font-bold">{macro.name}</p>
                  <p className="text-xs text-default-400">{macro.grams} / jour</p>
                </div>
              </CardHeader>
              <CardBody className="flex flex-col gap-4 pt-0">
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs text-default-500">
                    <span>Recommandé</span>
                    <span className="font-semibold">{macro.recommended}</span>
                  </div>
                  <Progress value={macro.value} color={macro.color} size="sm" />
                </div>
                <p className="text-default-500 text-sm">{macro.description}</p>
                <div>
                  <p className="text-xs font-semibold text-success uppercase mb-1.5">Bonnes sources</p>
                  <div className="flex flex-wrap gap-1">
                    {macro.sources.map((src, i) => (
                      <Chip key={i} size="sm" variant="flat" color={macro.color} className="text-xs">
                        {src}
                      </Chip>
                    ))}
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      {/* Vitamins & Minerals */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-warning" />
          <h2 className="text-2xl font-bold">Vitamines & minéraux essentiels</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {vitamins.map((v, index) => (
            <Card
              key={index}
              className="p-4 border border-divider/50 bg-white/50 dark:bg-black/20"
            >
              <CardBody className="flex flex-col gap-2 p-2">
                <div className="flex items-center gap-2">
                  {v.icon}
                  <span className="font-semibold text-sm">{v.name}</span>
                  <Chip size="sm" variant="flat" color="default" className="ml-auto text-xs">
                    {v.rda}
                  </Chip>
                </div>
                <p className="text-xs text-success font-medium">{v.benefit}</p>
                <p className="text-xs text-default-500">Sources : {v.sources}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      {/* Tips */}
      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold">Conseils pour bien manger étudiant</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tips.map((tip, index) => (
            <Card
              key={index}
              isHoverable
              className="p-4 border border-divider/50 bg-white/70 dark:bg-black/40"
            >
              <CardBody className="flex flex-col gap-2 p-2">
                <span className="text-3xl">{tip.icon}</span>
                <h3 className="font-semibold text-sm">{tip.title}</h3>
                <p className="text-default-500 text-xs leading-relaxed">{tip.description}</p>
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
              Laisse MealMatch gérer ta nutrition
            </h2>
            <p className="text-white/90 text-lg max-w-xl">
              Plus besoin de calculer manuellement. MealMatch suit tes macros et te propose
              des repas parfaitement équilibrés.
            </p>
            <Button as={Link} href="/signup" size="lg" className="bg-white text-success font-bold">
              Commencer gratuitement
            </Button>
          </CardBody>
        </Card>
      </section>
    </div>
  );
}
