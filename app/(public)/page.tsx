import { redirect } from "next/navigation";
import { Link } from "@heroui/link";
import { Button } from "@heroui/button";
import { Image } from "@heroui/image";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import { Badge } from "@heroui/badge";
import { Bot, WalletCards, ShoppingCart, Heart } from "lucide-react";

import { auth } from "@/auth";

// Page d'accueil

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  const features = [
    {
      title: "AI Meal Plans",
      description: "Des plans de repas intelligents générés par l'IA",
      icon: <Bot className="w-6 h-6 text-primary" />,
    },
    {
      title: "Budget-Friendly",
      description:
        "Mange mieux sans te ruiner grâce à des recettes économiques",
      icon: <WalletCards className="w-6 h-6 text-danger" />,
    },
    {
      title: "Shopping Lists",
      description:
        "Des listes d'épicerie automatiques et organisées pour gagner du temps",
      icon: <ShoppingCart className="w-6 h-6 text-warning" />,
    },
    {
      title: "Nutrition Tracking",
      description: "Suis tes calories et nutriments facilement",
      icon: <Heart className="w-6 h-6 text-secondary" />,
    },
  ];

  return (
    <div className="flex flex-col gap-8 md:gap-16 py-8 md:py-10">
      <section className="flex flex-col-reverse md:flex-row items-center justify-between gap-8 max-w-7xl mx-auto px-6">
        <div className="flex flex-col gap-6 text-center md:text-left md:w-1/2">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Bienvenue, étudiant!
            </h1>
            <p className="text-lg text-default-500">
              Faisons des repas faciles et adaptés à vos besoins
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
              Commencer
            </Button>
            <Button as={Link} href="#" size="lg" variant="bordered">
              En savoir plus
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

      {/* Features */}
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

      {/* Comment ça marche */}
      <section className="max-w-7xl mx-auto px-6 w-full py-12">
        <div className="flex flex-col gap-8">
          <h2 className="text-3xl font-bold text-center">Comment ça marche?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Entrez vos préférences", step: "1" },
              { title: "Obtenez votre plan de repas", step: "2" },
              { title: "Achetez et cuisinez", step: "3" },
            ].map((item, index) => (
              <Card key={index} className="p-6 relative overflow-visible">
                <div className="absolute -top-4 -left-4">
                  <Badge
                    content={item.step}
                    color="primary"
                    size="lg"
                    shape="circle"
                    className="text-xl font-bold w-10 h-10 flex items-center justify-center p-0"
                  >
                    <div />
                  </Badge>
                </div>
                <CardHeader className="flex-col !items-start gap-2">
                  <p className="text-tiny text-primary uppercase font-bold">
                    Étape {item.step}
                  </p>
                  <h4 className="font-bold text-large">{item.title}</h4>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 w-full pb-12">
        <Card className="bg-gradient-to-r from-primary to-secondary p-12 text-center border-none">
          <CardBody className="gap-6 items-center justify-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Prêt à mieux manger ?
            </h2>
            <p className="text-white/90 text-lg max-w-2xl">
              Rejoignez MealMatch aujourd'hui et transformez votre façon de
              cuisiner.
            </p>
            <Button
              as={Link}
              href="/signup"
              size="lg"
              className="bg-white text-primary font-bold"
            >
              S'inscrire
            </Button>
          </CardBody>
        </Card>
      </section>
    </div>
  );
}
