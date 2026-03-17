"use client";

import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Skeleton } from "@heroui/skeleton";
import { Link } from "@heroui/link";
import { useSession } from "next-auth/react";
import {
  Utensils,
  Heart,
  BarChart3,
  Sparkles,
  ShoppingCart,
  BookOpen,
  CalendarDays,
  ArrowRight,
  ChefHat,
} from "lucide-react";
import ProgressDashboard from "@/components/dashboard/ProgressDashboard";
import { useStats } from "@/hooks/useUserData";

function StatCard({
  label,
  value,
  icon,
  color,
  loading,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  loading: boolean;
}) {
  return (
    <Card className="border border-divider/50 bg-white/50 dark:bg-black/20">
      <CardBody className="flex flex-row items-center gap-4 p-4">
        <div className={`p-3 rounded-xl bg-default-100 ${color}`}>{icon}</div>
        <div>
          {loading ? (
            <>
              <Skeleton className="h-6 w-10 rounded-lg mb-1" />
              <Skeleton className="h-3 w-24 rounded-lg" />
            </>
          ) : (
            <>
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-default-400">{label}</p>
            </>
          )}
        </div>
      </CardBody>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const { data: stats, isLoading: loading } = useStats();

  const displayName =
    stats?.profile?.name || session?.user?.name || "Utilisateur";
  const firstName = displayName.split(" ")[0];
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";

  const quickLinks = [
    {
      label: "Générer un plan",
      description: "Créer un plan de repas IA",
      href: "/dashboard/meal-plan/generate",
      icon: <Sparkles size={20} className="text-primary" />,
      bg: "bg-primary/10",
      badge: "IA",
      badgeColor: "primary" as const,
    },
    {
      label: "Mes recettes",
      description: "Voir mes recettes sauvegardées",
      href: "/dashboard/recettes",
      icon: <Utensils size={20} className="text-warning" />,
      bg: "bg-warning/10",
    },
    {
      label: "Mes favoris",
      description: "Parcourir mes favoris",
      href: "/dashboard/favoris",
      icon: <Heart size={20} className="text-danger" />,
      bg: "bg-danger/10",
    },
    {
      label: "Plans de repas",
      description: "Gérer mes planifications",
      href: "/dashboard/meal-plans",
      icon: <CalendarDays size={20} className="text-success" />,
      bg: "bg-success/10",
    },
    {
      label: "Liste d'épicerie",
      description: "Gérer ma liste de courses",
      href: "/dashboard/epicerie",
      icon: <ShoppingCart size={20} className="text-secondary" />,
      bg: "bg-secondary/10",
    },
    {
      label: "Explorer",
      description: "Découvrir de nouvelles recettes",
      href: "/explore",
      icon: <BookOpen size={20} className="text-default-500" />,
      bg: "bg-default-100",
    },
  ];

  const planLabelMap: Record<string, string> = {
    free: "Gratuit",
    student: "Étudiant",
    premium: "Premium",
    pro: "Pro",
  };

  const planColorMap: Record<string, "default" | "success" | "warning" | "primary" | "secondary" | "danger"> = {
    free: "default",
    student: "success",
    premium: "warning",
    pro: "secondary",
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      {/* Welcome banner */}
      <div className="rounded-2xl bg-gradient-to-r from-success/20 via-success/10 to-transparent border border-success/20 p-6 flex items-center gap-4">
        <div className="p-3 rounded-xl bg-success/20 hidden sm:flex">
          <ChefHat size={28} className="text-success" />
        </div>
        <div className="flex-1">
          {loading ? (
            <>
              <Skeleton className="h-6 w-48 rounded-lg mb-2" />
              <Skeleton className="h-4 w-64 rounded-lg" />
            </>
          ) : (
            <>
              <h1 className="text-xl font-bold">
                {greeting}, {firstName} 👋
              </h1>
              <p className="text-default-500 text-sm mt-1">
                Bienvenue sur votre tableau de bord MealMatch.
              </p>
            </>
          )}
        </div>
        {stats?.profile?.plan && stats.profile.plan !== "free" && (
          <Chip
            color={planColorMap[stats.profile.plan] || "default"}
            variant="flat"
            size="sm"
          >
            {planLabelMap[stats.profile.plan] || stats.profile.plan}
          </Chip>
        )}
      </div>

      {/* Stats row */}
      <div>
        <h2 className="text-sm font-semibold text-default-400 uppercase tracking-wider mb-3">
          Vos statistiques
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StatCard
            label="Recettes sauvegardées"
            value={stats?.savedRecipes ?? 0}
            icon={<Utensils size={18} />}
            color="text-warning"
            loading={loading}
          />
          <StatCard
            label="Plans de repas"
            value={stats?.mealPlans ?? 0}
            icon={<BarChart3 size={18} />}
            color="text-primary"
            loading={loading}
          />
          <StatCard
            label="Favoris"
            value={stats?.favorites ?? 0}
            icon={<Heart size={18} />}
            color="text-danger"
            loading={loading}
          />
        </div>
      </div>

      {/* Progress Dashboard */}
      <div>
        <h2 className="text-sm font-semibold text-default-400 uppercase tracking-wider mb-3">
          Ma progression
        </h2>
        <ProgressDashboard />
      </div>

      {/* Quick links */}
      <div>
        <h2 className="text-sm font-semibold text-default-400 uppercase tracking-wider mb-3">
          Accès rapide
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {quickLinks.map((link) => (
            <Card
              key={link.href}
              as={Link}
              href={link.href}
              isHoverable
              isPressable
              className="border border-divider/50 bg-white/50 dark:bg-black/20"
            >
              <CardBody className="flex flex-row items-center gap-3 p-4">
                <div className={`p-2.5 rounded-xl ${link.bg} flex-shrink-0`}>
                  {link.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{link.label}</p>
                    {link.badge && (
                      <Chip color={link.badgeColor} size="sm" variant="flat" className="text-[10px] h-4">
                        {link.badge}
                      </Chip>
                    )}
                  </div>
                  <p className="text-default-400 text-xs truncate">
                    {link.description}
                  </p>
                </div>
                <ArrowRight size={14} className="text-default-300 flex-shrink-0" />
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA if no meal plan */}
      {!loading && (stats?.mealPlans ?? 0) === 0 && (
        <Card className="border border-primary/20 bg-primary/5 p-6">
          <CardBody className="flex flex-col sm:flex-row items-center gap-4 p-0">
            <div className="p-3 rounded-xl bg-primary/10">
              <Sparkles size={24} className="text-primary" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <p className="font-semibold">Pas encore de plan de repas</p>
              <p className="text-default-400 text-sm">
                Générez votre premier plan de repas personnalisé par IA en moins d&apos;une minute.
              </p>
            </div>
            <Button
              as={Link}
              href="/dashboard/meal-plan/generate"
              color="primary"
              variant="flat"
              startContent={<Sparkles size={16} />}
              className="font-semibold flex-shrink-0"
            >
              Générer maintenant
            </Button>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
