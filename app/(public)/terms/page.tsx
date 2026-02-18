import { Card, CardBody } from "@heroui/card";

export default function TermsPage() {
  return (
    <div className="relative w-full max-w-4xl mx-auto py-12 px-6">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50" />

      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Conditions d'Utilisation
        </h1>
        <p className="text-default-500">
          Veuillez lire attentivement ces conditions avant d'utiliser notre
          service.
        </p>
      </div>

      <Card className="backdrop-blur-xl bg-white/70 dark:bg-black/40 p-4">
        <CardBody className="gap-8">
          <section>
            <h2 className="text-2xl font-bold mb-3 text-primary">
              1. Acceptation des conditions
            </h2>
            <p className="text-default-500 leading-relaxed">
              En accédant à MealMatch, vous acceptez d'être lié par ces
              conditions d'utilisation. Si vous n'acceptez pas ces termes,
              veuillez ne pas utiliser nos services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-primary">
              2. Utilisation du service
            </h2>
            <p className="text-default-500 leading-relaxed">
              MealMatch est destiné à un usage personnel pour la planification
              de repas. Vous vous engagez à ne pas utiliser le service à des
              fins illégales ou interdites.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-primary">
              3. Comptes utilisateurs
            </h2>
            <p className="text-default-500 leading-relaxed">
              Vous êtes responsable de la confidentialité de votre mot de passe
              et de toutes les activités qui se produisent sous votre compte.
              MealMatch se réserve le droit de suspendre ou de résilier des
              comptes en cas de violation de ces conditions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-primary">
              4. Propriété intellectuelle
            </h2>
            <p className="text-default-500 leading-relaxed">
              Tout le contenu présent sur MealMatch (textes, graphismes, logos,
              code) est la propriété de MealMatch ou de ses concédants de
              licence et est protégé par les lois sur la propriété
              intellectuelle.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-primary">
              5. Modification des conditions
            </h2>
            <p className="text-default-500 leading-relaxed">
              Nous nous réservons le droit de modifier ces conditions à tout
              moment. Les modifications prendront effet dès leur publication sur
              cette page.
            </p>
          </section>
        </CardBody>
      </Card>
    </div>
  );
}
