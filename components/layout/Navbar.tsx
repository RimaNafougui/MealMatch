"use client";

import React from "react";
import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
  Button,
} from "@heroui/react";
import { link as linkStyles } from "@heroui/theme";
import NextLink from "next/link";
import clsx from "clsx";
import {
  Sparkles,
  LayoutDashboard,
  Compass,
  Home,
  Tag,
  Info,
  LogIn,
  User,
  Settings,
  Utensils,
  LogOut,
} from "lucide-react";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { ProfileDropdown } from "@/components/login/dropdown";
import { Logo } from "@/components/logo";
import { logout } from "@/lib/actions/auth";

// ─── Nav item definitions ─────────────────────────────────────────────────────

const publicNavItems = [
  { label: "Accueil", href: "/", icon: <Home size={18} /> },
  { label: "Tarification", href: "/pricing", icon: <Tag size={18} /> },
  { label: "Nutrition", href: "/nutrition", icon: <Info size={18} /> },
];

const privateNavItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard size={18} />,
  },
  { label: "Explorer", href: "/explore", icon: <Compass size={18} /> },
];

// ─── Component ────────────────────────────────────────────────────────────────

export const AppNavbar = ({ user }: { user: any }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const navItems = user ? privateNavItems : publicNavItems;

  return (
    <HeroUINavbar
      isMenuOpen={isMenuOpen}
      onMenuOpenChange={setIsMenuOpen}
      maxWidth="xl"
      position="sticky"
      classNames={{
        base: "backdrop-blur-md bg-background/80 border-b border-divider/50",
        wrapper: "px-4 sm:px-6",
      }}
    >
      {/* ── Left: hamburger (mobile) + brand ───────────────────────────────── */}
      <NavbarContent justify="start" className="gap-3">
        {/* Hamburger — visible below md */}
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          className="md:hidden text-default-600"
        />

        {/* Brand / Logo */}
        <NavbarBrand>
          <NextLink
            className="flex items-center gap-2"
            href={user ? "/dashboard" : "/"}
          >
            <Logo />
          </NextLink>
        </NavbarBrand>
      </NavbarContent>

      {/* ── Centre: desktop nav links — hidden below md ─────────────────────── */}
      <NavbarContent className="hidden md:flex gap-1" justify="center">
        {navItems.map((item) => (
          <NavbarItem key={item.href}>
            <NextLink
              className={clsx(
                linkStyles({ color: "foreground" }),
                "text-sm font-medium px-3 py-1.5 rounded-lg hover:text-success hover:bg-success/5 transition-colors relative group",
              )}
              href={item.href}
            >
              {item.label}
              <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-success scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
            </NextLink>
          </NavbarItem>
        ))}
      </NavbarContent>

      {/* ── Right: theme + auth actions ─────────────────────────────────────── */}
      <NavbarContent justify="end" className="gap-2">
        <NavbarItem>
          <ThemeSwitch />
        </NavbarItem>

        {user ? (
          <NavbarItem>
            <ProfileDropdown user={user} />
          </NavbarItem>
        ) : (
          <>
            {/* Login — hidden on very small screens */}
            <NavbarItem className="hidden sm:flex">
              <Button
                as={NextLink}
                href="/login"
                variant="light"
                size="sm"
                className="font-medium"
              >
                Connexion
              </Button>
            </NavbarItem>

            {/* Sign up — always visible */}
            <NavbarItem>
              <Button
                as={NextLink}
                href="/signup"
                color="success"
                size="sm"
                className="font-semibold text-white"
                startContent={<Sparkles size={13} />}
              >
                <span className="hidden sm:inline">Commencer</span>
                <span className="sm:hidden">S&apos;inscrire</span>
              </Button>
            </NavbarItem>
          </>
        )}
      </NavbarContent>

      {/* ── Mobile menu ─────────────────────────────────────────────────────── */}
      <NavbarMenu className="pt-6 pb-8 bg-background/98 backdrop-blur-xl gap-0">
        {/* Nav links */}
        <div className="flex flex-col gap-1 mb-6">
          <p className="text-[10px] font-bold text-default-400 uppercase tracking-widest px-3 mb-2">
            Navigation
          </p>
          {navItems.map((item) => (
            <NavbarMenuItem key={item.href}>
              <NextLink
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-default-700 hover:bg-success/8 hover:text-success transition-colors"
              >
                <span className="w-8 h-8 rounded-lg bg-default-100 dark:bg-default-50/10 flex items-center justify-center text-default-500">
                  {item.icon}
                </span>
                {item.label}
              </NextLink>
            </NavbarMenuItem>
          ))}
        </div>

        {/* Auth section */}
        <div className="border-t border-divider/50 pt-6 flex flex-col gap-1">
          {user ? (
            <>
              <p className="text-[10px] font-bold text-default-400 uppercase tracking-widest px-3 mb-2">
                Mon compte
              </p>
              {[
                {
                  label: "Mon Profil",
                  href: "/profile",
                  icon: <User size={18} />,
                },
                {
                  label: "Mes Recettes",
                  href: "/dashboard/recettes",
                  icon: <Utensils size={18} />,
                },
                {
                  label: "Paramètres",
                  href: "/settings",
                  icon: <Settings size={18} />,
                },
              ].map((item) => (
                <NavbarMenuItem key={item.href}>
                  <NextLink
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-default-700 hover:bg-success/8 hover:text-success transition-colors"
                  >
                    <span className="w-8 h-8 rounded-lg bg-default-100 dark:bg-default-50/10 flex items-center justify-center text-default-500">
                      {item.icon}
                    </span>
                    {item.label}
                  </NextLink>
                </NavbarMenuItem>
              ))}
              <NavbarMenuItem>
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-danger hover:bg-danger/8 transition-colors w-full text-left"
                >
                  <span className="w-8 h-8 rounded-lg bg-danger/10 flex items-center justify-center">
                    <LogOut size={18} className="text-danger" />
                  </span>
                  Déconnexion
                </button>
              </NavbarMenuItem>
            </>
          ) : (
            <>
              <NavbarMenuItem>
                <NextLink
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-default-700 hover:bg-success/8 hover:text-success transition-colors"
                >
                  <span className="w-8 h-8 rounded-lg bg-default-100 dark:bg-default-50/10 flex items-center justify-center text-default-500">
                    <LogIn size={18} />
                  </span>
                  Connexion
                </NextLink>
              </NavbarMenuItem>
              <NavbarMenuItem>
                <NextLink
                  href="/signup"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-success hover:bg-success/8 transition-colors"
                >
                  <span className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                    <Sparkles size={18} className="text-success" />
                  </span>
                  Commencer gratuitement
                </NextLink>
              </NavbarMenuItem>
            </>
          )}
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
