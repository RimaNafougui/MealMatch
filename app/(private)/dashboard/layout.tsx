"use client";

import { useState } from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { Chip } from "@heroui/chip";
import { PanelLeftOpen } from "lucide-react";

import DashboardSidebar, {
  navLinks,
  premiumLinks,
} from "@/components/dashboard/DashboardSidebar";
import { useUserPlan } from "@/hooks/useUserPlan";
import { DashboardShortcutsHint } from "@/components/layout/DashboardShortcutsHint";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const pathname = usePathname();
  const { data: planData } = useUserPlan();
  const isPremium = planData?.plan === "premium";

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-full">
      {/* Desktop sidebar */}
      <DashboardSidebar
        desktopCollapsed={desktopCollapsed}
        onToggleDesktop={() => setDesktopCollapsed((c) => !c)}
      />

      {/* Desktop sidebar collapsed — show expand button */}
      {desktopCollapsed && (
        <button
          onClick={() => setDesktopCollapsed(false)}
          className="hidden lg:flex self-start mt-3 ml-2 p-1.5 rounded-lg hover:bg-default-100 transition-colors text-default-400"
          aria-label="Afficher le menu"
        >
          <PanelLeftOpen size={16} />
        </button>
      )}

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile horizontal scrollable nav */}
        <div className="lg:hidden sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-divider">
          <div
            className="flex gap-1 px-3 py-2 overflow-x-auto"
            style={{ scrollbarWidth: "none" }}
          >
            {[...navLinks, ...premiumLinks].map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              const isLocked =
                premiumLinks.some((pl) => pl.href === link.href) && !isPremium;

              return (
                <NextLink
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-default-600 hover:bg-default-100"
                  }`}
                >
                  <Icon size={15} />
                  {link.label}
                  {isLocked && (
                    <Chip
                      size="sm"
                      color="warning"
                      variant="flat"
                      className="text-[9px] h-4 px-1 ml-0.5"
                    >
                      Pro
                    </Chip>
                  )}
                </NextLink>
              );
            })}
          </div>
        </div>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 animate-fadeIn min-w-0">
          {children}
        </main>
      </div>
      <DashboardShortcutsHint />
    </div>
  );
}
