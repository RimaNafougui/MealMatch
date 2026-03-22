"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { Skeleton } from "@heroui/skeleton";
import {
  BrainCircuit,
  Send,
  User,
  Bot,
  Trash2,
  Plus,
  MessageSquare,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useUserPlan } from "@/hooks/useUserPlan";
import { PlanGate } from "@/components/ui/PlanGate";
import { toast } from "sonner";

interface Message {
  id?: string;
  role: "user" | "assistant";
  content: string;
  created_at?: string;
}

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

const WELCOME_MESSAGE: Message = {
  role: "assistant",
  content:
    "Bonjour ! Je suis votre nutritionniste IA. Je réponds uniquement aux questions sur la nutrition, l'alimentation et l'activité physique. Comment puis-je vous aider aujourd'hui ?",
};

function ChatMessage({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? "bg-primary/10" : "bg-success/10"}`}
      >
        {isUser ? (
          <User size={16} className="text-primary" />
        ) : (
          <Bot size={16} className="text-success" />
        )}
      </div>
      <div
        className={`max-w-[75%] p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${isUser ? "bg-primary/10 text-primary-800 dark:text-primary-200 rounded-tr-sm" : "bg-default-100 dark:bg-default-100/10 rounded-tl-sm"}`}
      >
        {msg.content}
      </div>
    </div>
  );
}

function NutritionistChat() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [creatingSession, setCreatingSession] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, []);

  // Scroll to bottom only when a new message is added (not on initial welcome message)
  useEffect(() => {
    if (messages.length <= 1) return;
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  const loadSessions = async () => {
    try {
      const res = await fetch("/api/nutritionist/sessions");
      if (!res.ok) return;
      const data = await res.json();
      setSessions(data.sessions ?? []);
    } catch {
    } finally {
      setLoadingSessions(false);
    }
  };

  const loadSessionMessages = async (sessionId: string) => {
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/nutritionist/sessions/${sessionId}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      const msgs: Message[] = data.messages ?? [];
      setMessages(msgs.length > 0 ? msgs : [WELCOME_MESSAGE]);
    } catch {
      toast.error("Impossible de charger les messages.");
      setMessages([WELCOME_MESSAGE]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const selectSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    loadSessionMessages(sessionId);
  };

  const createNewSession = async () => {
    setCreatingSession(true);
    try {
      const res = await fetch("/api/nutritionist/sessions", { method: "POST" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const newSession: ChatSession = data.session;
      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(newSession.id);
      setMessages([WELCOME_MESSAGE]);
    } catch {
      toast.error("Impossible de créer une nouvelle conversation.");
    } finally {
      setCreatingSession(false);
    }
  };

  const deleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/nutritionist/sessions/${sessionId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
        setMessages([WELCOME_MESSAGE]);
      }
    } catch {
      toast.error("Impossible de supprimer la conversation.");
    }
  };

  const sendMessage = async () => {
    const msg = input.trim();
    if (!msg || loading) return;

    // If no active session, create one first
    let sessionId = activeSessionId;
    if (!sessionId) {
      setCreatingSession(true);
      try {
        const res = await fetch("/api/nutritionist/sessions", {
          method: "POST",
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        sessionId = data.session.id;
        setSessions((prev) => [data.session, ...prev]);
        setActiveSessionId(sessionId);
      } catch {
        toast.error("Impossible de démarrer la conversation.");
        setCreatingSession(false);
        return;
      }
      setCreatingSession(false);
    }

    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setInput("");
    setLoading(true);

    try {
      const historyToSend = messages
        .filter((m) => m.content !== WELCOME_MESSAGE.content)
        .slice(-10);

      const res = await fetch("/api/nutritionist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msg,
          history: historyToSend,
          session_id: sessionId,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              data.message ?? "Une erreur s'est produite. Veuillez réessayer.",
          },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);

      // Update session title in sidebar if it was just auto-titled
      await loadSessions();
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Une erreur de connexion s'est produite. Veuillez réessayer.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const activeSession = sessions.find((s) => s.id === activeSessionId);

  return (
    <div
      className="flex gap-0 border border-divider/50 rounded-2xl overflow-hidden bg-white/70 dark:bg-black/40"
      style={{ height: "70vh" }}
    >
      {/* Sidebar */}
      <div className="w-56 shrink-0 border-r border-divider/50 flex flex-col bg-default-50/50 dark:bg-default-100/5">
        <div className="p-3 border-b border-divider/50">
          <Button
            size="sm"
            variant="flat"
            color="success"
            className="w-full text-xs font-medium"
            startContent={<Plus size={13} />}
            onPress={createNewSession}
            isLoading={creatingSession}
          >
            Nouvelle conversation
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {loadingSessions ? (
            <div className="flex flex-col gap-1 px-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-9 rounded-lg" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-xs text-default-400 text-center px-3 py-4">
              Aucune conversation
            </p>
          ) : (
            sessions.map((s) => (
              <button
                key={s.id}
                onClick={() => selectSession(s.id)}
                className={`w-full text-left px-3 py-2 mx-0 text-xs rounded-lg flex items-center gap-2 group transition-colors ${
                  activeSessionId === s.id
                    ? "bg-success/10 text-success"
                    : "hover:bg-default-100 dark:hover:bg-default-100/10 text-default-600"
                }`}
              >
                <MessageSquare size={12} className="shrink-0 opacity-60" />
                <span className="flex-1 truncate">{s.title}</span>
                <span
                  onClick={(e) => deleteSession(s.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-danger transition-opacity rounded"
                >
                  <Trash2 size={11} />
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="p-3 border-b border-divider/50 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-sm text-default-500 truncate">
            {activeSession
              ? activeSession.title
              : "Nutritionniste IA — en ligne"}
          </span>
        </div>

        {/* Messages */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 flex flex-col gap-4"
        >
          {loadingMessages ? (
            <div className="flex flex-col gap-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-16 rounded-2xl" />
              ))}
            </div>
          ) : (
            messages.map((msg, i) => <ChatMessage key={i} msg={msg} />)
          )}
          {loading && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-success/10">
                <Bot size={16} className="text-success" />
              </div>
              <div className="flex gap-1 items-center px-4 py-3 bg-default-100 dark:bg-default-100/10 rounded-2xl rounded-tl-sm">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-default-400 animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-default-400 animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-default-400 animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <Divider />

        {/* Input */}
        <div className="p-3 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Posez votre question sur la nutrition ou l'exercice…"
            disabled={loading || loadingMessages}
            className="flex-1 px-3 py-2 text-sm rounded-xl bg-default-100 dark:bg-default-100/10 border border-divider/40 outline-none focus:border-primary/40 transition-colors placeholder:text-default-400"
          />
          <Button
            isIconOnly
            color="success"
            variant="flat"
            onPress={sendMessage}
            isLoading={loading}
            isDisabled={!input.trim() || loading || loadingMessages}
          >
            <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function NutritionistPage() {
  const { data: planData, isLoading } = useUserPlan();
  const userPlan: string = planData?.plan ?? "free";

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <BrainCircuit size={28} className="text-success" />
          Nutritionniste
        </h1>
        <p className="text-default-400 text-sm mt-1">
          Posez vos questions sur la nutrition et l&apos;activité physique —
          conseils personnalisés basés sur votre profil.
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-96 rounded-2xl" />
      ) : (
        <PlanGate requiredPlan="premium" userPlan={userPlan}>
          <NutritionistChat />
        </PlanGate>
      )}

      <Card className="p-4 border border-divider/50 bg-warning/5 border-warning/20">
        <CardBody className="p-0 text-xs text-default-500">
          <strong>Avertissement :</strong> Les conseils fournis par la
          nutritionniste IA sont à titre informatif uniquement et ne remplacent
          pas l&apos;avis d&apos;un professionnel de santé qualifié. Consultez
          un diététicien ou médecin pour des problèmes de santé spécifiques.
        </CardBody>
      </Card>
    </div>
  );
}
