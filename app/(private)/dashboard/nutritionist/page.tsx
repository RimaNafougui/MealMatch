"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Skeleton } from "@heroui/skeleton";
import { BrainCircuit, Send, User, Bot, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useUserPlan } from "@/hooks/useUserPlan";
import { PlanGate } from "@/components/ui/PlanGate";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const WELCOME_MESSAGE: Message = {
  role: "assistant",
  content: "Bonjour ! Je suis votre nutritionniste IA. Je réponds uniquement aux questions sur la nutrition, l'alimentation et l'activité physique. Comment puis-je vous aider aujourd'hui ?",
};

function ChatMessage({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? "bg-primary/10" : "bg-success/10"}`}>
        {isUser ? <User size={16} className="text-primary" /> : <Bot size={16} className="text-success" />}
      </div>
      <div className={`max-w-[75%] p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${isUser ? "bg-primary/10 text-primary-800 dark:text-primary-200 rounded-tr-sm" : "bg-default-100 dark:bg-default-100/10 rounded-tl-sm"}`}>
        {msg.content}
      </div>
    </div>
  );
}

function NutritionistChat({ userId }: { userId: string }) {
  const storageKey = `nutritionist_chat_${userId}`;

  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved) as Message[];
    } catch {}
    return [WELCOME_MESSAGE];
  });

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Persist messages to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch {}
  }, [messages, storageKey]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const clearChat = useCallback(() => {
    const fresh = [WELCOME_MESSAGE];
    setMessages(fresh);
    try { localStorage.removeItem(storageKey); } catch {}
  }, [storageKey]);

  const sendMessage = async () => {
    const msg = input.trim();
    if (!msg || loading) return;

    const updatedMessages: Message[] = [...messages, { role: "user", content: msg }];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/nutritionist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          history: messages.slice(-10), // send last 10 messages for context
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.message ?? "Une erreur s'est produite. Veuillez réessayer." },
        ]);
        return;
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Une erreur de connexion s'est produite. Veuillez réessayer." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border border-divider/50 bg-white/70 dark:bg-black/40 flex flex-col" style={{ height: "65vh" }}>
      <CardHeader className="p-4 pb-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-sm text-default-500">Nutritionniste IA — en ligne</span>
        </div>
        <Button
          size="sm"
          variant="light"
          color="danger"
          startContent={<Trash2 size={13} />}
          onPress={clearChat}
          className="text-xs"
        >
          Nouvelle conversation
        </Button>
      </CardHeader>
      <Divider className="mt-3" />

      {/* Messages */}
      <CardBody className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {messages.map((msg, i) => (
          <ChatMessage key={i} msg={msg} />
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-success/10">
              <Bot size={16} className="text-success" />
            </div>
            <div className="flex gap-1 items-center px-4 py-3 bg-default-100 dark:bg-default-100/10 rounded-2xl rounded-tl-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-default-400 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-default-400 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-default-400 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </CardBody>

      <Divider />

      {/* Input */}
      <div className="p-3 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
          placeholder="Posez votre question sur la nutrition ou l'exercice…"
          disabled={loading}
          className="flex-1 px-3 py-2 text-sm rounded-xl bg-default-100 dark:bg-default-100/10 border border-divider/40 outline-none focus:border-primary/40 transition-colors placeholder:text-default-400"
        />
        <Button
          isIconOnly
          color="success"
          variant="flat"
          onPress={sendMessage}
          isLoading={loading}
          isDisabled={!input.trim() || loading}
        >
          <Send size={16} />
        </Button>
      </div>
    </Card>
  );
}

export default function NutritionistPage() {
  const { data: planData, isLoading } = useUserPlan();
  const { data: session } = useSession();
  const userPlan: string = planData?.plan ?? "free";
  const userId = session?.user?.id ?? "";

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <BrainCircuit size={28} className="text-success" />
          Nutritionniste IA
        </h1>
        <p className="text-default-400 text-sm mt-1">
          Posez vos questions sur la nutrition et l&apos;activité physique — conseils personnalisés basés sur votre profil.
        </p>
      </div>

      {isLoading || !userId ? (
        <Skeleton className="h-96 rounded-2xl" />
      ) : (
        <PlanGate requiredPlan="premium" userPlan={userPlan}>
          <NutritionistChat userId={userId} />
        </PlanGate>
      )}

      <Card className="p-4 border border-divider/50 bg-warning/5 border-warning/20">
        <CardBody className="p-0 text-xs text-default-500">
          <strong>Avertissement :</strong> Les conseils fournis par la nutritionniste IA sont à titre informatif uniquement et ne remplacent pas l&apos;avis d&apos;un professionnel de santé qualifié. Consultez un diététicien ou médecin pour des problèmes de santé spécifiques.
        </CardBody>
      </Card>
    </div>
  );
}
