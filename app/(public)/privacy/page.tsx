import { Card, CardBody, CardHeader } from "@heroui/card";
import { Link } from "@heroui/link";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { Database, Eye, Share2, Lock, Clock, UserCheck, Cookie, RefreshCw, Mail } from "lucide-react";

const sections = [
  {
    icon: <Eye className="w-6 h-6 text-primary" />,
    color: "primary" as const,
    title: "1. Données collectées",
    content: "Nous collectons uniquement les informations nécessaires au bon fonctionnement de nos services :",
    list: [
      "Informations de compte : nom, adresse courriel, mot de passe (chiffré)",
      "Préférences alimentaires : restrictions, allergies, objectifs nutritionnels",
      "Données d'utilisation : pages visitées, fonctionnalités utilisées",
      "Informations de paiement : traitées par Stripe — jamais stockées chez nous",
      "Données techniques : adresse IP, type de navigateur, identifiants de session",
    ],
  },
  {
    icon: <Database className="w-6 h-6 text-success" />,
    color: "success" as const,
    title: "2. Utilisation des données",
    content: "Vos informations sont utilisées exclusivement pour :",
    list: [
      "Créer et gérer votre compte utilisateur",
      "Générer des plans de repas personnalisés via notre IA",
      "Traiter vos paiements et gérer votre abonnement",
      "Vous envoyer des communications transactionnelles",
      "Améliorer nos algorithmes et notre interface",
      "Assurer la sécurité de la plateforme",
    ],
  },
  {
    icon: <Share2 className="w-6 h-6 text-warning" />,
    color: "warning" as const,
    title: "3. Partage des données",
    content:
      "Nous ne vendons jamais vos données personnelles. Nous les partageons uniquement avec nos prestataires de services essentiels liés par des accords de confidentialité stricts :",
    list: [
      "Supabase — base de données et authentification",
      "Stripe — traitement sécurisé des paiements",
      "OpenAI — génération de contenu par IA",
      "Autorités compétentes — uniquement si la loi l'exige",
    ],
  },
  {
    icon: <Lock className="w-6 h-6 text-danger" />,
    color: "danger" as const,
    title: "4. Sécurité",
    content:
      "Nous mettons en œuvre des mesures de sécurité adaptées pour protéger vos informations :",
    list: [
      "Chiffrement des données en transit (TLS/HTTPS)",
      "Mots de passe hashés — jamais stockés en clair",
      "Authentification sécurisée via Supabase",
      "Accès restreint aux données par notre équipe",
    ],
  },
  {
    icon: <Clock className="w-6 h-6 text-secondary" />,
    color: "secondary" as const,
    title: "5. Conservation des données",
    content:
      "Vos données sont conservées aussi longtemps que votre compte est actif. Si vous supprimez votre compte, vos données personnelles seront effacées dans un délai de 30 jours, sauf obligation légale de conservation plus longue (ex. obligations fiscales).",
  },
  {
    icon: <UserCheck className="w-6 h-6 text-primary" />,
    color: "primary" as const,
    title: "6. Vos droits",
    content:
      "Conformément à la LPRPDE et à la Loi 25 du Québec, vous avez le droit de :",
    list: [
      "Accéder aux données personnelles que nous détenons sur vous",
      "Demander la correction d'informations inexactes",
      "Demander la suppression de vos données (droit à l'effacement)",
      "Retirer votre consentement au traitement de vos données",
      "Déposer une plainte auprès du Commissariat à la vie privée du Canada",
    ],
  },
  {
    icon: <Cookie className="w-6 h-6 text-warning" />,
    color: "warning" as const,
    title: "7. Témoins (cookies)",
    content:
      "MealMatch utilise des témoins (cookies) pour maintenir votre session de connexion, mémoriser vos préférences et analyser l'utilisation à des fins d'amélioration. Vous pouvez configurer votre navigateur pour les refuser, mais cela pourrait affecter certaines fonctionnalités du service.",
  },
  {
    icon: <RefreshCw className="w-6 h-6 text-success" />,
    color: "success" as const,
    title: "8. Modifications de la politique",
    content:
      "Nous pouvons mettre à jour cette politique de temps à autre. En cas de modifications importantes, nous vous en informerons par courriel ou via une notification dans l'application au moins 30 jours avant leur entrée en vigueur.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="flex flex-col gap-16 py-12">
      {/* Hero */}
      <section className="text-center flex flex-col items-center gap-4">
        <Chip color="primary" variant="flat" size="sm" className="font-semibold">
          Légal
        </Chip>
        <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
          Politique de{" "}
          <span className="text-primary">Confidentialité</span>
        </h1>
        <p className="text-default-500 text-lg max-w-2xl">
          Vos données vous appartiennent. Découvrez comment nous les protégeons.
          Dernière mise à jour : 21 février 2025.
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
              <p className="text-default-500 text-sm leading-relaxed">{section.content}</p>
              {section.list && (
                <ul className="flex flex-col gap-1.5 mt-1">
                  {section.list.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-default-500">
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
            <h2 className="text-3xl font-bold text-white">
              Questions sur vos données ?
            </h2>
            <p className="text-white/90 text-lg max-w-xl">
              Contactez notre responsable de la confidentialité pour toute question ou pour exercer vos droits.
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
