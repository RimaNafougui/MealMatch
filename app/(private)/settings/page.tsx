"use client";
import { useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Switch } from "@heroui/switch";
import { Select, SelectItem } from "@heroui/select";
import { Divider } from "@heroui/divider";
import { Chip } from "@heroui/chip";
import { Avatar } from "@heroui/avatar";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Trash2,
  Save,
  LogOut,
} from "lucide-react";
import { logout } from "@/lib/actions/auth";

const dietaryOptions = [
  { key: "none", label: "Aucun régime particulier" },
  { key: "vegetarian", label: "Végétarien" },
  { key: "vegan", label: "Végétalien / Vegan" },
  { key: "gluten-free", label: "Sans gluten" },
  { key: "dairy-free", label: "Sans lactose" },
  { key: "keto", label: "Keto / Cétogène" },
  { key: "halal", label: "Halal" },
  { key: "kosher", label: "Casher" },
];

const budgetOptions = [
  { key: "low", label: "Petit budget (< 30€/semaine)" },
  { key: "medium", label: "Budget moyen (30-60€/semaine)" },
  { key: "high", label: "Budget confortable (60€+/semaine)" },
];

const languageOptions = [
  { key: "fr", label: "Français" },
  { key: "en", label: "English" },
];

type Section = "profile" | "preferences" | "notifications" | "privacy";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [activeSection, setActiveSection] = useState<Section>("profile");
  const [saved, setSaved] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
  });

  const [preferences, setPreferences] = useState({
    dietary: "none",
    budget: "medium",
    language: "fr",
    servings: "2",
  });

  const [notifications, setNotifications] = useState({
    mealReminders: true,
    weeklyPlan: true,
    newRecipes: false,
    newsletter: false,
    tips: true,
  });

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const sections: { key: Section; label: string; icon: React.ReactNode }[] = [
    { key: "profile", label: "Profil", icon: <User className="w-4 h-4" /> },
    { key: "preferences", label: "Préférences", icon: <Globe className="w-4 h-4" /> },
    { key: "notifications", label: "Notifications", icon: <Bell className="w-4 h-4" /> },
    { key: "privacy", label: "Confidentialité", icon: <Shield className="w-4 h-4" /> },
  ];

  const initials = (session?.user?.name || session?.user?.email || "U")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Paramètres</h1>
        {saved && (
          <Chip color="success" variant="flat" className="font-semibold animate-fade-in">
            Sauvegardé !
          </Chip>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <nav className="flex lg:flex-col gap-2 lg:w-48 flex-shrink-0">
          {sections.map((s) => (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left w-full ${
                activeSection === s.key
                  ? "bg-success/10 text-success"
                  : "text-default-500 hover:text-foreground hover:bg-default-100"
              }`}
            >
              {s.icon}
              {s.label}
            </button>
          ))}
          <Divider className="my-2 hidden lg:block" />
          <button
            onClick={() => logout()}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-danger hover:bg-danger/10 transition-colors text-left w-full hidden lg:flex"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </nav>

        {/* Content */}
        <div className="flex-1">
          {/* Profile section */}
          {activeSection === "profile" && (
            <Card className="p-6 border border-divider/50 bg-white/70 dark:bg-black/40">
              <CardHeader className="pb-2 p-0 mb-6">
                <h2 className="font-bold text-xl">Informations du profil</h2>
              </CardHeader>
              <CardBody className="p-0 flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <Avatar
                    isBordered
                    color="success"
                    name={initials}
                    src={session?.user?.image || undefined}
                    className="w-16 h-16 text-xl font-bold"
                  />
                  <div>
                    <p className="font-semibold">{session?.user?.name || "Utilisateur"}</p>
                    <p className="text-default-400 text-xs">{session?.user?.email}</p>
                  </div>
                </div>

                <Divider className="bg-divider/50" />

                <div className="flex flex-col gap-4">
                  <Input
                    label="Nom d'affichage"
                    placeholder="Ton prénom ou pseudo"
                    value={profileForm.name}
                    onValueChange={(v) => setProfileForm({ ...profileForm, name: v })}
                    variant="flat"
                  />
                  <Input
                    label="Adresse email"
                    placeholder="ton@email.com"
                    type="email"
                    value={profileForm.email}
                    onValueChange={(v) => setProfileForm({ ...profileForm, email: v })}
                    variant="flat"
                    description="Modifier l'email nécessite une confirmation."
                  />
                  <Input
                    label="Nouveau mot de passe"
                    placeholder="Laisser vide pour ne pas changer"
                    type="password"
                    variant="flat"
                  />
                  <Input
                    label="Confirmer le mot de passe"
                    placeholder="Répète le nouveau mot de passe"
                    type="password"
                    variant="flat"
                  />
                </div>

                <Button
                  color="success"
                  className="font-semibold"
                  startContent={<Save className="w-4 h-4" />}
                  onPress={handleSave}
                >
                  Sauvegarder les modifications
                </Button>
              </CardBody>
            </Card>
          )}

          {/* Preferences section */}
          {activeSection === "preferences" && (
            <Card className="p-6 border border-divider/50 bg-white/70 dark:bg-black/40">
              <CardHeader className="pb-2 p-0 mb-6">
                <h2 className="font-bold text-xl">Préférences alimentaires</h2>
              </CardHeader>
              <CardBody className="p-0 flex flex-col gap-5">
                <Select
                  label="Régime alimentaire"
                  selectedKeys={[preferences.dietary]}
                  onSelectionChange={(keys) =>
                    setPreferences({ ...preferences, dietary: Array.from(keys)[0] as string })
                  }
                  variant="flat"
                >
                  {dietaryOptions.map((opt) => (
                    <SelectItem key={opt.key}>{opt.label}</SelectItem>
                  ))}
                </Select>

                <Select
                  label="Budget hebdomadaire"
                  selectedKeys={[preferences.budget]}
                  onSelectionChange={(keys) =>
                    setPreferences({ ...preferences, budget: Array.from(keys)[0] as string })
                  }
                  variant="flat"
                >
                  {budgetOptions.map((opt) => (
                    <SelectItem key={opt.key}>{opt.label}</SelectItem>
                  ))}
                </Select>

                <Select
                  label="Nombre de portions par repas"
                  selectedKeys={[preferences.servings]}
                  onSelectionChange={(keys) =>
                    setPreferences({ ...preferences, servings: Array.from(keys)[0] as string })
                  }
                  variant="flat"
                >
                  {["1", "2", "3", "4"].map((n) => (
                    <SelectItem key={n}>{n} portion{n !== "1" ? "s" : ""}</SelectItem>
                  ))}
                </Select>

                <Select
                  label="Langue de l'application"
                  selectedKeys={[preferences.language]}
                  onSelectionChange={(keys) =>
                    setPreferences({ ...preferences, language: Array.from(keys)[0] as string })
                  }
                  variant="flat"
                >
                  {languageOptions.map((opt) => (
                    <SelectItem key={opt.key}>{opt.label}</SelectItem>
                  ))}
                </Select>

                <Button
                  color="success"
                  className="font-semibold"
                  startContent={<Save className="w-4 h-4" />}
                  onPress={handleSave}
                >
                  Sauvegarder les préférences
                </Button>
              </CardBody>
            </Card>
          )}

          {/* Notifications section */}
          {activeSection === "notifications" && (
            <Card className="p-6 border border-divider/50 bg-white/70 dark:bg-black/40">
              <CardHeader className="pb-2 p-0 mb-6">
                <h2 className="font-bold text-xl">Préférences de notification</h2>
              </CardHeader>
              <CardBody className="p-0 flex flex-col gap-0">
                {[
                  {
                    key: "mealReminders" as const,
                    label: "Rappels de repas",
                    desc: "Notifications pour les repas planifiés",
                  },
                  {
                    key: "weeklyPlan" as const,
                    label: "Résumé hebdomadaire",
                    desc: "Récapitulatif de ton plan de la semaine",
                  },
                  {
                    key: "newRecipes" as const,
                    label: "Nouvelles recettes",
                    desc: "Alertes lors de l'ajout de nouvelles recettes",
                  },
                  {
                    key: "tips" as const,
                    label: "Conseils nutritionnels",
                    desc: "Astuces et conseils pour mieux manger",
                  },
                  {
                    key: "newsletter" as const,
                    label: "Newsletter",
                    desc: "Actualités et offres de MealMatch",
                  },
                ].map((item, i, arr) => (
                  <div key={item.key}>
                    <div className="flex items-center justify-between py-4">
                      <div>
                        <p className="font-medium text-sm">{item.label}</p>
                        <p className="text-default-400 text-xs">{item.desc}</p>
                      </div>
                      <Switch
                        isSelected={notifications[item.key]}
                        onValueChange={(v) =>
                          setNotifications({ ...notifications, [item.key]: v })
                        }
                        color="success"
                        size="sm"
                      />
                    </div>
                    {i < arr.length - 1 && <Divider className="bg-divider/50" />}
                  </div>
                ))}

                <Button
                  color="success"
                  className="font-semibold mt-4"
                  startContent={<Save className="w-4 h-4" />}
                  onPress={handleSave}
                >
                  Sauvegarder les notifications
                </Button>
              </CardBody>
            </Card>
          )}

          {/* Privacy section */}
          {activeSection === "privacy" && (
            <div className="flex flex-col gap-4">
              <Card className="p-6 border border-divider/50 bg-white/70 dark:bg-black/40">
                <CardHeader className="pb-2 p-0 mb-4">
                  <h2 className="font-bold text-xl">Confidentialité et données</h2>
                </CardHeader>
                <CardBody className="p-0 flex flex-col gap-4">
                  <p className="text-default-500 text-sm">
                    Tes données personnelles sont protégées et ne sont jamais partagées
                    avec des tiers sans ton consentement explicite.
                  </p>
                  <div className="flex flex-col gap-3">
                    <Button variant="flat" color="primary" className="font-semibold justify-start">
                      Télécharger mes données
                    </Button>
                    <Button
                      variant="flat"
                      color="default"
                      className="font-semibold justify-start"
                      as="a"
                      href="/privacy"
                    >
                      Lire la politique de confidentialité
                    </Button>
                    <Button
                      variant="flat"
                      color="default"
                      className="font-semibold justify-start"
                      as="a"
                      href="/terms"
                    >
                      Conditions d'utilisation
                    </Button>
                  </div>
                </CardBody>
              </Card>

              <Card className="p-6 border border-danger/30 bg-danger/5">
                <CardHeader className="pb-2 p-0 mb-4">
                  <h2 className="font-bold text-xl text-danger">Zone dangereuse</h2>
                </CardHeader>
                <CardBody className="p-0 flex flex-col gap-3">
                  <p className="text-default-500 text-sm">
                    La suppression de ton compte est irréversible. Toutes tes données,
                    recettes et plans de repas seront définitivement supprimés.
                  </p>
                  <Button
                    color="danger"
                    variant="bordered"
                    startContent={<Trash2 className="w-4 h-4" />}
                    className="font-semibold w-fit"
                  >
                    Supprimer mon compte
                  </Button>
                </CardBody>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
