export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Meal Match",
  description: "Plateforme d'aide à la préparation des repas pour étudiants",
  navItems: [
    {
      label: "Acceuil",
      href: "/",
    },
    {
      label: "Recettes",
      href: "/recettes",
    },
    {
      label: "Pricing",
      href: "/pricing",
    },
    {
      label: "About",
      href: "/about",
    },
  ],
  navMenuItems: [
    {
      label: "Profile",
      href: "/profile",
    },
    {
      label: "Dashboard",
      href: "/dashboard",
    },
    {
      label: "Projects",
      href: "/projects",
    },
    {
      label: "Team",
      href: "/team",
    },
    {
      label: "Calendar",
      href: "/calendar",
    },
    {
      label: "Settings",
      href: "/settings",
    },
    {
      label: "Help & Feedback",
      href: "/help-feedback",
    },
    {
      label: "Logout",
      href: "/logout",
    },
  ],
  links: {
    github: "https://github.com/Mercuryy200/MealMatch",
    twitter: "https://twitter.com/hero_ui",
    docs: "https://heroui.com",
    discord: "https://discord.gg/9b6yyZKmH4",
    sponsor: "https://patreon.com/jrgarciadev",
  },
};
