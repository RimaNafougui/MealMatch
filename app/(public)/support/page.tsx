"use client";
import { useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { Input, Textarea } from "@heroui/input";
import { Chip } from "@heroui/chip";
import { Accordion, AccordionItem } from "@heroui/accordion";
import {
  Mail,
  MessageCircle,
  BookOpen,
  Github,
  Clock,
  HelpCircle,
  Zap,
  Shield,
} from "lucide-react";

const faqItems = [
  {
    q: "Comment générer un plan de repas ?",
    a: "Depuis ton tableau de bord, clique sur « Générer un plan de repas ». Renseigne tes préférences alimentaires, ton budget hebdomadaire et tes restrictions. L'IA génère ensuite un plan complet en quelques secondes.",
  },
  {
    q: "Puis-je modifier les recettes suggérées ?",
    a: "Oui ! Tu peux remplacer n'importe quelle recette dans ton plan en cliquant dessus et en choisissant une alternative depuis la bibliothèque.",
  },
  {
    q: "Comment exporter ma liste d'épicerie ?",
    a: "Depuis la section « Épicerie » de ton tableau de bord, tu peux copier la liste ou l'envoyer par email. L'export PDF est disponible sur les plans payants.",
  },
  {
    q: "Mes données alimentaires sont-elles sécurisées ?",
    a: "Absolument. Toutes tes données sont chiffrées et stockées de manière sécurisée. Nous ne partageons jamais tes informations personnelles avec des tiers.",
  },
  {
    q: "Comment changer mes préférences alimentaires ?",
    a: "Va dans Paramètres > Préférences alimentaires. Tu peux modifier tes allergies, régimes et goûts à tout moment. Les changements s'appliquent aux prochains plans générés.",
  },
  {
    q: "L'application fonctionne-t-elle hors ligne ?",
    a: "Certaines fonctionnalités nécessitent une connexion internet (génération IA, synchronisation). Les recettes que tu as sauvegardées sont accessibles hors ligne.",
  },
  {
    q: "Comment annuler mon abonnement ?",
    a: "Va dans Paramètres > Abonnement et clique sur « Annuler l'abonnement ». L'annulation prend effet à la fin de la période de facturation en cours.",
  },
  {
    q: "Puis-je partager mon plan avec un colocataire ?",
    a: "La fonctionnalité de partage est disponible sur le plan Premium. Elle permet de créer des plans adaptés à plusieurs personnes.",
  },
];

const contactOptions = [
  {
    icon: <Mail className="w-6 h-6 text-primary" />,
    title: "Email",
    description: "Réponse sous 24h en jours ouvrés",
    action: "nafouguirima@gmail.com",
    href: "mailto:nafouguirima@gmail.com",
    buttonLabel: "Envoyer un email",
    color: "primary" as const,
  },
  {
    icon: <Github className="w-6 h-6 text-foreground" />,
    title: "GitHub Issues",
    description: "Pour signaler un bug ou proposer une fonctionnalité",
    action: "github.com/Mercuryy200/MealMatch",
    href: "https://github.com/Mercuryy200/MealMatch/issues",
    buttonLabel: "Ouvrir une issue",
    color: "default" as const,
  },
];

export default function SupportPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div className="max-w-7xl mx-auto px-6 pt-16 pb-12">
    <div className="flex flex-col gap-16 py-12">
      {/* Hero */}
      <section className="text-center flex flex-col items-center gap-4">
        <Chip color="success" variant="flat" size="sm" className="font-semibold">
          Support
        </Chip>
        <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
          Comment pouvons-nous{" "}
          <span className="text-success">t'aider ?</span>
        </h1>
        <p className="text-default-500 text-lg max-w-2xl">
          Une question, un problème ou une suggestion ? Notre équipe est là pour toi.
        </p>
      </section>

      {/* Quick help cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: <Zap className="w-5 h-5 text-warning" />,
            label: "Démarrage rapide",
            desc: "Guide pour bien commencer",
            href: "/features",
          },
          {
            icon: <BookOpen className="w-5 h-5 text-primary" />,
            label: "Documentation",
            desc: "Guides détaillés et tutoriels",
            href: "/docs",
          },
          {
            icon: <Shield className="w-5 h-5 text-success" />,
            label: "Confidentialité",
            desc: "Politique de données",
            href: "/privacy",
          },
        ].map((item, i) => (
          <Card
            key={i}
            as={Link}
            href={item.href}
            isHoverable
            isPressable
            className="p-4 border border-divider/50 bg-white/50 dark:bg-black/20"
          >
            <CardBody className="flex flex-row items-center gap-3 p-2">
              {item.icon}
              <div>
                <p className="font-semibold text-sm">{item.label}</p>
                <p className="text-default-400 text-xs">{item.desc}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </section>

      {/* FAQ */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-success" />
          <h2 className="text-2xl font-bold">Questions fréquentes</h2>
        </div>
        <Accordion variant="splitted" selectionMode="multiple">
          {faqItems.map((item, index) => (
            <AccordionItem
              key={index}
              title={item.q}
              classNames={{
                title: "font-medium text-sm",
                content: "text-default-500 text-sm pb-3",
              }}
            >
              {item.a}
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Contact */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact options */}
        <div className="flex flex-col gap-6">
          <h2 className="text-2xl font-bold">Nous contacter</h2>
          <div className="flex flex-col gap-4">
            {contactOptions.map((opt, i) => (
              <Card key={i} className="p-4 border border-divider/50 bg-white/50 dark:bg-black/20">
                <CardBody className="flex flex-row items-center gap-4 p-2">
                  <div className="p-3 rounded-xl bg-default-100">{opt.icon}</div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{opt.title}</p>
                    <p className="text-default-400 text-xs">{opt.description}</p>
                    <p className="text-xs text-default-500 mt-0.5">{opt.action}</p>
                  </div>
                  <Button
                    as={Link}
                    href={opt.href}
                    isExternal={opt.href.startsWith("http")}
                    size="sm"
                    color={opt.color}
                    variant="flat"
                    className="font-semibold"
                  >
                    {opt.buttonLabel}
                  </Button>
                </CardBody>
              </Card>
            ))}

            <Card className="p-4 border border-divider/50 bg-white/50 dark:bg-black/20">
              <CardBody className="flex flex-row items-center gap-4 p-2">
                <div className="p-3 rounded-xl bg-default-100">
                  <Clock className="w-6 h-6 text-default-500" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Horaires du support</p>
                  <p className="text-default-400 text-xs">Lun – Ven : 9h – 18h (CET)</p>
                  <p className="text-default-400 text-xs">Sam – Dim : réponse différée</p>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Contact form */}
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold">Envoyer un message</h2>
          {sent ? (
            <Card className="p-6 border border-success/30 bg-success/5">
              <CardBody className="items-center text-center gap-3 p-2">
                <MessageCircle className="w-10 h-10 text-success" />
                <p className="font-bold text-lg">Message envoyé !</p>
                <p className="text-default-500 text-sm">
                  Merci de nous avoir contactés. Nous te répondrons dans les plus brefs délais.
                </p>
                <Button variant="flat" color="success" onPress={() => setSent(false)}>
                  Envoyer un autre message
                </Button>
              </CardBody>
            </Card>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nom"
                  placeholder="Ton nom"
                  value={form.name}
                  onValueChange={(v) => setForm({ ...form, name: v })}
                  isRequired
                  variant="flat"
                />
                <Input
                  label="Email"
                  placeholder="ton@email.com"
                  type="email"
                  value={form.email}
                  onValueChange={(v) => setForm({ ...form, email: v })}
                  isRequired
                  variant="flat"
                />
              </div>
              <Input
                label="Sujet"
                placeholder="Décris brièvement ta demande"
                value={form.subject}
                onValueChange={(v) => setForm({ ...form, subject: v })}
                isRequired
                variant="flat"
              />
              <Textarea
                label="Message"
                placeholder="Explique-nous en détail..."
                value={form.message}
                onValueChange={(v) => setForm({ ...form, message: v })}
                isRequired
                variant="flat"
                minRows={5}
              />
              <Button type="submit" color="success" className="font-semibold" fullWidth>
                Envoyer le message
              </Button>
            </form>
          )}
        </div>
      </section>
    </div>
    </div>
  );
}
