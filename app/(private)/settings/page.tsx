"use client";
import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Switch } from "@heroui/switch";
import { Select, SelectItem } from "@heroui/select";
import { Divider } from "@heroui/divider";
import { Chip } from "@heroui/chip";
import { Avatar } from "@heroui/avatar";
import { Skeleton } from "@heroui/skeleton";
import { useSession } from "next-auth/react";
import {
  User,
  Bell,
  Shield,
  Globe,
  Trash2,
  Save,
  LogOut,
  KeyRound,
} from "lucide-react";
import { logout } from "@/lib/actions/auth";
import { toast } from "sonner";

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
  { key: "low", label: "Petit budget (< 30$/semaine)" },
  { key: "medium", label: "Budget moyen (30-60$/semaine)" },
  { key: "high", label: "Budget confortable (60$+/semaine)" },
];

type Section = "profile" | "preferences" | "notifications" | "privacy";

function SectionSkeleton() {
  return (
    <Card className="p-6 border border-divider/50 bg-white/70 dark:bg-black/40">
      <div className="flex flex-col gap-5">
        <Skeleton className="h-6 w-48 rounded-lg" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-10 w-40 rounded-xl" />
      </div>
    </Card>
  );
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const [activeSection, setActiveSection] = useState<Section>("profile");
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [savingNotifs, setSavingNotifs] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const [preferences, setPreferences] = useState({
    dietary: "none",
    budget: "medium",
    allergies: [] as string[],
  });

  const [notifications, setNotifications] = useState({
    mealReminders: true,
    weeklyPlan: true,
    newRecipes: false,
    newsletter: false,
    tips: true,
  });

  // Load all data on mount
  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      try {
        const [profileRes, prefsRes, notifsRes] = await Promise.all([
          fetch("/api/user/profile"),
          fetch("/api/user/preferences"),
          fetch("/api/user/notifications"),
        ]);

        if (profileRes.ok) {
          const { profile } = await profileRes.json();
          setProfileForm({
            name: profile?.name || session?.user?.name || "",
            email: profile?.email || session?.user?.email || "",
          });
        }

        if (prefsRes.ok) {
          const data = await prefsRes.json();
          setPreferences({
            dietary: data.dietary || "none",
            budget: data.budget || "medium",
            allergies: data.allergies || [],
          });
        }

        if (notifsRes.ok) {
          const { notifications: n } = await notifsRes.json();
          setNotifications(n);
        }
      } catch {
        toast.error("Impossible de charger les paramètres");
      } finally {
        setLoading(false);
      }
    }

    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveProfile() {
    setSavingProfile(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profileForm.name }),
      });
      if (!res.ok) throw new Error();
      toast.success("Profil mis à jour !");
    } catch {
      toast.error("Erreur lors de la mise à jour du profil");
    } finally {
      setSavingProfile(false);
    }
  }

  async function savePassword() {
    if (!passwordForm.password) return;
    if (passwordForm.password.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }
    if (passwordForm.password !== passwordForm.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    setSavingPassword(true);
    try {
      const res = await fetch("/api/user/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password: passwordForm.password,
          confirmPassword: passwordForm.confirmPassword,
        }),
      });
      if (!res.ok) throw new Error();
      setPasswordForm({ password: "", confirmPassword: "" });
      toast.success("Mot de passe mis à jour !");
    } catch {
      toast.error("Erreur lors du changement de mot de passe");
    } finally {
      setSavingPassword(false);
    }
  }

  async function savePreferences() {
    setSavingPrefs(true);
    try {
      const res = await fetch("/api/user/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });
      if (!res.ok) throw new Error();
      toast.success("Préférences sauvegardées !");
    } catch {
      toast.error("Erreur lors de la sauvegarde des préférences");
    } finally {
      setSavingPrefs(false);
    }
  }

  async function saveNotifications() {
    setSavingNotifs(true);
    try {
      const res = await fetch("/api/user/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notifications),
      });
      if (!res.ok) throw new Error();
      toast.success("Notifications mises à jour !");
    } catch {
      toast.error("Erreur lors de la mise à jour des notifications");
    } finally {
      setSavingNotifs(false);
    }
  }

  const sections: { key: Section; label: string; icon: React.ReactNode }[] = [
    { key: "profile", label: "Profil", icon: <User className="w-4 h-4" /> },
    {
      key: "preferences",
      label: "Préférences",
      icon: <Globe className="w-4 h-4" />,
    },
    {
      key: "notifications",
      label: "Notifications",
      icon: <Bell className="w-4 h-4" />,
    },
    {
      key: "privacy",
      label: "Confidentialité",
      icon: <Shield className="w-4 h-4" />,
    },
  ];

  const initials = (session?.user?.name || session?.user?.email || "U")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-8">
      <h1 className="text-3xl font-bold">Paramètres</h1>

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
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-danger hover:bg-danger/10 transition-colors text-left w-full lg:flex hidden"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </nav>

        {/* Content */}
        <div className="flex-1">
          {/* Profile section */}
          {activeSection === "profile" &&
            (loading ? (
              <SectionSkeleton />
            ) : (
              <div className="flex flex-col gap-4">
                <Card className="p-6 border border-divider/50 bg-white/70 dark:bg-black/40">
                  <CardHeader className="pb-2 p-0 mb-6">
                    <h2 className="font-bold text-xl">
                      Informations du profil
                    </h2>
                  </CardHeader>
                  <CardBody className="p-0 flex flex-col gap-6">
                    <div className="flex items-center gap-4">
                      <Avatar
                        isBordered
                        color="success"
                        name={initials}
                        src={session?.user?.image || undefined}
                        className="w-16 m-1 h-16 text-xl font-bold"
                      />
                      <div>
                        <p className="font-semibold">
                          {session?.user?.name || "Utilisateur"}
                        </p>
                        <p className="text-default-400 text-xs">
                          {session?.user?.email}
                        </p>
                      </div>
                    </div>

                    <Divider className="bg-divider/50" />

                    <div className="flex flex-col gap-4">
                      <Input
                        label="Nom d'affichage"
                        placeholder="Ton prénom ou pseudo"
                        value={profileForm.name}
                        onValueChange={(v) =>
                          setProfileForm({ ...profileForm, name: v })
                        }
                        variant="flat"
                      />
                      <Input
                        label="Adresse email"
                        placeholder="ton@email.com"
                        type="email"
                        value={profileForm.email}
                        variant="flat"
                        isReadOnly
                        description="L'adresse email ne peut pas être modifiée ici."
                      />
                    </div>

                    <Button
                      color="success"
                      className="font-semibold w-fit"
                      startContent={<Save className="w-4 h-4" />}
                      onPress={saveProfile}
                      isLoading={savingProfile}
                    >
                      Sauvegarder le profil
                    </Button>
                  </CardBody>
                </Card>

                {/* Password card */}
                <Card className="p-6 border border-divider/50 bg-white/70 dark:bg-black/40">
                  <CardHeader className="pb-2 p-0 mb-6">
                    <h2 className="font-bold text-xl flex items-center gap-2">
                      <KeyRound className="w-5 h-5 text-default-400" />
                      Changer le mot de passe
                    </h2>
                  </CardHeader>
                  <CardBody className="p-0 flex flex-col gap-4">
                    <Input
                      label="Nouveau mot de passe"
                      placeholder="Minimum 8 caractères"
                      type="password"
                      value={passwordForm.password}
                      onValueChange={(v) =>
                        setPasswordForm({ ...passwordForm, password: v })
                      }
                      variant="flat"
                    />
                    <Input
                      label="Confirmer le mot de passe"
                      placeholder="Répète le nouveau mot de passe"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onValueChange={(v) =>
                        setPasswordForm({ ...passwordForm, confirmPassword: v })
                      }
                      variant="flat"
                      isInvalid={
                        passwordForm.confirmPassword.length > 0 &&
                        passwordForm.password !== passwordForm.confirmPassword
                      }
                      errorMessage="Les mots de passe ne correspondent pas"
                    />
                    <Button
                      color="success"
                      variant="flat"
                      className="font-semibold w-fit"
                      startContent={<KeyRound className="w-4 h-4" />}
                      onPress={savePassword}
                      isLoading={savingPassword}
                      isDisabled={!passwordForm.password}
                    >
                      Mettre à jour le mot de passe
                    </Button>
                  </CardBody>
                </Card>
              </div>
            ))}

          {/* Preferences section */}
          {activeSection === "preferences" &&
            (loading ? (
              <SectionSkeleton />
            ) : (
              <Card className="p-6 border border-divider/50 bg-white/70 dark:bg-black/40">
                <CardHeader className="pb-2 p-0 mb-6">
                  <h2 className="font-bold text-xl">
                    Préférences alimentaires
                  </h2>
                </CardHeader>
                <CardBody className="p-0 flex flex-col gap-5">
                  <Select
                    label="Régime alimentaire"
                    selectedKeys={[preferences.dietary]}
                    onSelectionChange={(keys) =>
                      setPreferences({
                        ...preferences,
                        dietary: Array.from(keys)[0] as string,
                      })
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
                      setPreferences({
                        ...preferences,
                        budget: Array.from(keys)[0] as string,
                      })
                    }
                    variant="flat"
                  >
                    {budgetOptions.map((opt) => (
                      <SelectItem key={opt.key}>{opt.label}</SelectItem>
                    ))}
                  </Select>

                  <Button
                    color="success"
                    className="font-semibold w-fit"
                    startContent={<Save className="w-4 h-4" />}
                    onPress={savePreferences}
                    isLoading={savingPrefs}
                  >
                    Sauvegarder les préférences
                  </Button>
                </CardBody>
              </Card>
            ))}

          {/* Notifications section */}
          {activeSection === "notifications" &&
            (loading ? (
              <SectionSkeleton />
            ) : (
              <Card className="p-6 border border-divider/50 bg-white/70 dark:bg-black/40">
                <CardHeader className="pb-2 p-0 mb-6">
                  <h2 className="font-bold text-xl">
                    Préférences de notification
                  </h2>
                </CardHeader>
                <CardBody className="p-0 flex flex-col gap-0">
                  {(
                    [
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
                    ] as {
                      key: keyof typeof notifications;
                      label: string;
                      desc: string;
                    }[]
                  ).map((item, i, arr) => (
                    <div key={item.key}>
                      <div className="flex items-center justify-between py-4">
                        <div>
                          <p className="font-medium text-sm">{item.label}</p>
                          <p className="text-default-400 text-xs">
                            {item.desc}
                          </p>
                        </div>
                        <Switch
                          isSelected={notifications[item.key]}
                          onValueChange={(v) =>
                            setNotifications({
                              ...notifications,
                              [item.key]: v,
                            })
                          }
                          color="success"
                          size="sm"
                        />
                      </div>
                      {i < arr.length - 1 && (
                        <Divider className="bg-divider/50" />
                      )}
                    </div>
                  ))}

                  <Button
                    color="success"
                    className="font-semibold mt-4 w-fit"
                    startContent={<Save className="w-4 h-4" />}
                    onPress={saveNotifications}
                    isLoading={savingNotifs}
                  >
                    Sauvegarder les notifications
                  </Button>
                </CardBody>
              </Card>
            ))}

          {/* Privacy section */}
          {activeSection === "privacy" && (
            <div className="flex flex-col gap-4">
              <Card className="p-6 border border-divider/50 bg-white/70 dark:bg-black/40">
                <CardHeader className="pb-2 p-0 mb-4">
                  <h2 className="font-bold text-xl">
                    Confidentialité et données
                  </h2>
                </CardHeader>
                <CardBody className="p-0 flex flex-col gap-4">
                  <p className="text-default-500 text-sm">
                    Tes données personnelles sont protégées et ne sont jamais
                    partagées avec des tiers sans ton consentement explicite.
                  </p>
                  <div className="flex flex-col gap-3">
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
                  <h2 className="font-bold text-xl text-danger">
                    Zone dangereuse
                  </h2>
                </CardHeader>
                <CardBody className="p-0 flex flex-col gap-3">
                  <p className="text-default-500 text-sm">
                    La suppression de ton compte est irréversible. Toutes tes
                    données, recettes et plans de repas seront définitivement
                    supprimés.
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

              <div className="lg:hidden">
                <Button
                  color="danger"
                  variant="flat"
                  startContent={<LogOut className="w-4 h-4" />}
                  className="font-semibold w-full"
                  onPress={() => logout()}
                >
                  Déconnexion
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
