"use client";

import { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Textarea } from "@heroui/input";
import { Spinner } from "@heroui/spinner";
import { Sparkles } from "lucide-react";

interface QuickAskModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMessage?: string;
}

export function QuickAskModal({ isOpen, onClose, initialMessage = "" }: QuickAskModalProps) {
  const [message, setMessage] = useState(initialMessage);
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!message.trim()) return;
    setLoading(true);
    setResponse(null);
    try {
      const res = await fetch("/api/nutritionist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history: [] }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResponse(data.message ?? "Une erreur est survenue.");
      } else {
        setResponse(data.reply);
      }
    } catch {
      setResponse("Impossible de contacter le nutritionniste IA.");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setMessage(initialMessage);
    setResponse(null);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <Sparkles size={18} className="text-primary" />
          Demander à l&apos;IA
        </ModalHeader>
        <ModalBody>
          <Textarea
            value={message}
            onValueChange={setMessage}
            placeholder="Posez votre question..."
            minRows={3}
            maxRows={6}
          />
          {loading && (
            <div className="flex items-center gap-2 mt-2 text-default-400">
              <Spinner size="sm" color="primary" />
              <span className="text-sm">Réponse en cours...</span>
            </div>
          )}
          {response && (
            <div className="mt-3 p-4 rounded-xl bg-primary/5 border border-primary/20 text-sm whitespace-pre-wrap leading-relaxed">
              {response}
            </div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="flat" onPress={handleClose}>
            Fermer
          </Button>
          <Button
            color="primary"
            onPress={handleSubmit}
            isLoading={loading}
            isDisabled={!message.trim()}
            startContent={!loading ? <Sparkles size={14} /> : undefined}
          >
            Envoyer
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
