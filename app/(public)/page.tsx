import { redirect } from "next/navigation";
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
} from "lucide-react";
import { GradientBlobs } from "@/components/Landing-page/GradientBlobs";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col relative overflow-hidden">
      {/* ── 1. HERO SECTION ──────────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        <div className="mealmatch-animated-bg" />
        <GradientBlobs />

        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 -z-10 opacity-[0.03] dark:opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full py-24">
          <div className="max-w-2xl flex flex-col gap-7">
            {/* Badge */}
            <div className="flex">
              <Chip
                startContent={<Sparkles size={12} className="ml-1" />}
                color="success"
                variant="flat"
                size="sm"
                className="font-semibold tracking-wide text-xs"
              >
                Propulsé par l&apos;intelligence artificielle
              </Chip>
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tighter uppercase italic leading-none">
              Bien manger.
              <br />
              <span className="text-success">Sans réfléchir.</span>
            </h1>

            {/* Sub-headline */}
            <p className="text-lg sm:text-xl text-default-500 max-w-xl leading-relaxed">
              MealMatch génère des plans de repas intelligents, économiques et
              adaptés à ton rythme — en quelques secondes.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-3 items-center">
              <Button
                as={Link}
                href="/signup"
                size="lg"
                color="success"
                endContent={<ChevronRight size={18} />}
                className="font-bold text-white shadow-xl shadow-success/30 px-8"
              >
                Commencer gratuitement
              </Button>
              <Button
                as={Link}
                href="#features"
                variant="bordered"
                size="lg"
                className="font-semibold"
              >
                En savoir plus
              </Button>
            </div>

            {/* Trust micro-copy */}
            <div className="flex flex-wrap gap-5 text-sm text-default-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-success" />
                Gratuit pour commencer
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-success" />
                Sans carte de crédit
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={15} className="text-success" />
                Résultats en 30 secondes
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. SOCIAL PROOF ──────────────────────────────────────────────────── */}
      <section className="border-y border-divider/40 bg-white/50 dark:bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <p className="text-center text-xs font-semibold text-default-400 uppercase tracking-widest mb-8">
            Ce que disent nos utilisateurs
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                quote:
                  "J'économise 80$ par mois depuis que j'utilise MealMatch. Incroyable!",
                name: "Léa T.",
                role: "Étudiante en médecine",
                stars: 5,
              },
              {
                quote:
                  "La liste d'épicerie automatique m'a changé la vie. Plus de gaspillage.",
                name: "Marc D.",
                role: "Développeur logiciel",
                stars: 5,
              },
              {
                quote:
                  "En 30 secondes j'ai un plan de repas complet pour la semaine. Magique.",
                name: "Sophie R.",
                role: "Infirmière",
                stars: 5,
              },
            ].map((t, i) => (
              <Card
                key={i}
                className="backdrop-blur-xl bg-white/70 dark:bg-black/40 border border-divider/50 p-5"
              >
                <CardBody className="gap-3">
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.stars }).map((_, s) => (
                      <Star
                        key={s}
                        size={14}
                        className="text-warning fill-warning"
                      />
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
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. ABOUT SECTION ─────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 w-full py-24 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          {/* Visual side */}
          <div className="flex justify-center">
            <div className="relative w-72 h-72 sm:w-80 sm:h-80">
              {/* Decorative rings */}
              <div className="absolute inset-0 rounded-full border-2 border-success/20 animate-spin-slow" />
              <div className="absolute inset-6 rounded-full border-2 border-dashed border-success/30" />

              {/* Center badge */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 rounded-full bg-success/10 dark:bg-success/15 border border-success/20 flex flex-col items-center justify-center gap-2 shadow-xl shadow-success/10">
                  <span className="text-5xl">🥗</span>
                  <span className="text-sm font-bold text-success tracking-wide">
                    MealMatch
                  </span>
                </div>
              </div>

              {/* Orbiting icons */}
              {[
                { emoji: "🥦", top: "2%", left: "50%", delay: "0s" },
                { emoji: "🐟", top: "50%", left: "96%", delay: "0.5s" },
                { emoji: "🍋", top: "90%", left: "60%", delay: "1s" },
                { emoji: "🥕", top: "75%", left: "4%", delay: "1.5s" },
                { emoji: "🫐", top: "20%", left: "4%", delay: "2s" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="absolute w-10 h-10 rounded-full bg-white dark:bg-black/60 border border-divider/50 shadow-md flex items-center justify-center text-xl -translate-x-1/2 -translate-y-1/2"
                  style={{
                    top: item.top,
                    left: item.left,
                    animationDelay: item.delay,
                  }}
                >
                  {item.emoji}
                </div>
              ))}
            </div>
          </div>

          {/* Text side */}
          <div className="flex flex-col gap-6">
            <Chip color="success" variant="flat" size="sm" className="font-semibold text-xs tracking-wide w-fit">
              À propos de MealMatch
            </Chip>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Mangez mieux,{" "}
              <span className="text-success">sans effort</span>
            </h2>
            <div className="space-y-4 text-default-500 leading-relaxed">
              <p>
                MealMatch est une application intelligente qui crée des plans de
                repas personnalisés selon vos préférences alimentaires, vos
                intolérances et votre budget.
              </p>
              <p>
                Notre IA analyse des milliers de recettes pour vous proposer
                les combinaisons les plus nutritives, savoureuses et
                économiques — adaptées à votre style de vie.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              {[
                { value: "10 000+", label: "Recettes disponibles" },
                { value: "30 sec", label: "Pour générer un plan" },
                { value: "80$", label: "Économisés / mois en moyenne" },
                { value: "100%", label: "Personnalisé pour vous" },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-white/60 dark:bg-white/5 border border-divider/40 p-4 text-center"
                >
                  <p className="text-2xl font-extrabold text-success">
                    {stat.value}
                  </p>
                  <p className="text-xs text-default-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. KEY FEATURES ──────────────────────────────────────────────────── */}
      <section
        id="features"
        className="bg-white/40 dark:bg-black/20 backdrop-blur-sm border-y border-divider/40 py-24 relative z-10"
      >
        <div className="max-w-7xl mx-auto px-6 w-full flex flex-col gap-12">
          <div className="text-center space-y-3">
            <Chip color="success" variant="flat" size="sm" className="font-semibold text-xs tracking-wide">
              Fonctionnalités
            </Chip>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-default-500 max-w-xl mx-auto">
              Des outils puissants conçus pour simplifier votre alimentation au
              quotidien.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Bot size={28} className="text-success" />,
                title: "Plans de repas IA",
                description:
                  "Des plans hebdomadaires générés en quelques secondes, adaptés à vos goûts et restrictions.",
                bg: "bg-success/10",
              },
              {
                icon: <WalletCards size={28} className="text-primary" />,
                title: "Économique",
                description:
                  "Mangez mieux sans vous ruiner. MealMatch optimise vos repas selon votre budget.",
                bg: "bg-primary/10",
              },
              {
                icon: <ShoppingCart size={28} className="text-warning" />,
                title: "Listes d'épicerie",
                description:
                  "Vos listes d'achats générées automatiquement, organisées par rayon.",
                bg: "bg-warning/10",
              },
              {
                icon: <Heart size={28} className="text-danger" />,
                title: "Suivi nutritionnel",
                description:
                  "Suivez vos apports en calories, protéines, glucides et lipides facilement.",
                bg: "bg-danger/10",
              },
            ].map((f, i) => (
              <Card
                key={i}
                isHoverable
                className="backdrop-blur-xl bg-white/70 dark:bg-black/40 border border-divider/50 p-6 flex flex-col gap-4"
              >
                <CardBody className="gap-4 p-0">
                  <div
                    className={`w-12 h-12 rounded-2xl ${f.bg} flex items-center justify-center`}
                  >
                    {f.icon}
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-bold text-base">{f.title}</h3>
                    <p className="text-sm text-default-500 leading-relaxed">
                      {f.description}
                    </p>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. HOW IT WORKS (Lead Magnet / CTA section) ──────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 w-full py-24 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Steps */}
          <div className="flex flex-col gap-8">
            <div className="space-y-3">
              <Chip color="success" variant="flat" size="sm" className="font-semibold text-xs tracking-wide">
                Comment ça marche ?
              </Chip>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Prêt en{" "}
                <span className="text-success">3 étapes</span>
              </h2>
            </div>

            <div className="flex flex-col gap-6">
              {[
                {
                  step: "01",
                  title: "Définissez vos préférences",
                  desc: "Régime alimentaire, intolérances, budget hebdomadaire — tout est pris en compte.",
                  icon: "🎯",
                },
                {
                  step: "02",
                  title: "Recevez votre plan de repas",
                  desc: "Notre IA génère un plan complet pour la semaine avec les recettes détaillées.",
                  icon: "🤖",
                },
                {
                  step: "03",
                  title: "Achetez et cuisinez",
                  desc: "Votre liste d'épicerie organisée est prête. Plus qu'à cuisiner et savourer !",
                  icon: "🛒",
                },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-success/10 border border-success/20 flex items-center justify-center text-xl shrink-0">
                    {item.icon}
                  </div>
                  <div className="pt-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-success tracking-wider">
                        ÉTAPE {item.step}
                      </span>
                    </div>
                    <h3 className="font-bold text-base">{item.title}</h3>
                    <p className="text-sm text-default-500 mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Card */}
          <div className="backdrop-blur-xl bg-white/70 dark:bg-black/40 border border-divider/50 rounded-3xl p-8 sm:p-10 flex flex-col gap-6">
            <div className="text-center space-y-2">
              <div className="text-4xl mb-4">🚀</div>
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
                <div key={i} className="flex items-center gap-2.5 text-sm">
                  <CheckCircle2 size={16} className="text-success shrink-0" />
                  <span className="text-default-600">{point}</span>
                </div>
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
          </div>
        </div>
      </section>

      {/* ── 6. CONTENT SECTION (Blog preview) ───────────────────────────────── */}
      <section className="bg-white/40 dark:bg-black/20 backdrop-blur-sm border-t border-divider/40 py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6 w-full flex flex-col gap-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <Chip color="success" variant="flat" size="sm" className="font-semibold text-xs tracking-wide">
                Conseils &amp; Astuces
              </Chip>
              <h2 className="text-3xl font-extrabold tracking-tight">
                Nos derniers articles
              </h2>
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                emoji: "🥗",
                tag: "Nutrition",
                title: "5 façons de manger équilibré avec un petit budget",
                desc: "Découvrez comment optimiser votre alimentation sans vider votre portefeuille.",
                time: "5 min",
              },
              {
                emoji: "🤖",
                tag: "IA & Tech",
                title: "Comment l'IA révolutionne la planification des repas",
                desc: "L'intelligence artificielle transforme notre façon de cuisiner et de faire l'épicerie.",
                time: "7 min",
              },
              {
                emoji: "⏱️",
                tag: "Productivité",
                title: "Meal prep : gagnez 5h par semaine en cuisine",
                desc: "Préparez vos repas en avance et libérez du temps pour l'essentiel.",
                time: "4 min",
              },
            ].map((post, i) => (
              <Card
                key={i}
                isHoverable
                isPressable
                as={Link}
                href="/blog"
                className="backdrop-blur-xl bg-white/70 dark:bg-black/40 border border-divider/50 overflow-hidden"
              >
                <CardBody className="p-0">
                  {/* Color band header */}
                  <div className="h-32 bg-gradient-to-br from-success/10 to-success/5 dark:from-success/20 dark:to-transparent flex items-center justify-center text-5xl">
                    {post.emoji}
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
                    <p className="text-xs text-default-500 leading-relaxed">
                      {post.desc}
                    </p>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. FINAL CTA ─────────────────────────────────────────────────────── */}
      <section className="relative z-10 pb-24 pt-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-success px-8 py-16 sm:px-16 text-center flex flex-col items-center gap-6">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white translate-x-1/3 -translate-y-1/3" />
              <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white -translate-x-1/3 translate-y-1/3" />
            </div>

            <div className="relative space-y-3">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Prêt à mieux manger ?
              </h2>
              <p className="text-white/80 text-lg max-w-xl mx-auto">
                Rejoignez MealMatch aujourd&apos;hui et laissez l&apos;IA gérer
                vos repas — gratuitement.
              </p>
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
      </section>
    </div>
  );
}
