import { Card, CardBody, CardHeader } from "@heroui/card";
import { Link } from "@heroui/link";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import {
  FileText,
  Shield,
  User,
  CreditCard,
  AlertTriangle,
  Scale,
  RefreshCw,
  Mail,
} from "lucide-react";

const sections = [
  {
    icon: <FileText className="w-6 h-6 text-primary" />,
    color: "primary" as const,
    title: "1. Acceptation des conditions",
    content:
      "En accédant à MealMatch ou en créant un compte, vous acceptez d'être lié par ces conditions d'utilisation ainsi que par notre Politique de confidentialité. Si vous n'acceptez pas ces termes dans leur intégralité, veuillez ne pas utiliser nos services. Ces conditions s'appliquent à tous les utilisateurs, qu'ils disposent d'un compte gratuit ou d'un abonnement payant.",
  },
  {
    icon: <Shield className="w-6 h-6 text-success" />,
    color: "success" as const,
    title: "2. Description du service",
    content:
      "MealMatch est une application de planification de repas alimentée par l'intelligence artificielle. Nos services comprennent la génération de plans de repas personnalisés, l'accès à une bibliothèque de recettes, la création de listes d'épicerie intelligentes, le suivi nutritionnel et la gestion des préférences alimentaires. Nous nous réservons le droit de modifier, suspendre ou interrompre tout aspect du service à tout moment.",
    list: [
      "Génération de plans de repas personnalisés par IA",
      "Accès à une bibliothèque de recettes (120+)",
      "Création de listes d'épicerie intelligentes",
      "Suivi nutritionnel complet",
      "Gestion des préférences alimentaires et des allergies",
    ],
  },
  {
    icon: <User className="w-6 h-6 text-warning" />,
    color: "warning" as const,
    title: "3. Comptes utilisateurs",
    content:
      "Pour utiliser certaines fonctionnalités de MealMatch, vous devez créer un compte. Vous êtes responsable de la confidentialité de vos identifiants et de toutes les activités effectuées sous votre compte. MealMatch se réserve le droit de suspendre ou de résilier tout compte en cas de violation de ces conditions.",
    list: [
      "Fournir des informations exactes et à jour lors de l'inscription",
      "Maintenir la confidentialité de votre mot de passe",
      "Nous notifier immédiatement en cas d'accès non autorisé",
      "Être responsable de toutes les activités sous votre compte",
    ],
  },
  {
    icon: <CreditCard className="w-6 h-6 text-danger" />,
    color: "danger" as const,
    title: "4. Abonnements et paiements",
    content:
      "MealMatch propose des plans d'abonnement payants. En souscrivant, vous acceptez d'être facturé selon le cycle de facturation choisi. Tous les prix sont en dollars canadiens (CAD) et sujets aux taxes applicables. Les abonnements se renouvellent automatiquement, sauf annulation avant la date de renouvellement.",
    list: [
      "Facturation selon le cycle choisi (mensuel)",
      "Prix en dollars canadiens (CAD) — taxes en sus",
      "Renouvellement automatique, sauf annulation préalable",
      "Annulation possible à tout moment depuis le tableau de bord",
    ],
  },
  {
    icon: <AlertTriangle className="w-6 h-6 text-warning" />,
    color: "warning" as const,
    title: "5. Utilisation acceptable",
    content:
      "Vous acceptez de ne pas utiliser MealMatch à des fins illégales, frauduleuses ou abusives. Toute tentative de pirater, scraper ou perturber nos services est strictement interdite.",
    list: [
      "Ne pas violer les lois canadiennes ou de votre juridiction",
      "Ne pas tenter de pirater ou dégrader nos serveurs",
      "Ne pas extraire des données de manière automatisée sans autorisation",
      "Ne pas partager votre compte ou revendre l'accès à nos services",
    ],
  },
  {
    icon: <Shield className="w-6 h-6 text-primary" />,
    color: "primary" as const,
    title: "6. Propriété intellectuelle",
    content:
      "Tout le contenu présent sur MealMatch — textes, graphismes, logos, interface, code source et recettes — est la propriété exclusive de MealMatch ou de ses partenaires et est protégé par les lois canadiennes et internationales. Aucun contenu ne peut être reproduit ou utilisé à des fins commerciales sans autorisation écrite préalable.",
  },
  {
    icon: <Scale className="w-6 h-6 text-secondary" />,
    color: "secondary" as const,
    title: "7. Limitation de responsabilité",
    content:
      "MealMatch fournit des informations nutritionnelles à titre informatif uniquement. Ce service ne remplace pas les conseils d'un professionnel de la santé ou d'un nutritionniste. Nous déclinons toute responsabilité pour les décisions prises sur la base des informations fournies. Ces conditions sont régies par les lois du Québec et du Canada.",
  },
  {
    icon: <RefreshCw className="w-6 h-6 text-success" />,
    color: "success" as const,
    title: "8. Modification des conditions",
    content:
      "Nous nous réservons le droit de modifier ces conditions à tout moment. En cas de modifications importantes, nous vous en informerons par courriel ou via une notification dans l'application. La poursuite de l'utilisation du service constitue votre acceptation des nouvelles conditions.",
  },
];

export default function TermsPage() {
  return (
    <div className="flex flex-col gap-16 py-12">
      {/* Hero */}
      <section className="text-center flex flex-col items-center gap-4">
        <Chip
          color="primary"
          variant="flat"
          size="sm"
          className="font-semibold"
        >
          Légal
        </Chip>
        <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
          Conditions d&apos; <span className="text-primary">Utilisation</span>
        </h1>
        <p className="text-default-500 text-lg max-w-2xl">
          Veuillez lire attentivement ces conditions avant d&apos;utiliser
          MealMatch. Dernière mise à jour : 21 février 2026.
        </p>
      </section>

      {/* Sections */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto w-full">
        {sections.map((section, index) => (
          <Card
            key={index}
            isHoverable
            className="p-4 backdrop-blur-xl bg-white/70 dark:bg-black/40 border border-divider/50"
          >
            <CardHeader className="flex gap-4 pb-2">
              <div className={`p-2 rounded-xl bg-${section.color}/10`}>
                {section.icon}
              </div>
              <h2 className="font-bold text-base">{section.title}</h2>
            </CardHeader>
            <CardBody className="flex flex-col gap-3">
              <p className="text-default-500 text-sm leading-relaxed">
                {section.content}
              </p>
              {section.list && (
                <ul className="flex flex-col gap-1.5 mt-1">
                  {section.list.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-default-500"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        ))}
      </section>

      {/* Contact CTA */}
      <section className="max-w-5xl mx-auto w-full">
        <Card className="bg-gradient-to-r from-blue-500 to-primary p-12 text-center border-none">
          <CardBody className="gap-6 items-center justify-center">
            <Mail className="w-10 h-10 text-white/80" />
            <h2 className="text-3xl font-bold text-white">Des questions ?</h2>
            <p className="text-white/90 text-lg max-w-xl">
              Notre équipe est disponible pour répondre à toutes vos questions
              concernant ces conditions.
            </p>
            <Button
              as={Link}
              href="mailto:nafouguirima@gmail.com"
              size="lg"
              className="bg-white text-primary font-bold"
            >
              Nous contacter
            </Button>
          </CardBody>
        </Card>
      </section>
    </div>
  );
}
