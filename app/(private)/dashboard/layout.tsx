"use client";

import { useState } from "react";
import { Menu, PanelLeftOpen } from "lucide-react";

import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

  return (
    <div className="flex h-full">
      <DashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        desktopCollapsed={desktopCollapsed}
        onToggleDesktop={() => setDesktopCollapsed((c) => !c)}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top bar */}
        <div className="flex items-center px-4 py-2 border-b border-divider">
          {/* Mobile: open drawer */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-default-100 transition-colors lg:hidden"
            aria-label="Ouvrir le menu"
          >
            <Menu size={20} />
          </button>
          {/* Desktop: collapse / expand */}
          <button
            onClick={() => setDesktopCollapsed((c) => !c)}
            className="hidden lg:flex p-2 rounded-lg hover:bg-default-100 transition-colors text-default-500"
            aria-label={desktopCollapsed ? "Afficher le menu" : "Masquer le menu"}
          >
            <PanelLeftOpen size={20} />
          </button>
        </div>

        <main className="flex-1 overflow-y-auto p-6 animate-fadeIn">
          {children}
        </main>
      </div>
    </div>
  );
}
