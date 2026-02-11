"use client";

import { Button } from "@heroui/react";
import { Home, Utensils, Calendar, ShoppingCart, Heart, X } from "lucide-react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/logo";

const navLinks = [
  { label: "Accueil", href: "/dashboard", icon: Home },
  { label: "Recettes", href: "/dashboard/recettes", icon: Utensils },
  { label: "Meal Plans", href: "/dashboard/meal-plans", icon: Calendar },
  { label: "Epicerie", href: "/dashboard/epicerie", icon: ShoppingCart },
  { label: "Favoris", href: "/dashboard/favoris", icon: Heart },
];

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DashboardSidebar({
  isOpen,
  onClose,
}: DashboardSidebarProps) {
  const pathname = usePathname();

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
          </nav>
        </div>
      </aside>
    </>
  );
}
