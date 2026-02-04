"use client";

import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  Link,
} from "@heroui/react";
import { useState } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <Navbar
      isBordered
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
    >
      {/* LEFT */}
      <NavbarContent>
        <NavbarMenuToggle className="sm:hidden" />
        <NavbarBrand>
          <span className="font-bold">MealMatch</span>
        </NavbarBrand>
      </NavbarContent>

      {/* DESKTOP NAV */}
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarItem>
          <Link href="/dashboard">Dashboard</Link>
        </NavbarItem>
        <NavbarItem>
          <Link href="/recipes">Recipes</Link>
        </NavbarItem>
      </NavbarContent>

      {/* MOBILE MENU */}
      <NavbarMenu>
        <NavbarMenuItem>
          <Link href="/dashboard">Dashboard</Link>
        </NavbarMenuItem>
        <NavbarMenuItem>
          <Link href="/recipes">Recipes</Link>
        </NavbarMenuItem>
        <NavbarMenuItem>
          <Link href="/meal-plans">Meal Plans</Link>
        </NavbarMenuItem>
      </NavbarMenu>
    </Navbar>
  );
}
