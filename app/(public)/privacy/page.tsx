import { Card, CardBody } from "@heroui/card";

export default function PrivacyPage() {
  return (
    <div className="relative w-full max-w-4xl mx-auto py-12 px-6">
      {/* Background effect matching login page */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50" />

      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Politique de Confidentialité
        </h1>
        <p className="text-default-500">
          Dernière mise à jour : {new Date().toLocaleDateString("fr-CA")}
        </p>
      </div>

      <Card className="backdrop-blur-xl bg-white/70 dark:bg-black/40 p-4">
        <CardBody className="gap-8">
          <section>
            <h2 className="text-2xl font-bold mb-3 text-primary">
              1. Introduction
            </h2>
            <p className="text-default-500 leading-relaxed">
              Bienvenue sur MealMatch. Nous nous engageons à protéger vos
              données personnelles et votre vie privée. Cette politique explique
              comment nous collectons, utilisons et partageons vos informations
              lorsque vous utilisez notre application.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-primary">
              2. Données collectées
            </h2>
            <p className="text-default-500 mb-2">
              Nous pouvons collecter les types d'informations suivants :
            </p>
            <ul className="list-disc pl-5 space-y-2 text-default-500">
              <li>
                <strong className="text-foreground">
                  Informations de compte :
                </strong>{" "}
                Nom, adresse courriel, et mot de passe chiffré.
              </li>
              <li>
                <strong className="text-foreground">
                  Préférences alimentaires :
                </strong>{" "}
                Restrictions, allergies et objectifs nutritionnels pour générer
                vos plans de repas.
              </li>
              <li>
                <strong className="text-foreground">
                  Données d'utilisation :
                </strong>{" "}
                Informations sur la façon dont vous interagissez avec nos
                services.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-primary">
              3. Utilisation des données
            </h2>
            <p className="text-default-500 leading-relaxed">
              Vos données sont utilisées principalement pour personnaliser votre
              expérience, générer des listes de courses adaptées et améliorer
              nos algorithmes de recommandation IA.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-primary">
              4. Sécurité
            </h2>
            <p className="text-default-500 leading-relaxed">
              Nous mettons en œuvre des mesures de sécurité de pointe pour
              protéger vos informations contre l'accès non autorisé, la
              modification ou la destruction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-primary">5. Contact</h2>
            <p className="text-default-500">
              Pour toute question concernant cette politique, veuillez nous
              contacter à :{" "}
              <span className="text-foreground font-medium">
                nafouguirima@gmail.com
              </span>
            </p>
          </section>
        </CardBody>
      </Card>
    </div>
  );
}
