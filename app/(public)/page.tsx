import { redirect } from "next/navigation";
import { Link } from "@heroui/link";
import { Button } from "@heroui/button";
import { Image } from "@heroui/image";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import { Badge } from "@heroui/badge";
import { Bot, WalletCards, ShoppingCart, Heart } from "lucide-react";
import { FloatingFood } from "@/components/FloatingFood";
import { FloatingHeroImage } from "@/components/FloatingHeroImage";
import { GradientBlobs } from "@/components/GradientBlobs";
import { ParallaxLayer } from "@/components/ParallaxLayer";
import { motion } from "framer-motion";
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
    <div className="flex flex-col gap-20 relative overflow-hidden">
      <section className="relative min-h-[90vh] overflow-hidden flex items-center">
        <div className="mealmatch-animated-bg" />
        <GradientBlobs />
        <FloatingFood />

        <div className="relative z-10 max-w-7xl mx-auto px-6 flex flex-col-reverse md:flex-row items-center gap-12">
          <div className="flex flex-col gap-6 text-center md:text-left md:w-1/2">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
              Bien manger.
              <br />
              Sans réfléchir.
            </h1>

            <p className="text-lg text-default-500">
              MealMatch génère des repas intelligents, économiques et adaptés à
              ton rythme étudiant.
            </p>

            <div className="flex gap-4 justify-center md:justify-start">
              <Button
                as={Link}
                href="/signup"
                size="lg"
                className="bg-gradient-to-r from-green-400 to-green-500 text-white font-bold shadow-lg hover:opacity-90 transition"
              >
                Commencer
              </Button>
              <Button as={Link} href="#features" variant="bordered" size="lg">
                En savoir plus
              </Button>
            </div>
          </div>

          <div className="md:w-1/2 flex justify-center">
            <ParallaxLayer>
              <FloatingHeroImage />
            </ParallaxLayer>
          </div>
        </div>
      </section>

      <section id="features" className="max-w-7xl mx-auto px-6 w-full relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              isHoverable
              className="p-4 backdrop-blur-xl bg-white/70 dark:bg-black/40"
            >
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

      <section className="max-w-7xl mx-auto px-6 w-full py-12 relative z-10">
        <div className="flex flex-col gap-8">
          <h2 className="text-3xl font-bold text-center">
            Comment ça marche?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Entrez vos préférences", step: "1" },
              { title: "Obtenez votre plan de repas", step: "2" },
              { title: "Achetez et cuisinez", step: "3" },
            ].map((item, index) => (
              <Card
                key={index}
                className="p-6 relative backdrop-blur-xl bg-white/70 dark:bg-black/40"
              >
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

      <section className="max-w-7xl mx-auto px-6 w-full pb-20 relative z-10">
        <Card className="bg-gradient-to-r from-green-400 to-green-500 p-14 text-center border-none">
          <CardBody className="gap-6 items-center justify-center">
            <h2 className="text-4xl font-bold text-white">
              Prêt à mieux manger ?
            </h2>
            <p className="text-white/90 text-lg max-w-2xl">
              Rejoignez MealMatch aujourd'hui et laissez l'IA gérer vos repas.
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