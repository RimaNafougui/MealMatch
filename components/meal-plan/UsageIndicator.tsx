"use client";

import { Progress, Chip } from "@heroui/react";
import { Sparkles } from "lucide-react";

interface UsageIndicatorProps {
  count: number;
  limit: number;
  isPremium: boolean;
}

export function UsageIndicator({ count, limit, isPremium }: UsageIndicatorProps) {
  if (isPremium) {
    return (
      <Chip
        color="warning"
        variant="flat"
        size="sm"
        startContent={<Sparkles size={12} />}
      >
        Plans illimités
      </Chip>
    );
  }

  const percentage = (count / limit) * 100;
  const color = count >= limit ? "danger" : count >= limit - 1 ? "warning" : "primary";

  return (
    <div className="max-w-xs">
      <div className="flex items-center justify-between text-xs text-foreground/50 mb-1">
        <span>{count}/{limit} meal plans used this month</span>
        {count >= limit && (
          <span className="text-danger font-medium">Limite atteinte</span>
        )}
      </div>
      <Progress size="sm" value={percentage} color={color} />
      {count >= limit - 1 && count < limit && (
        <p className="text-xs text-warning mt-1">
          Plus qu&apos;un plan gratuit ce mois-ci.
        </p>
      )}
    </div>
  );
}
