import { Link } from "@heroui/link";
import { Button } from "@heroui/button";
import { Image } from "@heroui/image";
import { siteConfig } from "@/config/site";


export default function Home() {
  return (
    <section className="flex flex-col-reverse md:flex-row items-center justify-between gap-8 py-8 md:py-10 max-w-7xl mx-auto px-6">
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
  );
}
