"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Form, Input, Button, Link, Divider } from "@heroui/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  AtSymbolIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { User, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { debounce } from "lodash";

import {
  SignInButtonGithub,
  SignInButtonGoogle,
} from "@/components/login/button";

export default function SignUpForm() {
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [username, setUsername] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null,
  );
  const [usernameError, setUsernameError] = useState<string>("");
  const router = useRouter();

  const toggleVisibility = () => setIsVisible(!isVisible);

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
          setUsernameError(
            data.error || "Échec de la vérification du nom d'utilisateur",
          );
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

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          username: username.toLowerCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Une erreur est survenue");
        setIsLoading(false);
        return;
      }

      router.push("/login?signup=success");
      toast.success("Inscription réussie!");
    } catch (err) {
      setError("Une erreur inattendue est survenue");
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
          Inscription
        </h2>
        <p className="text-default-500 text-sm tracking-wide">
          Commencez à planifier vos repas dès aujourd'hui.
        </p>
      </div>

      <Form
        className="flex flex-col gap-4"
        onSubmit={handleSubmit}
        validationBehavior="native"
      >
        <Input
          isRequired
          label="Nom Complet"
          name="name"
          placeholder="Nom"
          type="text"
          variant="bordered"
          labelPlacement="outside"
          startContent={<User size={18} className="text-default-400" />}
          classNames={{ inputWrapper: "h-12" }}
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

        <Input
          isRequired
          label="Courriel"
          name="email"
          placeholder="Courriel"
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
          minLength={6}
          variant="bordered"
          labelPlacement="outside"
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
          classNames={{ inputWrapper: "h-12" }}
        />

        <Input
          isRequired
          label="Confirmer le mot de passe"
          name="confirmPassword"
          placeholder="••••••••"
          variant="bordered"
          labelPlacement="outside"
          startContent={<Lock size={18} className="text-default-400" />}
          type={isVisible ? "text" : "password"}
          classNames={{ inputWrapper: "h-12" }}
        />
        <div className="text-center font-light">
          En vous inscrivant, vous acceptez nos{" "}
          <Link className="font-bold" href="/terms">
            Conditions d'utilisation
          </Link>
          ,{" "}
          <Link className="font-bold" href="/privacy">
            Politique de confidentialité
          </Link>{" "}
          et notre{" "}
          <Link className="font-bold" href="#">
            Politique relative aux cookies
          </Link>
          .
        </div>

        {error && (
          <p className="text-danger text-xs text-center font-medium">{error}</p>
        )}

        <Button
          className="w-full h-12 font-bold text-md mt-2 shadow-lg shadow-primary/20"
          color="primary"
          isLoading={isLoading}
          type="submit"
          isDisabled={!usernameAvailable || isCheckingUsername}
        >
          Créer un compte
        </Button>

        <div className="flex items-center w-full gap-4 my-2">
          <Divider className="flex-1" />
          <span className="text-xs text-default-400 uppercase tracking-widest">
            Ou
          </span>
          <Divider className="flex-1" />
        </div>

        <div className="grid w-full grid-cols-2 gap-3">
          <SignInButtonGoogle isSignup={true} />
          <SignInButtonGithub isSignup={true} />
        </div>

        <p className="text-center w-full text-sm text-default-500 pt-4">
          Déjà membre?{" "}
          <Link
            className="text-primary font-bold hover:underline"
            href="/login"
          >
            Connexion
          </Link>
        </p>
      </Form>
    </motion.div>
  );
}
