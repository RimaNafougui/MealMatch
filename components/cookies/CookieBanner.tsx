"use client";

import { useState, useEffect } from "react";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { Cookie } from "lucide-react";

type ConsentValue = "all" | "essential" | null;

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent") as ConsentValue;
    if (!consent) setVisible(true);
  }, []);

  function handleAcceptAll() {
    localStorage.setItem("cookie_consent", "all");
    setVisible(false);
  }

  function handleEssentialOnly() {
    localStorage.setItem("cookie_consent", "essential");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6">
      <Card className="max-w-2xl mx-auto border border-divider/50 bg-white/95 dark:bg-black/90 backdrop-blur-xl shadow-2xl">
        <CardBody className="flex flex-col sm:flex-row items-start sm:items-center gap-4 px-5 py-4">
          {/* Icon */}
          <div className="p-2.5 rounded-xl bg-primary/10 flex-shrink-0">
            <Cookie size={22} className="text-primary" />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">
              Nous utilisons des témoins (cookies) 🍪
            </p>
            <p className="text-default-500 text-xs mt-0.5 leading-relaxed">
              Certains sont essentiels au fonctionnement du site, d&apos;autres
              améliorent votre expérience. Consultez notre{" "}
              <Link href="/cookie" size="sm" className="text-xs underline">
                politique de témoins
              </Link>
              .
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
            <Button
              size="sm"
              variant="flat"
              color="default"
              onPress={handleEssentialOnly}
              className="flex-1 sm:flex-none text-xs font-medium"
            >
              Essentiels uniquement
            </Button>
            <Button
              size="sm"
              color="primary"
              onPress={handleAcceptAll}
              className="flex-1 sm:flex-none text-xs font-semibold"
            >
              Tout accepter
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
