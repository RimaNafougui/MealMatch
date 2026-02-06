// components/onboarding/OnboardingSteps.tsx
"use client";

import { Progress } from "@heroui/react";
import React from "react";

interface Step {
    label: string;
}

interface OnboardingStepsProps {
    steps: Step[];
    currentStep: number; // index de l'étape actuelle (0-based)
}

export const OnboardingSteps: React.FC<OnboardingStepsProps> = ({
    steps,
    currentStep,
}) => {
    const progressValue = ((currentStep + 1) / steps.length) * 100;

    return (
        <div className="w-full mb-6">
            <Progress value={progressValue} size="sm" color="primary" />

            <div className="flex justify-between mt-2 text-xs text-default-500 font-medium">
                {steps.map((step, index) => (
                    <span
                        key={index}
                        className={index === currentStep ? "text-primary font-bold" : ""}
                    >
                        {step.label}
                    </span>
                ))}
            </div>
        </div>
    );
};
