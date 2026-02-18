import { Card, CardBody } from "@heroui/card";
import { Link } from "@heroui/link";

export default function RefundPage() {
  return (
    <div className="relative w-full max-w-4xl mx-auto py-12 px-6">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50" />

      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Politique de Remboursement
        </h1>
        <p className="text-default-500">
          Notre engagement envers votre satisfaction.
        </p>
      </div>

      <Card className="backdrop-blur-xl bg-white/70 dark:bg-black/40 p-4">
        <CardBody className="gap-8">
          <section>
            <h2 className="text-2xl font-bold mb-3 text-primary">
              1. Satisfaction garantie
            </h2>
            <p className="text-default-500 leading-relaxed">
              Nous voulons que vous soyez pleinement satisfait de MealMatch. Si
              vous n'êtes pas satisfait de notre service Premium, veuillez lire
              les conditions ci-dessous.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-primary">
              2. Période de remboursement
            </h2>
            <p className="text-default-500 leading-relaxed">
              Nous offrons un remboursement complet pour tout abonnement annulé
              dans les <strong className="text-foreground">14 jours</strong>{" "}
              suivant l'achat initial. Passé ce délai, aucun remboursement ne
              sera accordé pour la période de facturation en cours.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-primary">
              3. Comment demander un remboursement
            </h2>
            <p className="text-default-500 leading-relaxed">
              Pour demander un remboursement, veuillez contacter notre équipe de
              support à{" "}
              <Link
                href="mailto:nafouguirima@gmail.com"
                className="text-primary"
              >
                nafouguirima@gmail.com
              </Link>{" "}
              avec votre numéro de commande et la raison de votre demande. Nous
              traiterons votre demande sous 5 à 10 jours ouvrables.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-3 text-primary">
              4. Annulation d'abonnement
            </h2>
            <p className="text-default-500 leading-relaxed">
              Vous pouvez annuler votre abonnement à tout moment depuis votre
              tableau de bord. L'accès aux fonctionnalités Premium restera actif
              jusqu'à la fin de la période payée.
            </p>
          </section>
        </CardBody>
      </Card>
    </div>
  );
}
