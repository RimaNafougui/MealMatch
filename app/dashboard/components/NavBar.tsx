"use client";

import Image from "next/image";

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

export default function Navbar({ darkMode, setDarkMode }: NavbarProps) {
  return (
    <nav className="flex items-center justify-between p-4 bg-background shadow sticky top-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <Image src="/images/logo.png" alt="MealMatch Logo" width={40} height={40} />
        <span className="font-bold text-xl">MealMatch</span>
      </div>

      {/* Search bar */}
      <div className="hidden md:flex relative">
        <input
          type="text"
          placeholder="Search..."
          className="rounded-medium border-medium border-secondary px-3 py-1 bg-background text-foreground focus:border-focus focus:ring-1 focus:ring-focus"
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground">🔍</span>
      </div>

      {/* User menu + Dark Mode toggle */}
      <div className="flex items-center gap-4">
        <button className="rounded-small bg-primary text-primary-foreground px-3 py-1 hover:bg-primary/80">
          JG
        </button>

        <button
          onClick={() => setDarkMode(!darkMode)}
          className="rounded-small border-medium border-secondary px-3 py-1 hover:bg-secondary/80"
        >
          {darkMode ? "🌙" : "☀️"}
        </button>

        {/* Hamburger menu pour mobile */}
        <button className="md:hidden rounded-small border-medium border-secondary px-3 py-1 hover:bg-secondary/80">
          ☰
        </button>
      </div>
    </nav>
  );
}
