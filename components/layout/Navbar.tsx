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
  Badge,
} from "@heroui/react";
import { link as linkStyles } from "@heroui/theme";
import NextLink from "next/link";
import clsx from "clsx";
import { Sparkles } from "lucide-react";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { ProfileDropdown } from "@/components/login/dropdown";
import { Logo } from "@/components/logo";

const privateNavItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Explorer", href: "/explore" },
];

export const AppNavbar = ({ user }: { user: any }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useReducer(
    (current) => !current,
    false,
  );

  const navItems = user ? privateNavItems : siteConfig.navItems;

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
      <NavbarContent className="sm:hidden" justify="start">
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        />
      </NavbarContent>

      <NavbarContent justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink
            className="flex justify-start items-center gap-1"
            href={user ? "/dashboard" : "/"}
          >
            <Logo />
          </NextLink>
        </NavbarBrand>

        <ul className="hidden lg:flex gap-6 ml-6">
          {navItems.map((item) => (
            <NavbarItem key={item.href}>
              <NextLink
                className={clsx(
                  linkStyles({ color: "foreground" }),
                  "text-sm font-medium hover:text-success transition-colors relative group",
                )}
                href={item.href}
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-success group-hover:w-full transition-all duration-300" />
              </NextLink>
            </NavbarItem>
          ))}
        </ul>
      </NavbarContent>

      <NavbarContent justify="end" className="gap-3">
        <NavbarItem className="hidden sm:flex">
          <ThemeSwitch />
        </NavbarItem>

        {user ? (
          <NavbarItem>
            <ProfileDropdown user={user} />
          </NavbarItem>
        ) : (
          <div className="flex gap-2">
            <Button
              as={NextLink}
              href="/login"
              variant="light"
              size="sm"
              className="font-medium"
            >
              Connexion
            </Button>
            <Badge
              content={<Sparkles size={10} />}
              color="success"
              size="sm"
              placement="top-right"
              className="hidden sm:flex"
            >
              <Button
                as={NextLink}
                href="/signup"
                color="success"
                variant="flat"
                size="sm"
                className="font-semibold"
              >
                Commencer
              </Button>
            </Badge>
            <Button
              as={NextLink}
              href="/signup"
              color="success"
              variant="flat"
              size="sm"
              className="font-semibold sm:hidden"
            >
              Inscription
            </Button>
          </div>
        )}
      </NavbarContent>

      <NavbarMenu className="pt-8 pb-6 bg-background/95 backdrop-blur-lg">
        <div className="flex flex-col gap-4">
          {user ? (
            navItems.map((item, index) => (
              <NavbarMenuItem key={`${item.label}-${index}`}>
                <NextLink
                  className="w-full text-2xl font-medium tracking-tight py-2 hover:text-success transition-colors"
                  href={item.href}
                  onClick={() => setIsMenuOpen()}
                >
                  {item.label}
                </NextLink>
              </NavbarMenuItem>
            ))
          ) : (
            <>
              <NavbarMenuItem>
                <NextLink
                  className="text-2xl font-medium tracking-tight py-2 hover:text-success transition-colors"
                  href="/login"
                  onClick={() => setIsMenuOpen()}
                >
                  Connexion
                </NextLink>
              </NavbarMenuItem>
              <NavbarMenuItem>
                <NextLink
                  className="text-2xl font-medium tracking-tight py-2 text-success flex items-center gap-2"
                  href="/signup"
                  onClick={() => setIsMenuOpen()}
                >
                  <Sparkles size={20} />
                  Commencer
                </NextLink>
              </NavbarMenuItem>
            </>
          )}

          <div className="pt-6 mt-4 border-t border-divider/50 flex items-center justify-between">
            <span className="text-sm font-medium text-default-600">Thème</span>
            <ThemeSwitch />
          </div>
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};
