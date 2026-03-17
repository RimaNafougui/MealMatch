import { Card, CardBody, CardHeader } from "@heroui/card";
import { Link } from "@heroui/link";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import {
  Cookie,
  Settings,
  BarChart2,
  Shield,
  RefreshCw,
  AlertTriangle,
  UserCheck,
  Mail,
} from "lucide-react";

const sections = [
  {
    icon: <Cookie className="w-6 h-6 text-primary" />,
    color: "primary" as const,
    title: "1. Qu'est-ce qu'un témoin (cookie) ?",
    content:
      "Un témoin (cookie) est un petit fichier texte déposé sur votre appareil lorsque vous visitez un site web. Il permet au site de mémoriser certaines informations sur votre visite, comme vos préférences de langue, vos paramètres de connexion ou vos habitudes de navigation. Les témoins ne contiennent pas de virus et ne peuvent pas accéder à d'autres fichiers sur votre appareil.",
  },
  {
    icon: <Settings className="w-6 h-6 text-success" />,
    color: "success" as const,
    title: "2. Témoins strictement nécessaires",
    content:
      "Ces témoins sont indispensables au bon fonctionnement de MealMatch. Ils ne peuvent pas être désactivés car ils assurent des fonctions essentielles du service :",
    list: [
      "Maintien de votre session de connexion (supabase-auth-token)",
      "Mémorisation de vos préférences de sécurité",
      "Prévention des attaques de type CSRF (falsification de requête)",
      "Équilibrage de la charge entre nos serveurs",
      "Mémorisation de votre consentement aux témoins",
    ],
  },
  {
    icon: <UserCheck className="w-6 h-6 text-warning" />,
    color: "warning" as const,
    title: "3. Témoins de fonctionnalité",
    content:
      "Ces témoins permettent de mémoriser vos préférences afin de personnaliser votre expérience sur MealMatch. Leur désactivation peut affecter certaines fonctionnalités :",
    list: [
      "Mémorisation de vos préférences alimentaires et restrictions",
      "Langue et région sélectionnées",
      "Mode d'affichage préféré (clair / sombre)",
      "Dernière vue consultée dans le tableau de bord",
      "Paramètres de filtres et de tri des recettes",
    ],
  },
  {
    icon: <BarChart2 className="w-6 h-6 text-secondary" />,
    color: "secondary" as const,
    title: "4. Témoins analytiques",
    content:
      "Ces témoins nous aident à comprendre comment les visiteurs utilisent MealMatch afin d'améliorer nos services. Les données collectées sont anonymisées et agrégées :",
    list: [
      "Pages les plus visitées et fonctionnalités les plus utilisées",
      "Durée moyenne des sessions et taux de rebond",
      "Provenance du trafic (recherche, réseaux sociaux, direct)",
      "Performances de chargement des pages",
      "Erreurs rencontrées par les utilisateurs",
    ],
  },
  {
    icon: <Shield className="w-6 h-6 text-danger" />,
    color: "danger" as const,
    title: "5. Témoins tiers",
    content:
      "MealMatch utilise des services tiers qui peuvent déposer leurs propres témoins sur votre appareil. Nous n'avons pas de contrôle direct sur ces témoins. Voici les tiers concernés :",
    list: [
      "Supabase — authentification et gestion de session",
      "Stripe — traitement sécurisé des paiements (cookies de sécurité)",
      "OpenAI — aucun témoin déposé directement sur votre appareil",
      "Vercel — optimisation de la livraison du contenu",
    ],
  },
  {
    icon: <AlertTriangle className="w-6 h-6 text-warning" />,
    color: "warning" as const,
    title: "6. Durée de conservation",
    content:
      "La durée de vie des témoins varie selon leur type et leur finalité :",
    list: [
      "Témoins de session : supprimés à la fermeture du navigateur",
      "Témoins d'authentification : 30 jours (renouvelés à chaque connexion)",
      "Témoins de préférences : 12 mois",
      "Témoins analytiques : 13 mois maximum",
      "Témoin de consentement : 12 mois",
    ],
  },
  {
    icon: <Settings className="w-6 h-6 text-primary" />,
    color: "primary" as const,
    title: "7. Gérer vos préférences",
    content:
      "Vous pouvez contrôler et gérer les témoins de plusieurs façons. Notez que le refus de certains témoins peut limiter votre accès à certaines fonctionnalités de MealMatch :",
    list: [
      "Via les paramètres de votre navigateur (Chrome, Firefox, Safari, Edge)",
      "En utilisant le mode navigation privée / incognito",
      "Via notre centre de préférences accessible depuis le pied de page",
      "En supprimant manuellement les témoins stockés dans votre navigateur",
    ],
  },
  {
    icon: <RefreshCw className="w-6 h-6 text-success" />,
    color: "success" as const,
    title: "8. Modifications de la politique",
    content:
      "Nous pouvons mettre à jour cette politique de témoins pour refléter des changements dans nos pratiques ou pour des raisons opérationnelles, légales ou réglementaires. En cas de modifications importantes, nous vous en informerons par courriel ou via une notification dans l'application au moins 30 jours avant leur entrée en vigueur.",
  },
];

export default function CookiePage() {
  return (
    <div className="max-w-7xl mx-auto px-6 pt-16 pb-12">
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
            Politique de <span className="text-primary">Témoins</span>
          </h1>
          <p className="text-default-500 text-lg max-w-2xl">
            Nous utilisons des témoins pour améliorer votre expérience et
            assurer le bon fonctionnement de nos services. Dernière mise à jour : 21 février 2026.
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
              <h2 className="text-3xl font-bold text-white">
                Questions sur les témoins ?
              </h2>
              <p className="text-white/90 text-lg max-w-xl text-center">
                Contactez-nous pour toute question concernant notre utilisation
                des témoins ou pour exercer vos droits.
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
    </div>
  );
}