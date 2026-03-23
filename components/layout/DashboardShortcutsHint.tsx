"use client";

import { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";
import { Kbd } from "@heroui/kbd";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

const SHORTCUTS = [
  { key: "G", description: "Générer un plan de repas" },
  { key: "R", description: "Mes recettes" },
  { key: "F", description: "Mes favoris" },
  { key: "E", description: "Liste d'épicerie" },
  { key: "?", description: "Afficher les raccourcis clavier" },
];

export function DashboardShortcutsHint() {
  const [open, setOpen] = useState(false);

  useKeyboardShortcuts({
    "?": () => setOpen((v) => !v),
  });

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 w-8 h-8 rounded-full bg-default-100 border border-divider text-default-500 hover:bg-default-200 transition-colors text-sm font-bold flex items-center justify-center shadow-sm"
        aria-label="Raccourcis clavier"
      >
        ?
      </button>

      <Modal isOpen={open} onClose={() => setOpen(false)} size="sm">
        <ModalContent>
          <ModalHeader className="text-base font-bold">Raccourcis clavier</ModalHeader>
          <ModalBody className="pb-6">
            <div className="flex flex-col gap-3">
              {SHORTCUTS.map(({ key, description }) => (
                <div key={key} className="flex items-center justify-between gap-4">
                  <span className="text-sm text-default-600">{description}</span>
                  <Kbd className="text-xs">{key}</Kbd>
                </div>
              ))}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
