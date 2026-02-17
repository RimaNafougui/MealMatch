"use client";
import { Link, Input, Button, Divider } from "@heroui/react";
import { Leaf, Mail } from "lucide-react";
import { FaGithub, FaInstagram, FaTwitter } from "react-icons/fa";
import { Logo } from "@/components/logo";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: "Produit",
      links: [
        { name: "Fonctionnalités", href: "/features" },
        { name: "Tarification", href: "/pricing" },
        { name: "Guide nutritionnel", href: "/nutrition" },
      ],
    },
    {
      title: "Ressources",
      links: [
        { name: "Blog", href: "/blog" },
        { name: "Recettes", href: "/explore" },
        { name: "Support", href: "/support" },
      ],
    },
    {
      title: "Légal",
      links: [
        { name: "Confidentialité", href: "/privacy" },
        { name: "Conditions d'utilisation", href: "/terms" },
        { name: "Politique de remboursement", href: "/refund-policy" },
      ],
    },
  ];

  return (
    <footer className="w-full border-t border-divider/50 bg-gradient-to-b from-background to-default-50/30 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          <div className="lg:col-span-5 flex flex-col gap-4">
            <Link href="/" className="text-foreground w-fit">
              <Logo />
            </Link>
            <p className="text-default-600 text-sm leading-relaxed max-w-sm">
              Planification intelligente des repas pour les étudiants. Mangez
              sainement, économisez de l'argent et découvrez de délicieuses
              recettes adaptées à votre budget et à vos besoins alimentaires.
            </p>

            <div className="flex flex-col gap-2 mt-1">
              <p className="text-xs font-semibold text-success uppercase tracking-wide flex items-center gap-2">
                <Leaf size={14} /> Restez à jour
              </p>
              <div className="flex gap-2 max-w-sm">
                <Input
                  placeholder="ton@courriel.com"
                  size="sm"
                  variant="flat"
                  startContent={<Mail size={16} className="text-default-400" />}
                  classNames={{
                    inputWrapper:
                      "bg-default-100 border border-divider/50 hover:border-success/50 transition-colors",
                  }}
                />
                <Button
                  size="sm"
                  color="success"
                  variant="flat"
                  className="font-semibold"
                >
                  S'abonner
                </Button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6">
            {footerLinks.map((section) => (
              <div key={section.title} className="flex flex-col gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-success">
                  {section.title}
                </h3>
                <ul className="flex flex-col gap-1.5">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-sm text-default-600 hover:text-success transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <Divider className="my-4 bg-divider/50" />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
            <p className="text-xs text-default-500 font-medium">
              © {currentYear} MealMatch. Fait avec{" "}
              <span className="text-danger">♥</span> pour les étudiants
            </p>
            <span className="hidden sm:inline text-divider">•</span>
            <Link
              href="mailto:nafouguirima@gmail.com"
              className="text-xs text-default-500 hover:text-success transition-colors flex items-center gap-1"
            >
              <Mail size={12} /> Contact
            </Link>
          </div>

          <div className="flex gap-4">
            <Link
              href="https://github.com/Mercuryy200/MealMatch"
              isExternal
              className="text-default-500 hover:text-foreground transition-colors"
            >
              <FaGithub size={18} />
            </Link>
            <Link
              href="https://twitter.com"
              isExternal
              className="text-default-500 hover:text-foreground transition-colors"
            >
              <FaTwitter size={18} />
            </Link>
            <Link
              href="https://instagram.com/"
              isExternal
              className="text-default-500 hover:text-foreground transition-colors"
            >
              <FaInstagram size={18} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
