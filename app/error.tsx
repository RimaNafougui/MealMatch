"use client";

import { useEffect } from "react";
import { Button } from "@heroui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import NextLink from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-8 bg-background">
      {/* Illustration */}
      <div className="relative flex items-center justify-center">
        <div className="absolute w-40 h-40 rounded-full bg-warning/10 blur-2xl" />
        <div className="relative w-24 h-24 rounded-3xl bg-warning/10 flex items-center justify-center shadow-lg">
          <AlertTriangle size={42} className="text-warning" />
        </div>
      </div>

      {/* Text */}
      <div className="text-center max-w-sm">
        <h1 className="text-2xl font-extrabold tracking-tight mb-2">
          Une erreur est survenue
        </h1>
        <p className="text-default-500 text-sm leading-relaxed">
          Quelque chose s&apos;est mal passé. Essayez de recharger la page ou
          revenez à l&apos;accueil.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          color="warning"
          variant="flat"
          startContent={<RefreshCw size={16} />}
          onPress={reset}
          className="font-semibold"
        >
          Réessayer
        </Button>
        <Button
          as={NextLink}
          href="/dashboard"
          variant="flat"
          startContent={<Home size={16} />}
          className="font-semibold"
        >
          Retour au tableau de bord
        </Button>
      </div>
    </div>
  );
}
