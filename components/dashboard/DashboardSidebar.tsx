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
} from "lucide-react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/logo";
import { useUserPlan } from "@/hooks/useUserPlan";

const navLinks = [
  { label: "Accueil", href: "/dashboard", icon: Home },
  { label: "Recettes", href: "/dashboard/recettes", icon: Utensils },
  { label: "Meal Plans", href: "/dashboard/meal-plans", icon: Calendar },
  { label: "Epicerie", href: "/dashboard/epicerie", icon: ShoppingCart },
  { label: "Favoris", href: "/dashboard/favoris", icon: Heart },
];

const premiumLinks = [
  {
    label: "Nutritionniste",
    href: "/dashboard/nutritionist",
    icon: BrainCircuit,
  },
  { label: "Famille", href: "/dashboard/family", icon: Users },
];

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  desktopCollapsed?: boolean;
  onToggleDesktop?: () => void;
}

export default function DashboardSidebar({
  isOpen,
  onClose,
  desktopCollapsed = false,
  onToggleDesktop,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const { data: planData } = useUserPlan();
  const userPlan = planData?.plan ?? "free";
  const isPremium = userPlan === "premium";

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-background border-r border-divider
          transform transition-transform duration-200 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:static lg:translate-x-0 lg:z-auto
          ${desktopCollapsed ? "lg:w-0 lg:overflow-hidden lg:border-none" : "lg:w-64"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
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
                  onClick={onClose}
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
                  onClick={onClose}
                >
                  {link.label}
                </Button>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
