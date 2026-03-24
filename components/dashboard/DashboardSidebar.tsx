"use client";

import { Button } from "@heroui/react";
import { Chip } from "@heroui/chip";
import {
  Home,
  Utensils,
  Calendar,
  ShoppingCart,
  Heart,
  BrainCircuit,
  Users,
  PanelLeftOpen,
  Refrigerator,
  Sparkles,
} from "lucide-react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useUserPlan } from "@/hooks/useUserPlan";

export const navLinks = [
  { label: "Accueil", href: "/dashboard", icon: Home },
  { label: "Générer", href: "/dashboard/generate", icon: Sparkles },
  { label: "Recettes", href: "/dashboard/recettes", icon: Utensils },
  { label: "Meal Plans", href: "/dashboard/meal-plans", icon: Calendar },
  { label: "Epicerie", href: "/dashboard/epicerie", icon: ShoppingCart },
  { label: "Favoris", href: "/dashboard/favoris", icon: Heart },
  { label: "Frigo IA", href: "/dashboard/fridge", icon: Refrigerator },
];

export const premiumLinks = [
  {
    label: "Nutritionniste",
    href: "/dashboard/nutritionist",
    icon: BrainCircuit,
  },
  { label: "Famille", href: "/dashboard/family", icon: Users },
];

interface DashboardSidebarProps {
  desktopCollapsed?: boolean;
  onToggleDesktop?: () => void;
}

export default function DashboardSidebar({
  desktopCollapsed = false,
  onToggleDesktop,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const { data: planData } = useUserPlan();
  const isPremium = planData?.plan === "premium";

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`
        hidden lg:flex flex-col h-full border-r border-divider bg-background
        transition-all duration-200 ease-in-out flex-shrink-0
        ${desktopCollapsed ? "w-0 overflow-hidden border-none" : "w-64"}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-divider">
        Menu
        <button
          onClick={onToggleDesktop}
          className="p-1.5 rounded-lg hover:bg-default-100 transition-colors text-default-400"
          aria-label="Masquer le menu"
        >
          <PanelLeftOpen size={16} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navLinks.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.href);
          return (
            <Button
              key={link.href}
              as={NextLink}
              href={link.href}
              variant={active ? "flat" : "light"}
              color={active ? "primary" : "default"}
              className="w-full justify-start gap-3"
              startContent={<Icon size={18} />}
            >
              {link.label}
            </Button>
          );
        })}

        <div className="pt-3 pb-1">
          <p className="px-2 text-[10px] font-semibold text-default-400 uppercase tracking-wider">
            Premium
          </p>
        </div>

        {premiumLinks.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.href);
          return (
            <Button
              key={link.href}
              as={NextLink}
              href={link.href}
              variant={active ? "flat" : "light"}
              color={active ? "primary" : "default"}
              className="w-full justify-start gap-3"
              startContent={<Icon size={18} />}
              endContent={
                !isPremium ? (
                  <Chip
                    size="sm"
                    color="warning"
                    variant="flat"
                    className="text-[10px] h-4 ml-auto"
                  >
                    Premium
                  </Chip>
                ) : null
              }
            >
              {link.label}
            </Button>
          );
        })}
      </nav>
    </aside>
  );
}
