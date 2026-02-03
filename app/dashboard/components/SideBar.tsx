"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Recipes", href: "/dashboard/recipes" },
  { name: "Meal Plans", href: "/dashboard/meal-plans" },
  { name: "Shopping List", href: "/dashboard/shopping-list" },
  { name: "Favorites", href: "/dashboard/favorites" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-background border-r p-4">
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`px-4 py-2 rounded-medium hover:bg-primary/10 ${
                isActive ? "bg-primary text-primary-foreground" : "text-foreground"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
