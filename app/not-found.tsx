"use client";

import NextLink from "next/link";
import { Button } from "@heroui/button";
import { Home, Compass, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-8 bg-background">
      {/* Illustration */}
      <div className="relative flex items-center justify-center">
        <div className="absolute w-48 h-48 rounded-full bg-success/8 blur-2xl" />
        <div className="relative text-[9rem] font-extrabold text-default-100 dark:text-default-50/10 select-none leading-none">
          404
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-3xl bg-success/10 flex items-center justify-center shadow-lg">
            <Compass size={38} className="text-success" />
          </div>
        </div>
      </div>

      {/* Text */}
      <div className="text-center max-w-sm">
        <h1 className="text-2xl font-extrabold tracking-tight mb-2">
          Page introuvable
        </h1>
        <p className="text-default-500 text-sm leading-relaxed">
          La page que vous cherchez n&apos;existe pas ou a été déplacée. Pas de
          panique, votre prochain repas vous attend !
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          as={NextLink}
          href="/dashboard"
          color="success"
          variant="solid"
          startContent={<Home size={16} />}
          className="font-semibold text-white"
        >
          Retour au tableau de bord
        </Button>
        <Button
          as={NextLink}
          href="/explore"
          variant="flat"
          startContent={<Compass size={16} />}
          className="font-semibold"
        >
          Explorer les recettes
        </Button>
      </div>

      {/* Back link */}
      <button
        onClick={() => history.back()}
        className="flex items-center gap-1.5 text-sm text-default-400 hover:text-default-600 transition-colors mt-2"
      >
        <ArrowLeft size={14} />
        Retour à la page précédente
      </button>
    </div>
  );
}
