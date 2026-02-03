"use client";

import Link from "next/link";

export default function Sidebar() {
  const links = [
    { href: "/dashboard", label: "Dashboard", icon: "🏠" },
    { href: "/dashboard/recipes", label: "Recipes", icon: "🍴" },
    { href: "/dashboard/meal-plans", label: "Meal Plans", icon: "📅" },
    { href: "/dashboard/shopping-list", label: "Shopping List", icon: "🛒" },
    { href: "/dashboard/favorites", label: "Favorites", icon: "❤️" },
  ];

  return (
    <aside className="hidden md:flex flex-col w-60 bg-secondary p-4 gap-2">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="flex items-center gap-2 p-2 rounded hover:bg-secondary/80"
        >
          <span>{link.icon}</span>
          <span>{link.label}</span>
        </Link>
      ))}
    </aside>
  );
}
