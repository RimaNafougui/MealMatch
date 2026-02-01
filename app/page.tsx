import { Link } from "@heroui/link";
import { Button } from "@heroui/button";
import { Image } from "@heroui/image";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import { DollarSign, Heart, Clock, ChefHat } from "lucide-react";


export default function Home() {
  const features = [
    {
      title: "Economique",
      description: "Économisez de l'argent grâce à une planification intelligente des repas et des listes de courses.",
      icon: <DollarSign className="w-6 h-6 text-primary" />,
    },
    {
      title: "Manger sainement",
      description: "Des repas nutritifs au lieu des nouilles instantanées.",
      icon: <Heart className="w-6 h-6 text-danger" />,
    },
    {
      title: "Economiser du temps",
      description: "Préparez une fois, mangez toute la semaine. Parfait pour les horaires chargés.",
      icon: <Clock className="w-6 h-6 text-warning" />,
    },
    {
      title: "Recettes faciles",
      description: "Des recettes simples pour les cuisiniers  .",
      icon: <ChefHat className="w-6 h-6 text-secondary" />,
    },
  ];

  return (
    <div className="flex flex-col gap-16 py-8 md:py-10">
      <section className="flex flex-col-reverse md:flex-row items-center justify-between gap-8 max-w-7xl mx-auto px-6">
        <div className="flex flex-col gap-6 text-center md:text-left md:w-1/2">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Bienvenue, étudiant!
            </h1>
            <p className="text-lg text-default-500">
              Faisons des repas faciles et adapter a vos besoins
            </p>
          </div>

          <div className="flex gap-4 justify-center md:justify-start">
            <Button
              as={Link}
              color="primary"
              href="/signup"
              size="lg"
              variant="solid"
            >
              Get Started
            </Button>
            <Button
              as={Link}
              href="#features"
              size="lg"
              variant="bordered"
            >
              Learn More
            </Button>
          </div>
        </div>

        <div className="flex justify-center md:w-1/2">
          <Image
            isBlurred
            alt="Meal prep containers with healthy food"
            className="object-cover rounded-xl shadow-lg"
            height={400}
            src="/foodPuzzle.png"
            width={600}
          />
        </div>
      </section>

      <section id="features" className="max-w-7xl mx-auto px-6 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} isHoverable className="p-4">
              <CardHeader className="flex gap-3">
                <Avatar
                  isBordered
                  radius="md"
                  color="default"
                  icon={feature.icon}
                  className="bg-default-50"
                />
                <div className="flex flex-col">
                  <p className="text-md font-semibold">{feature.title}</p>
                </div>
              </CardHeader>
              <CardBody>
                <p className="text-default-500">{feature.description}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
