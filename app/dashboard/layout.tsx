"use client";

import { useState } from "react";
import Navbar from "./components/NavBar";
import Sidebar from "./components/SideBar";
import Footer from "./components/Footer";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={`flex min-h-screen ${darkMode ? "dark" : ""} bg-background text-foreground`}>
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
        <main className="flex-1 p-4">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
