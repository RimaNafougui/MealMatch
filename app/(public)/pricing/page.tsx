import type { Metadata } from "next";
import PricingClient from "./PricingClient";

export const metadata: Metadata = {
  title: "Tarification — MealMatch",
  description:
    "Découvrez nos plans Gratuit, Étudiant et Premium. Générez des plans de repas IA, accédez à 120+ recettes et gérez votre épicerie pour moins de 3 $/mois.",
};

export default function PricingPage() {
  return <PricingClient />;
}
