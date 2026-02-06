"use client";
import React, { Suspense, useState } from "react";
import { Form, Input, Button, Link, Divider } from "@heroui/react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { loginAndCheckOnboarding } from "@/utils/auth";

import {
  SignInButtonGithub,
  SignInButtonGoogle,
} from "@/components/login/button";

function LoginFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const signupSuccess = searchParams?.get("signup") === "success";

  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await loginAndCheckOnboarding(email, password);

      if (!result.success) {
        setError(result.error ?? "Une erreur est survenue"); // <-- fallback si undefined
        setIsLoading(false);
<<<<<<< HEAD
        return;
=======
        if (result.error.includes("EmailNotVerified")) {
          setError(
            "Veuillez consulter votre messagerie électronique pour vérifier votre compte avant de vous connecter.",
          );
        } else {
          setError("Adresse e-mail ou mot de passe invalide.");
        }
      } else {
        router.push("/");
        router.refresh();
>>>>>>> 3c8903c75df4c74413b345be996fd3a49a605cd3
      }

      // Redirection selon l'onboarding
      if (!result.onboardingCompleted) router.push("/onboarding");
      else router.push("/dashboard");

      router.refresh();
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  };


  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md space-y-8"
    >
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-extrabold tracking-tighter uppercase italic">
          Content de vous revoir
        </h2>
        <p className="text-default-500 text-sm tracking-wide">
          Saisissez vos informations pour accéder à votre compte{" "}
        </p>
      </div>

      {signupSuccess && (
        <div className="p-3 text-xs bg-success-50 border border-success-200 text-success-700 rounded-xl text-center">
          MealMatch compte crée! Veuillez vous connecté.
        </div>
      )}

      <Form
        className="flex flex-col gap-4"
        onSubmit={handleSubmit}
        validationBehavior="native"
      >
        <Input
          isRequired
          label="Courriel"
          name="email"
          placeholder="mealmatch@email.com"
          type="email"
          variant="bordered"
          labelPlacement="outside"
          startContent={<Mail size={18} className="text-default-400" />}
          classNames={{ inputWrapper: "h-12" }}
        />
        <Input
          isRequired
          label="Mot de passe"
          name="password"
          placeholder="••••••••"
          variant="bordered"
          labelPlacement="outside"
          classNames={{ inputWrapper: "h-12" }}
          startContent={<Lock size={18} className="text-default-400" />}
          endContent={
            <button
              className="focus:outline-none"
              type="button"
              onClick={toggleVisibility}
            >
              {isVisible ? (
                <EyeOff className="text-default-400" size={18} />
              ) : (
                <Eye className="text-default-400" size={18} />
              )}
            </button>
          }
          type={isVisible ? "text" : "password"}
        />
        <div className="flex justify-end w-full px-1">
          <Link
            href="/forgot-password"
            size="sm"
            className="text-default-500 hover:text-primary transition-colors"
          >
            Mot de passe oublié?
          </Link>
        </div>
        {error && (
          <p className="text-danger text-xs text-center font-medium">{error}</p>
        )}
        <Button
          className="w-full h-12 font-bold text-md mt-2 shadow-lg shadow-primary/20"
          color="primary"
          isLoading={isLoading}
          type="submit"
        >
          Connexion
        </Button>
        <div className="flex items-center w-full gap-4 my-2">
          <Divider className="flex-1" />
          <span className="text-xs text-default-400 uppercase tracking-widest">
            Où
          </span>
          <Divider className="flex-1" />
        </div>
        <div className="grid grid-cols-2 w-full gap-3">
          <SignInButtonGoogle />
          <SignInButtonGithub />
        </div>
        <p className="text-center w-full text-sm text-default-500 pt-4">
          Pas de compte?{" "}
          <Link
            className="text-primary font-bold hover:underline"
            href="/signup"
          >
            Inscription
          </Link>
        </p>
      </Form>
    </motion.div>
  );
}

export const LoginForm = () => (
  <Suspense
    fallback={
      <div className="h-screen flex items-center justify-center">
        Chargement...
      </div>
    }
  >
    <LoginFormContent />
  </Suspense>
);
