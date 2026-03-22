"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { Sparkles, Lock, ChefHat } from "lucide-react";

interface MealPlanPaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  count: number;
  limit: number;
}

export function MealPlanPaywallModal({
  isOpen,
  onClose,
  count,
  limit,
}: MealPlanPaywallModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" placement="center">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 pb-0">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mx-auto mb-2">
            <Lock size={26} className="text-primary" />
          </div>
          <p className="text-center text-lg font-bold">Limite mensuelle atteinte</p>
        </ModalHeader>
        <ModalBody className="text-center text-sm text-default-500 pb-0">
          <p>
            Vous avez utilisé <strong className="text-foreground">{count}/{limit} meal plans</strong> gratuits ce mois-ci.
          </p>
          <p className="mt-1">
            Le compteur se remet à zéro le 1er du mois, ou passez à un plan payant pour des générations illimitées.
          </p>

          <div className="mt-4 rounded-xl border border-divider bg-default-50 dark:bg-default-100/10 p-4 text-left flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-foreground/70 uppercase tracking-wide">
              <Sparkles size={13} className="text-primary" />
              Plans payants
            </div>
            <div className="flex items-center gap-2 text-sm">
              <ChefHat size={14} className="text-success shrink-0" />
              <span><strong>Étudiant</strong> — plans illimités + PDF export</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Sparkles size={14} className="text-warning shrink-0" />
              <span><strong>Premium</strong> — tout inclus + nutritionniste IA</span>
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="flex flex-col gap-2 pt-4">
          <Button
            as={Link}
            href="/pricing"
            color="primary"
            className="w-full font-semibold"
          >
            Voir les plans
          </Button>
          <Button variant="light" onPress={onClose} className="w-full">
            Plus tard
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
