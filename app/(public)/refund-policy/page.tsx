import { Card, CardBody, CardHeader } from "@heroui/card";
import { Link } from "@heroui/link";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { BadgeCheck, CalendarX, XCircle, Send, CreditCard, ToggleLeft, Gift, Mail } from "lucide-react";

const sections = [
  {
    icon: <BadgeCheck className="w-6 h-6 text-success" />,
    color: "success" as const,
    title: "1. Notre engagement",
    content:
      "Chez MealMatch, votre satisfaction est notre priorité. Si vous rencontrez un problème avec notre service, nous vous encourageons à nous contacter avant de demander un remboursement — nous ferons tout notre possible pour résoudre la situation rapidement.",
  },
  {
    icon: <CalendarX className="w-6 h-6 text-primary" />,
    color: "primary" as const,
    title: "2. Garantie de 14 jours",
    content: "Vous êtes admissible à un remboursement complet si :",
    list: [
      "Vous annulez dans les 14 jours suivant votre premier paiement",
      "Vous n'avez pas utilisé de manière excessive les fonctionnalités Premium",
      "Il s'agit de votre première demande de remboursement pour ce compte",
    ],
  },
  {
    icon: <XCircle className="w-6 h-6 text-danger" />,
    color: "danger" as const,
    title: "3. Cas non remboursables",
    content: "Les remboursements ne sont pas accordés dans les cas suivants :",
    list: [
      "Demandes soumises après le délai de 14 jours suivant le paiement initial",
      "Renouvellements automatiques (pensez à annuler avant votre date de facturation)",
      "Comptes suspendus pour violation des conditions d'utilisation",
      "Frais liés à des transactions frauduleuses",
    ],
  },
  {
    icon: <Send className="w-6 h-6 text-warning" />,
    color: "warning" as const,
    title: "4. Comment faire une demande",
    content: "Pour initier un remboursement, contactez-nous avec les informations suivantes :",
    list: [
      "L'adresse courriel associée à votre compte MealMatch",
      "La date de votre paiement",
      "La raison de votre demande de remboursement",
    ],
  },
  {
    icon: <CreditCard className="w-6 h-6 text-primary" />,
    color: "primary" as const,
    title: "5. Traitement du remboursement",
    content:
      "Les remboursements approuvés sont crédités sur le mode de paiement original. Le délai de traitement peut varier entre 5 et 10 jours ouvrables selon votre institution financière. Tous les remboursements sont effectués en dollars canadiens (CAD). Votre demande sera traitée dans un délai de 5 à 7 jours ouvrables.",
  },
  {
    icon: <ToggleLeft className="w-6 h-6 text-secondary" />,
    color: "secondary" as const,
    title: "6. Annulation d'abonnement",
    content:
      "Vous pouvez annuler votre abonnement à tout moment depuis votre tableau de bord (Paramètres › Abonnement). L'accès aux fonctionnalités Premium reste actif jusqu'à la fin de la période payée. Aucun remboursement proratisé n'est accordé pour les jours restants, sauf dans le cadre de la garantie de 14 jours.",
  },
  {
    icon: <Gift className="w-6 h-6 text-success" />,
    color: "success" as const,
    title: "7. Plan gratuit",
    content:
      "Le plan gratuit de MealMatch n'implique aucun frais et n'est donc pas concerné par cette politique de remboursement. Vous pouvez revenir au plan gratuit à tout moment en annulant votre abonnement payant.",
  },
];

export default function RefundPage() {
  return (
    <div className="flex flex-col gap-16 py-12">
      {/* Hero */}
      <section className="text-center flex flex-col items-center gap-4">
        <Chip color="success" variant="flat" size="sm" className="font-semibold">
          Légal
        </Chip>
        <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
          Politique de{" "}
          <span className="text-success">Remboursement</span>
        </h1>
        <p className="text-default-500 text-lg max-w-2xl">
          Satisfait ou remboursé dans les 14 jours. Sans questions.
          Dernière mise à jour : 21 février 2025.
        </p>
      </section>

      {/* Highlight badge */}
      <section className="flex justify-center">
        <Card className="p-4 backdrop-blur-xl bg-white/70 dark:bg-black/40 border border-success/40 max-w-md w-full text-center">
          <CardBody className="gap-2 items-center">
            <BadgeCheck className="w-8 h-8 text-success" />
            <p className="font-bold text-lg">Garantie satisfaction 14 jours</p>
            <p className="text-default-500 text-sm">
              Remboursement complet si vous n&apos;êtes pas satisfait dans les 14 jours suivant votre premier paiement.
            </p>
          </CardBody>
        </Card>
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
                      <span className="w-1.5 h-1.5 rounded-full bg-success flex-shrink-0 mt-1.5" />
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
        <Card className="bg-gradient-to-r from-green-400 to-green-500 p-12 text-center border-none">
          <CardBody className="gap-6 items-center justify-center">
            <Mail className="w-10 h-10 text-white/80" />
            <h2 className="text-3xl font-bold text-white">
              Besoin d&apos;un remboursement ?
            </h2>
            <p className="text-white/90 text-lg max-w-xl">
              Contactez notre équipe — nous traitons toutes les demandes dans les 5 à 7 jours ouvrables.
            </p>
            <div className="flex gap-3 flex-wrap justify-center">
              <Button
                as={Link}
                href="mailto:nafouguirima@gmail.com"
                size="lg"
                className="bg-white text-success font-bold"
              >
                Faire une demande
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
  );
}
