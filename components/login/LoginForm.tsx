"use client";
import React, { Suspense, useState } from "react";
import { Form, Input, Button, Link, Divider } from "@heroui/react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, MailCheck, MailWarning, CheckCircle2, XCircle } from "lucide-react";

import {
  SignInButtonGithub,
  SignInButtonGoogle,
} from "@/components/login/button";

function LoginFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // ?verify=true      → just signed up, email confirmation pending
  // ?verified=true    → clicked email link, email now confirmed
  // ?verified=error   → something went wrong during callback
  const needsVerification = searchParams?.get("verify") === "true";
  const justVerified = searchParams?.get("verified") === "true";
  const verifyError = searchParams?.get("verified") === "error";

  const [error, setError] = useState<string>("");
  const [unverified, setUnverified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setUnverified(false);
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      // Step 1: pre-flight check to detect unverified email before NextAuth.
      // NextAuth beta.30 wraps thrown errors in CallbackRouteError, losing the
      // custom error code — so we check Supabase directly first.
      const check = await fetch("/api/auth/check-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const { status } = await check.json();

      if (status === "email_not_confirmed") {
        setUnverified(true);
        setIsLoading(false);
        return;
      }

      if (status === "invalid_credentials") {
        setError("Adresse e-mail ou mot de passe invalide.");
        setIsLoading(false);
        return;
      }

      // Step 2: credentials are valid → let NextAuth create the session
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Adresse e-mail ou mot de passe invalide.");
        setIsLoading(false);
      } else {
        router.push("/onboarding");
        router.refresh();
      }
    } catch (err) {
      setError("Une erreur inattendue est survenue.");
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
          Saisissez vos informations pour accéder à votre compte
        </p>
      </div>

      {/* ── Post-signup: email confirmation pending ── */}
      {needsVerification && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col gap-2 p-4 rounded-2xl bg-success-50 border border-success-200 dark:bg-success/10 dark:border-success/30"
        >
          <div className="flex items-center gap-2 text-success-700 dark:text-success font-semibold text-sm">
            <MailCheck size={18} />
            Compte créé — vérifiez votre courriel !
          </div>
          <p className="text-success-600 dark:text-success/80 text-xs leading-relaxed">
            Un lien de confirmation a été envoyé à votre adresse courriel.
            Cliquez sur ce lien pour activer votre compte, puis revenez vous
            connecter.
          </p>
        </motion.div>
      )}

      {/* ── Email successfully verified via link ── */}
      {justVerified && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col gap-2 p-4 rounded-2xl bg-success-50 border border-success-200 dark:bg-success/10 dark:border-success/30"
        >
          <div className="flex items-center gap-2 text-success-700 dark:text-success font-semibold text-sm">
            <CheckCircle2 size={18} />
            Courriel vérifié avec succès !
          </div>
          <p className="text-success-600 dark:text-success/80 text-xs leading-relaxed">
            Votre adresse courriel a été confirmée. Vous pouvez maintenant vous
            connecter.
          </p>
        </motion.div>
      )}

      {/* ── Verification link error ── */}
      {verifyError && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col gap-2 p-4 rounded-2xl bg-danger-50 border border-danger-200 dark:bg-danger/10 dark:border-danger/30"
        >
          <div className="flex items-center gap-2 text-danger-700 dark:text-danger font-semibold text-sm">
            <XCircle size={18} />
            Lien de vérification invalide
          </div>
          <p className="text-danger-600 dark:text-danger/80 text-xs leading-relaxed">
            Ce lien a expiré ou est invalide. Réessayez de vous inscrire pour
            recevoir un nouveau lien.
          </p>
        </motion.div>
      )}

      {/* ── Login attempt while email unverified ── */}
      {unverified && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col gap-2 p-4 rounded-2xl bg-warning-50 border border-warning-200 dark:bg-warning/10 dark:border-warning/30"
        >
          <div className="flex items-center gap-2 text-warning-700 dark:text-warning font-semibold text-sm">
            <MailWarning size={18} />
            Courriel non vérifié
          </div>
          <p className="text-warning-600 dark:text-warning/80 text-xs leading-relaxed">
            Votre adresse courriel n&apos;a pas encore été confirmée. Consultez
            votre boîte de réception (et vos indésirables) pour trouver le lien
            d&apos;activation envoyé lors de votre inscription.
          </p>
        </motion.div>
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

        {/* Generic credential error (wrong password etc.) */}
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
            Ou
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