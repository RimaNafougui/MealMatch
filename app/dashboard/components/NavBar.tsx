"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  Button,
  Input,
  Link,
} from "@heroui/react";

import Sidebar from "./SideBar";

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <>
      <Navbar isBordered className="sticky top-0 z-50">
        {/* LEFT */}
        <NavbarContent>
          <NavbarMenuToggle className="sm:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)} />

          <NavbarBrand className="gap-2">
            <Image src="/images/logo.png" alt="MealMatch Logo" width={40} height={40} />
            <span className="font-bold text-xl">MealMatch</span>
          </NavbarBrand>
        </NavbarContent>

        {/* CENTER (desktop only) */}
        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarItem>
            <Link href="/dashboard">Dashboard</Link>
          </NavbarItem>
          <NavbarItem>
            <Link href="/recipes">Recipes</Link>
          </NavbarItem>
        </NavbarContent>

        {/* RIGHT */}
        <NavbarContent justify="end">
          <NavbarItem className="hidden md:flex">
            <Input size="sm" placeholder="Search..." startContent={<span>🔍</span>} />
          </NavbarItem>

          <NavbarItem>
            <Button size="sm" color="primary">
              JG
            </Button>
          </NavbarItem>

          <NavbarItem>
            <Button size="sm" variant="bordered" onPress={toggleTheme}>
              {theme === "dark" ? "🌙" : "☀️"}
            </Button>
          </NavbarItem>
        </NavbarContent>
      </Navbar>

      {/* MOBILE SIDEBAR */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setIsMenuOpen(false)}>
          <div
            className="absolute top-0 left-0 h-full w-60 bg-secondary p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Affiche seulement le Sidebar sur mobile */}
            <Sidebar isMobile={true} />
          </div>
        </div>
      )}
    </>
  );
}
