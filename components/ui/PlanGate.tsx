"use client";

import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { Lock } from "lucide-react";

interface PlanGateProps {
  requiredPlan: "student" | "premium";
  userPlan: string;
  children: React.ReactNode;
}

const PLAN_LABELS: Record<"student" | "premium", string> = {
  student: "Étudiant",
  premium: "Premium",
};

export function PlanGate({ requiredPlan, userPlan, children }: PlanGateProps) {
  const hasAccess =
    requiredPlan === "student"
      ? userPlan === "student" || userPlan === "premium"
      : userPlan === "premium";

  if (hasAccess) return <>{children}</>;

  return (
    <div className="relative">
      {/* Blurred content */}
      <div className="pointer-events-none select-none blur-sm opacity-40">{children}</div>

      {/* Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/60 backdrop-blur-sm rounded-xl z-10 p-6 text-center">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-default-100">
          <Lock size={22} className="text-default-500" />
        </div>
        <div>
          <p className="font-semibold text-sm">
            Disponible avec le plan{" "}
            <span className="text-primary">{PLAN_LABELS[requiredPlan]}</span>
          </p>
          <p className="text-xs text-default-400 mt-1">
            Passez à un plan supérieur pour débloquer cette fonctionnalité.
          </p>
        </div>
        <Button
          as={Link}
          href="/pricing"
          size="sm"
          color="primary"
          variant="flat"
          className="font-semibold"
        >
          Voir les plans
        </Button>
      </div>
    </div>
  );
}
