"use client";

import { Input } from "@heroui/react";
import { Search } from "lucide-react";

export default function ExplorePage() {
  return (
    <div className="container mx-auto max-w-7xl px-6 py-8 h-full overflow-y-auto">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold">Explorer</h1>
          <p className="text-default-500 mt-1">
            Recherchez des recettes et des plans de repas à ajouter à votre tableau de bord.
          </p>
        </div>

        <Input
          placeholder="Rechercher des recettes, meal plans..."
          size="lg"
          startContent={<Search size={18} className="text-default-400" />}
          variant="bordered"
          classNames={{ inputWrapper: "bg-default-50" }}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <p className="text-default-400 col-span-full text-center py-12">
            Commencez à chercher pour découvrir des recettes et meal plans.
          </p>
        </div>
      </div>
    </div>
  );
}
