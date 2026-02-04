"use client";

import { useTheme } from "next-themes";
import Sidebar from "./components/SideBar";
import Footer from "./components/Footer";
import NavBar from "./components/NavBar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  return (
    <div className={`flex min-h-screen ${theme === "dark" ? "dark" : ""} bg-background text-foreground`}>
      <Sidebar />
      <div className="flex flex-col flex-1">
        <NavBar />
        <main className="flex-1 p-4">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
