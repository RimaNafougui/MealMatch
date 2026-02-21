// components/onboarding/OnboardingSteps.tsx
"use client";

import React from "react";

interface Step {
  label: string;
  icon: string;
}

interface OnboardingStepsProps {
  steps: Step[];
  currentStep: number;
}

export const OnboardingSteps: React.FC<OnboardingStepsProps> = ({
  steps,
  currentStep,
}) => {
  return (
    <div className="w-full mb-8">
      {/* Step indicators */}
      <div className="flex items-center justify-between relative">
        {/* Connecting line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-divider z-0" />
        <div
          className="absolute top-5 left-0 h-0.5 bg-success z-0 transition-all duration-500"
          style={{
            width: `${(currentStep / (steps.length - 1)) * 100}%`,
          }}
        />

        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;

          return (
            <div
              key={index}
              className="flex flex-col items-center gap-2 z-10"
            >
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-lg
                  transition-all duration-300 border-2
                  ${
                    isCompleted
                      ? "bg-success border-success text-white"
                      : isCurrent
                        ? "bg-white dark:bg-black border-success text-success shadow-lg shadow-success/20"
                        : "bg-white dark:bg-black/40 border-divider text-default-400"
                  }
                `}
              >
                {isCompleted ? "✓" : step.icon}
              </div>
              <span
                className={`text-xs font-medium hidden sm:block transition-colors duration-300 ${
                  isCurrent
                    ? "text-success font-bold"
                    : isCompleted
                      ? "text-default-500"
                      : "text-default-400"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mobile: current step label */}
      <p className="sm:hidden text-center text-xs text-success font-semibold mt-3">
        Étape {currentStep + 1} / {steps.length} — {steps[currentStep].label}
      </p>
    </div>
  );
};
