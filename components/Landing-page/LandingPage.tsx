"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Link } from "@heroui/link";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import {
  Bot,
  WalletCards,
  ShoppingCart,
  Heart,
  ChevronRight,
  Star,
  Sparkles,
  Clock,
  CheckCircle2,
  Target,
  Rocket,
  Salad,
  Fish,
  Carrot,
  Leaf,
  Wheat,
  Grape,
  Apple,
  Zap,
  Timer,
  UtensilsCrossed,
} from "lucide-react";

// ─── Animation primitives ─────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0 },
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
};

const stagger = (delay = 0.1) => ({
  show: { transition: { staggerChildren: delay } },
});

/** Wraps children and triggers animation when scrolled into view */
function ScrollReveal({
  children,
  className,
  delay = 0,
  variants = fadeUp,
  once = true,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  variants?: typeof fadeUp;
  once?: boolean;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Stagger container — triggers stagger when in view */
function StaggerReveal({
  children,
  className,
  staggerDelay = 0.1,
}: {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      variants={stagger(staggerDelay)}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function StaggerItem({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      variants={fadeUp}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Main LandingPage component ───────────────────────────────────────────────

export function LandingPage() {
  return (
    <div className="flex flex-col relative overflow-hidden">

      {/* ── 1. HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[94vh] flex items-center overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/food-background.jpg')" }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-r from-black/80 via-black/60 to-black/30" />

        <div className="relative z-[2] max-w-7xl mx-auto px-6 w-full py-24">
          <motion.div
            className="max-w-2xl flex flex-col gap-7"
            variants={stagger(0.13)}
            initial="hidden"
            animate="show"
          >
            {/* Badge */}
            <motion.div variants={fadeUp} className="flex">
              <Chip
                startContent={<Sparkles size={12} className="ml-1" />}
                color="success"
                variant="flat"
                size="sm"
                className="font-semibold tracking-wide text-xs bg-white/20 text-white border border-success/30"
              >
                Propulsé par l&apos;intelligence artificielle
              </Chip>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tighter uppercase italic leading-none text-white drop-shadow-lg"
            >
              Bien manger.
              <br />
              <span className="text-success">Sans réfléchir.</span>
            </motion.h1>

            {/* Sub-headline */}
            <motion.p
              variants={fadeUp}
              className="text-lg sm:text-xl text-white/75 max-w-xl leading-relaxed"
            >
              MealMatch génère des plans de repas intelligents, économiques et
              adaptés à ton rythme — en quelques secondes.
            </motion.p>

            {/* CTA buttons */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-3 items-center">
              <Button
                as={Link}
                href="/signup"
                size="lg"
                color="success"
                endContent={<ChevronRight size={18} />}
                className="font-bold text-white shadow-xl shadow-success/40 px-8"
              >
                Commencer gratuitement
              </Button>
              <Button
                as={Link}
                href="#features"
                variant="bordered"
                size="lg"
                className="font-semibold text-white border-white/40 hover:bg-white/10"
              >
                En savoir plus
              </Button>
            </motion.div>

            {/* Trust micro-copy */}
            <motion.div
              variants={fadeUp}
              className="flex flex-wrap gap-5 text-sm text-white/60"
            >
              {[
                "Gratuit pour commencer",
                "Sans carte de crédit",
                "Résultats en 30 secondes",
              ].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-success" />
                  {t}
                </span>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── 2. SOCIAL PROOF ─────────────────────────────────────────────────── */}
      <section className="border-y border-divider/40 bg-white/50 dark:bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <ScrollReveal>
            <p className="text-center text-xs font-semibold text-default-400 uppercase tracking-widest mb-8">
              Ce que disent nos utilisateurs
            </p>
          </ScrollReveal>

          <StaggerReveal className="grid grid-cols-1 sm:grid-cols-3 gap-6" staggerDelay={0.12}>
            {[
              {
                quote: "J'économise 80$ par mois depuis que j'utilise MealMatch. Incroyable!",
                name: "Léa T.",
                role: "Étudiante en médecine",
                stars: 5,
              },
              {
                quote: "La liste d'épicerie automatique m'a changé la vie. Plus de gaspillage.",
                name: "Marc D.",
                role: "Développeur logiciel",
                stars: 5,
              },
              {
                quote: "En 30 secondes j'ai un plan de repas complet pour la semaine. Magique.",
                name: "Sophie R.",
                role: "Infirmière",
                stars: 5,
              },
            ].map((t, i) => (
              <StaggerItem key={i}>
                <Card className="backdrop-blur-xl bg-white/70 dark:bg-black/40 border border-divider/50 p-5 h-full">
                  <CardBody className="gap-3">
                    <div className="flex gap-0.5">
                      {Array.from({ length: t.stars }).map((_, s) => (
                        <Star key={s} size={14} className="text-warning fill-warning" />
                      ))}
                    </div>
                    <p className="text-sm text-default-600 leading-relaxed italic">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="pt-1 border-t border-divider/40">
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-default-400">{t.role}</p>
                    </div>
                  </CardBody>
                </Card>
              </StaggerItem>
            ))}
          </StaggerReveal>
        </div>
      </section>

      {/* ── 3. ABOUT ────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 w-full py-24 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          {/* Visual — orbit */}
          <ScrollReveal variants={fadeIn} className="flex justify-center">
            <motion.div
              className="relative w-72 h-72 sm:w-80 sm:h-80"
              initial={{ scale: 0.85, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              {/* Rings */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-success/20"
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              />
              <div className="absolute inset-6 rounded-full border-2 border-dashed border-success/30" />

              {/* Center */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  className="w-48 h-48 rounded-full bg-success/10 dark:bg-success/15 border border-success/20 flex flex-col items-center justify-center gap-2 shadow-xl shadow-success/10"
                  animate={{ scale: [1, 1.04, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Salad size={48} className="text-success" />
                  <span className="text-sm font-bold text-success tracking-wide">MealMatch</span>
                </motion.div>
              </div>

              {/* Orbiting icons */}
              {[
                { icon: <Leaf size={18} className="text-success" />, top: "2%", left: "50%", delay: 0 },
                { icon: <Fish size={18} className="text-primary" />, top: "50%", left: "96%", delay: 0.4 },
                { icon: <Apple size={18} className="text-danger" />, top: "90%", left: "60%", delay: 0.8 },
                { icon: <Carrot size={18} className="text-warning" />, top: "75%", left: "4%", delay: 1.2 },
                { icon: <Grape size={18} className="text-secondary" />, top: "20%", left: "4%", delay: 1.6 },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className="absolute w-10 h-10 rounded-full bg-white dark:bg-black/60 border border-divider/50 shadow-md flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
                  style={{ top: item.top, left: item.left }}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: item.delay + 0.3, duration: 0.4, type: "spring" }}
                  animate={{ y: [0, -6, 0] }}
                >
                  {item.icon}
                </motion.div>
              ))}
            </motion.div>
          </ScrollReveal>

          {/* Text */}
          <StaggerReveal className="flex flex-col gap-6" staggerDelay={0.1}>
            <StaggerItem>
              <Chip color="success" variant="flat" size="sm" className="font-semibold text-xs tracking-wide w-fit">
                À propos de MealMatch
              </Chip>
            </StaggerItem>
            <StaggerItem>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Mangez mieux, <span className="text-success">sans effort</span>
              </h2>
            </StaggerItem>
            <StaggerItem>
              <div className="space-y-4 text-default-500 leading-relaxed">
                <p>
                  MealMatch est une application intelligente qui crée des plans de
                  repas personnalisés selon vos préférences alimentaires, vos
                  intolérances et votre budget.
                </p>
                <p>
                  Notre IA analyse des milliers de recettes pour vous proposer les
                  combinaisons les plus nutritives, savoureuses et économiques —
                  adaptées à votre style de vie.
                </p>
              </div>
            </StaggerItem>
            <StaggerReveal className="grid grid-cols-2 gap-4 pt-2" staggerDelay={0.08}>
              {[
                { value: "10 000+", label: "Recettes disponibles" },
                { value: "30 sec", label: "Pour générer un plan" },
                { value: "80$", label: "Économisés / mois en moyenne" },
                { value: "100%", label: "Personnalisé pour vous" },
              ].map((stat, i) => (
                <StaggerItem key={i}>
                  <div className="rounded-2xl bg-white/60 dark:bg-white/5 border border-divider/40 p-4 text-center">
                    <p className="text-2xl font-extrabold text-success">{stat.value}</p>
                    <p className="text-xs text-default-500 mt-1">{stat.label}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerReveal>
          </StaggerReveal>
        </div>
      </section>

      {/* ── 4. FEATURES ─────────────────────────────────────────────────────── */}
      <section
        id="features"
        className="bg-white/40 dark:bg-black/20 backdrop-blur-sm border-y border-divider/40 py-24 relative z-10"
      >
        <div className="max-w-7xl mx-auto px-6 w-full flex flex-col gap-12">
          <ScrollReveal className="text-center space-y-3">
            <Chip color="success" variant="flat" size="sm" className="font-semibold text-xs tracking-wide">
              Fonctionnalités
            </Chip>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-default-500 max-w-xl mx-auto">
              Des outils puissants conçus pour simplifier votre alimentation au quotidien.
            </p>
          </ScrollReveal>

          <StaggerReveal
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            staggerDelay={0.1}
          >
            {[
              {
                icon: <Bot size={28} className="text-success" />,
                title: "Plans de repas IA",
                description: "Des plans hebdomadaires générés en quelques secondes, adaptés à vos goûts et restrictions.",
                bg: "bg-success/10",
              },
              {
                icon: <WalletCards size={28} className="text-primary" />,
                title: "Économique",
                description: "Mangez mieux sans vous ruiner. MealMatch optimise vos repas selon votre budget.",
                bg: "bg-primary/10",
              },
              {
                icon: <ShoppingCart size={28} className="text-warning" />,
                title: "Listes d'épicerie",
                description: "Vos listes d'achats générées automatiquement, organisées par rayon.",
                bg: "bg-warning/10",
              },
              {
                icon: <Heart size={28} className="text-danger" />,
                title: "Suivi nutritionnel",
                description: "Suivez vos apports en calories, protéines, glucides et lipides facilement.",
                bg: "bg-danger/10",
              },
            ].map((f, i) => (
              <StaggerItem key={i}>
                <motion.div
                  whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.08)" }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  <Card isHoverable className="backdrop-blur-xl bg-white/70 dark:bg-black/40 border border-divider/50 p-6 h-full">
                    <CardBody className="gap-4 p-0">
                      <div className={`w-12 h-12 rounded-2xl ${f.bg} flex items-center justify-center`}>
                        {f.icon}
                      </div>
                      <div className="space-y-1.5">
                        <h3 className="font-bold text-base">{f.title}</h3>
                        <p className="text-sm text-default-500 leading-relaxed">{f.description}</p>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerReveal>
        </div>
      </section>

      {/* ── 5. HOW IT WORKS + CTA ───────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 w-full py-24 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Steps */}
          <StaggerReveal className="flex flex-col gap-8" staggerDelay={0.15}>
            <StaggerItem>
              <div className="space-y-3">
                <Chip color="success" variant="flat" size="sm" className="font-semibold text-xs tracking-wide">
                  Comment ça marche ?
                </Chip>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  Prêt en <span className="text-success">3 étapes</span>
                </h2>
              </div>
            </StaggerItem>

            <div className="flex flex-col gap-6">
              {[
                {
                  step: "01",
                  title: "Définissez vos préférences",
                  desc: "Régime alimentaire, intolérances, budget hebdomadaire — tout est pris en compte.",
                  icon: <Target size={22} className="text-success" />,
                  bg: "bg-success/10 border-success/20",
                },
                {
                  step: "02",
                  title: "Recevez votre plan de repas",
                  desc: "Notre IA génère un plan complet pour la semaine avec les recettes détaillées.",
                  icon: <Bot size={22} className="text-primary" />,
                  bg: "bg-primary/10 border-primary/20",
                },
                {
                  step: "03",
                  title: "Achetez et cuisinez",
                  desc: "Votre liste d'épicerie organisée est prête. Plus qu'à cuisiner et savourer !",
                  icon: <ShoppingCart size={22} className="text-warning" />,
                  bg: "bg-warning/10 border-warning/20",
                },
              ].map((item, i) => (
                <StaggerItem key={i}>
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${item.bg}`}>
                      {item.icon}
                    </div>
                    <div className="pt-1">
                      <span className="text-xs font-bold text-success tracking-wider">ÉTAPE {item.step}</span>
                      <h3 className="font-bold text-base mt-0.5">{item.title}</h3>
                      <p className="text-sm text-default-500 mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </div>
          </StaggerReveal>

          {/* CTA card */}
          <ScrollReveal delay={0.2}>
            <motion.div
              className="backdrop-blur-xl bg-white/70 dark:bg-black/40 border border-divider/50 rounded-3xl p-8 sm:p-10 flex flex-col gap-6"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-2xl bg-success/10 border border-success/20 flex items-center justify-center mx-auto mb-4">
                  <Rocket size={32} className="text-success" />
                </div>
                <h3 className="text-2xl font-extrabold tracking-tight">
                  Créez votre premier plan
                  <br />
                  <span className="text-success">gratuitement</span>
                </h3>
                <p className="text-default-500 text-sm leading-relaxed">
                  Rejoignez des milliers d&apos;utilisateurs qui mangent mieux,
                  dépensent moins et gagnent du temps chaque semaine.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  "Plan de repas personnalisé en 30 secondes",
                  "Liste d'épicerie automatique",
                  "Recettes avec infos nutritionnelles",
                  "Adapté à votre budget",
                ].map((point, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-2.5 text-sm"
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 + 0.2, duration: 0.4 }}
                  >
                    <CheckCircle2 size={16} className="text-success shrink-0" />
                    <span className="text-default-600">{point}</span>
                  </motion.div>
                ))}
              </div>

              <Button
                as={Link}
                href="/signup"
                size="lg"
                color="success"
                endContent={<ChevronRight size={18} />}
                className="font-bold text-white shadow-xl shadow-success/30 w-full"
              >
                Commencer gratuitement
              </Button>

              <p className="text-center text-xs text-default-400">
                Aucune carte de crédit requise &bull; Gratuit pour toujours
              </p>
            </motion.div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── 6. BLOG PREVIEW ─────────────────────────────────────────────────── */}
      <section className="bg-white/40 dark:bg-black/20 backdrop-blur-sm border-t border-divider/40 py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6 w-full flex flex-col gap-10">
          <ScrollReveal className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <Chip color="success" variant="flat" size="sm" className="font-semibold text-xs tracking-wide">
                Conseils &amp; Astuces
              </Chip>
              <h2 className="text-3xl font-extrabold tracking-tight">Nos derniers articles</h2>
            </div>
            <Button
              as={Link}
              href="/blog"
              variant="bordered"
              size="sm"
              endContent={<ChevronRight size={14} />}
              className="font-semibold shrink-0"
            >
              Voir tous les articles
            </Button>
          </ScrollReveal>

          <StaggerReveal className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.12}>
            {[
              {
                icon: <Wheat size={32} className="text-success" />,
                iconBg: "bg-success/10",
                tag: "Nutrition",
                title: "5 façons de manger équilibré avec un petit budget",
                desc: "Découvrez comment optimiser votre alimentation sans vider votre portefeuille.",
                time: "5 min",
              },
              {
                icon: <Zap size={32} className="text-primary" />,
                iconBg: "bg-primary/10",
                tag: "IA & Tech",
                title: "Comment l'IA révolutionne la planification des repas",
                desc: "L'intelligence artificielle transforme notre façon de cuisiner et de faire l'épicerie.",
                time: "7 min",
              },
              {
                icon: <Timer size={32} className="text-warning" />,
                iconBg: "bg-warning/10",
                tag: "Productivité",
                title: "Meal prep : gagnez 5h par semaine en cuisine",
                desc: "Préparez vos repas en avance et libérez du temps pour l'essentiel.",
                time: "4 min",
              },
            ].map((post, i) => (
              <StaggerItem key={i}>
                <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="h-full">
                  <Card
                    isHoverable
                    isPressable
                    as={Link}
                    href="/blog"
                    className="backdrop-blur-xl bg-white/70 dark:bg-black/40 border border-divider/50 overflow-hidden h-full"
                  >
                    <CardBody className="p-0">
                      <div className={`h-32 ${post.iconBg} flex items-center justify-center`}>
                        {post.icon}
                      </div>
                      <div className="p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <Chip size="sm" variant="flat" color="success" className="text-xs font-semibold">
                            {post.tag}
                          </Chip>
                          <span className="flex items-center gap-1 text-xs text-default-400">
                            <Clock size={11} />
                            {post.time}
                          </span>
                        </div>
                        <h3 className="font-bold text-sm leading-snug">{post.title}</h3>
                        <p className="text-xs text-default-500 leading-relaxed">{post.desc}</p>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerReveal>
        </div>
      </section>

      {/* ── 7. FINAL CTA ────────────────────────────────────────────────────── */}
      <section className="relative z-10 pb-24 pt-12 px-6">
        <ScrollReveal>
          <div className="max-w-4xl mx-auto">
            <div className="relative overflow-hidden rounded-3xl bg-success px-8 py-16 sm:px-16 text-center flex flex-col items-center gap-6">
              {/* Background decoration */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white translate-x-1/3 -translate-y-1/3" />
                <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white -translate-x-1/3 translate-y-1/3" />
              </div>

              <div className="relative flex flex-col items-center gap-4">
                <motion.div
                  className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center"
                  animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.05, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <UtensilsCrossed size={32} className="text-white" />
                </motion.div>
                <div className="space-y-3">
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                    Prêt à mieux manger ?
                  </h2>
                  <p className="text-white/80 text-lg max-w-xl mx-auto">
                    Rejoignez MealMatch aujourd&apos;hui et laissez l&apos;IA gérer vos repas — gratuitement.
                  </p>
                </div>
              </div>

              <Button
                as={Link}
                href="/signup"
                size="lg"
                className="bg-white text-success font-bold shadow-xl px-10"
                endContent={<ChevronRight size={18} />}
              >
                Créer mon compte
              </Button>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
