"use client";
import React, { useState, useEffect, useCallback, Suspense } from "react";
import { Form, Input, Button } from "@heroui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  AtSymbolIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { debounce } from "lodash";
import { useSession } from "next-auth/react";

function CompleteSignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const [username, setUsername] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null,
  );
  const [usernameError, setUsernameError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const provider = searchParams?.get("provider");
  const email = session?.user?.email;
  const name = session?.user?.name;

  const validateUsername = (value: string): string | null => {
    if (!value) return "Le nom d'utilisateur est requis";
    if (value.length < 3) return "Doit comporter au moins 3 caractères";
    if (value.length > 30) return "Doit contenir moins de 30 caractères";
    if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
      return "Uniquement des lettres, des chiffres, des tirets et des underscores";
    }
    if (/^[-_]|[-_]$/.test(value)) {
      return "Ne peut pas commencer ni se terminer par un tiret ou un underscore";
    }
    return null;
  };

  const checkUsernameAvailability = useCallback(
    debounce(async (value: string) => {
      const validationError = validateUsername(value);
      if (validationError) {
        setUsernameError(validationError);
        setUsernameAvailable(null);
        setIsCheckingUsername(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/users/check-username?username=${encodeURIComponent(value)}`,
        );
        const data = await response.json();

        if (response.ok) {
          setUsernameAvailable(data.available);
          setUsernameError(data.available ? "" : "Nom d'utilisateur déjà pris");
        } else {
          setUsernameError(data.error || "Échec de la vérification");
          setUsernameAvailable(null);
        }
      } catch (err) {
        setUsernameError("Impossible de vérifier le nom d'utilisateur");
        setUsernameAvailable(null);
      } finally {
        setIsCheckingUsername(false);
      }
    }, 500),
    [],
  );

  useEffect(() => {
    if (username) {
      setIsCheckingUsername(true);
      setUsernameError("");
      setUsernameAvailable(null);
      checkUsernameAvailability(username);
    } else {
      setUsernameAvailable(null);
      setUsernameError("");
    }
  }, [username, checkUsernameAvailability]);

  const getUsernameEndContent = () => {
    if (isCheckingUsername) {
      return <Loader2 size={18} className="animate-spin text-default-400" />;
    }
    if (usernameAvailable === true) {
      return <CheckCircleIcon className="w-5 h-5 text-success" />;
    }
    if (usernameAvailable === false || usernameError) {
      return <XCircleIcon className="w-5 h-5 text-danger" />;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!usernameAvailable) {
      setError("Veuillez choisir un nom d'utilisateur disponible");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/complete-oauth-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.toLowerCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Une erreur est survenue");
        setIsLoading(false);
        return;
      }

      toast.success("Profil complété!");
      router.push("/");
      router.refresh();
    } catch (err) {
      setError("Une erreur inattendue est survenue");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tighter uppercase italic">
            Complétez votre profil
          </h2>
          <p className="text-default-500 text-sm tracking-wide">
            Vous êtes connecté avec {provider}. Choisissez un nom d'utilisateur
            pour continuer.
          </p>
        </div>

        <Form
          className="flex flex-col gap-4"
          onSubmit={handleSubmit}
          validationBehavior="native"
        >
          <Input
            isDisabled
            label="Courriel"
            value={email || ""}
            variant="bordered"
            labelPlacement="outside"
          />

          <Input
            isDisabled
            label="Nom"
            value={name || ""}
            variant="bordered"
            labelPlacement="outside"
          />

          <Input
            isRequired
            label="Surnom"
            placeholder="Surnom"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            variant="bordered"
            labelPlacement="outside"
            startContent={<AtSymbolIcon className="w-5 h-5 text-default-400" />}
            endContent={getUsernameEndContent()}
            description="3-30 caractères. Lettres, chiffres, tirets et traits de soulignement uniquement."
            errorMessage={usernameError}
            isInvalid={!!usernameError || usernameAvailable === false}
            classNames={{ inputWrapper: "h-12" }}
          />

          {error && (
            <p className="text-danger text-xs text-center font-medium">
              {error}
            </p>
          )}

          <Button
            className="w-full h-12 font-bold text-md mt-2"
            color="primary"
            isLoading={isLoading}
            type="submit"
            isDisabled={!usernameAvailable || isCheckingUsername}
          >
            Terminer l'inscription
          </Button>
        </Form>
      </motion.div>
    </div>
  );
}

export default function CompleteSignupPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center">
          Chargement...
        </div>
      }
    >
      <CompleteSignupContent />
    </Suspense>
  );
}
