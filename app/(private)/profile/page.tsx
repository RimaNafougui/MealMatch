import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Link } from "@heroui/link";
import {
  User,
  Mail,
  Calendar,
  Settings,
  Shield,
  Utensils,
  Heart,
  BarChart3,
} from "lucide-react";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user;
  const initials = (user.name || user.email || "U")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const stats = [
    { label: "Recettes sauvegardées", value: "—", icon: <Utensils className="w-4 h-4" />, color: "text-warning" },
    { label: "Plans de repas", value: "—", icon: <BarChart3 className="w-4 h-4" />, color: "text-primary" },
    { label: "Favoris", value: "—", icon: <Heart className="w-4 h-4" />, color: "text-danger" },
  ];

  const accountDetails = [
    {
      icon: <Mail className="w-4 h-4 text-default-400" />,
      label: "Adresse email",
      value: user.email || "Non renseigné",
    },
    {
      icon: <User className="w-4 h-4 text-default-400" />,
      label: "Nom d'utilisateur",
      value: user.name || "Non renseigné",
    },
    {
      icon: <Calendar className="w-4 h-4 text-default-400" />,
      label: "Membre depuis",
      value: "2024",
    },
    {
      icon: <Shield className="w-4 h-4 text-default-400" />,
      label: "Statut du compte",
      value: "Actif",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-8">
      <h1 className="text-3xl font-bold">Mon Profil</h1>

      {/* Profile card */}
      <Card className="p-6 border border-divider/50 bg-white/70 dark:bg-black/40">
        <CardBody className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-0">
          <Avatar
            isBordered
            color="success"
            name={initials}
            src={user.image || undefined}
            className="w-24 h-24 text-2xl font-bold flex-shrink-0"
          />
          <div className="flex flex-col gap-2 text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h2 className="text-2xl font-bold">{user.name || "Utilisateur"}</h2>
              <Chip color="success" variant="flat" size="sm" className="self-center sm:self-auto">
                Actif
              </Chip>
            </div>
            <p className="text-default-500 text-sm">{user.email}</p>
            <p className="text-default-400 text-xs mt-1">
              Membre MealMatch — Plan Gratuit
            </p>
          </div>
          <Button
            as={Link}
            href="/settings"
            variant="flat"
            color="default"
            startContent={<Settings className="w-4 h-4" />}
            className="font-semibold flex-shrink-0"
          >
            Modifier
          </Button>
        </CardBody>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="p-4 border border-divider/50 bg-white/50 dark:bg-black/20 text-center">
            <CardBody className="items-center gap-2 p-2">
              <div className={`${stat.color}`}>{stat.icon}</div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-default-400 text-xs">{stat.label}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Account info */}
      <Card className="p-6 border border-divider/50 bg-white/70 dark:bg-black/40">
        <CardHeader className="pb-2 p-0 mb-4">
          <h3 className="font-bold text-lg">Informations du compte</h3>
        </CardHeader>
        <CardBody className="p-0 flex flex-col gap-0">
          {accountDetails.map((detail, i) => (
            <div key={i}>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  {detail.icon}
                  <span className="text-sm text-default-500">{detail.label}</span>
                </div>
                <span className="text-sm font-medium">{detail.value}</span>
              </div>
              {i < accountDetails.length - 1 && <Divider className="bg-divider/50" />}
            </div>
          ))}
        </CardBody>
      </Card>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card
          as={Link}
          href="/dashboard/recettes"
          isHoverable
          isPressable
          className="p-4 border border-divider/50 bg-white/50 dark:bg-black/20"
        >
          <CardBody className="flex flex-row items-center gap-3 p-2">
            <Utensils className="w-5 h-5 text-warning" />
            <div>
              <p className="font-semibold text-sm">Mes recettes</p>
              <p className="text-default-400 text-xs">Voir les recettes sauvegardées</p>
            </div>
          </CardBody>
        </Card>
        <Card
          as={Link}
          href="/dashboard/favoris"
          isHoverable
          isPressable
          className="p-4 border border-divider/50 bg-white/50 dark:bg-black/20"
        >
          <CardBody className="flex flex-row items-center gap-3 p-2">
            <Heart className="w-5 h-5 text-danger" />
            <div>
              <p className="font-semibold text-sm">Mes favoris</p>
              <p className="text-default-400 text-xs">Voir les favoris</p>
            </div>
          </CardBody>
        </Card>
        <Card
          as={Link}
          href="/dashboard/meal-plans"
          isHoverable
          isPressable
          className="p-4 border border-divider/50 bg-white/50 dark:bg-black/20"
        >
          <CardBody className="flex flex-row items-center gap-3 p-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <div>
              <p className="font-semibold text-sm">Mes plans de repas</p>
              <p className="text-default-400 text-xs">Gérer mes planifications</p>
            </div>
          </CardBody>
        </Card>
        <Card
          as={Link}
          href="/settings"
          isHoverable
          isPressable
          className="p-4 border border-divider/50 bg-white/50 dark:bg-black/20"
        >
          <CardBody className="flex flex-row items-center gap-3 p-2">
            <Settings className="w-5 h-5 text-default-500" />
            <div>
              <p className="font-semibold text-sm">Paramètres</p>
              <p className="text-default-400 text-xs">Modifier mon profil et préférences</p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
