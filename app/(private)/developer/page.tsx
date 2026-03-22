"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { Skeleton } from "@heroui/skeleton";
import { Code2, Plus, Trash2, Copy, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useUserPlan } from "@/hooks/useUserPlan";
import { PlanGate } from "@/components/ui/PlanGate";

interface ApiKey {
  id: string;
  label: string | null;
  created_at: string;
  last_used_at: string | null;
}

function KeyManager() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [revealedKey, setRevealedKey] = useState<{ id: string; key: string } | null>(null);

  useEffect(() => {
    fetch("/api/developer/keys")
      .then((r) => r.json())
      .then(setKeys)
      .catch(() => toast.error("Impossible de charger les clés API"))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/developer/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: newLabel.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.message ?? "Erreur lors de la création"); return; }

      const { key, ...keyMeta } = data;
      setKeys((prev) => [keyMeta, ...prev]);
      setRevealedKey({ id: keyMeta.id, key });
      setNewLabel("");
      setShowForm(false);
      toast.success("Clé API créée — copiez-la maintenant, elle ne sera plus visible.");
    } catch {
      toast.error("Une erreur s'est produite");
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      const res = await fetch("/api/developer/keys", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) { toast.error("Erreur lors de la révocation"); return; }
      setKeys((prev) => prev.filter((k) => k.id !== id));
      if (revealedKey?.id === id) setRevealedKey(null);
      toast.success("Clé révoquée");
    } catch {
      toast.error("Une erreur s'est produite");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Clé copiée dans le presse-papier");
  };

  if (loading) return <Skeleton className="h-64 rounded-2xl" />;

  return (
    <div className="flex flex-col gap-4">
      {/* New key revealed */}
      {revealedKey && (
        <Card className="p-4 border border-success/30 bg-success/5">
          <CardHeader className="p-0 pb-2 flex items-center gap-2">
            <AlertTriangle size={16} className="text-warning" />
            <span className="font-semibold text-sm text-warning">Nouvelle clé générée — copiez-la maintenant</span>
          </CardHeader>
          <CardBody className="p-0 flex flex-row items-center gap-2">
            <code className="flex-1 text-xs bg-default-100 dark:bg-default-100/10 px-3 py-2 rounded-xl font-mono break-all select-all">
              {revealedKey.key}
            </code>
            <Button isIconOnly size="sm" variant="flat" color="success" onPress={() => copyToClipboard(revealedKey.key)}>
              <Copy size={14} />
            </Button>
            <Button isIconOnly size="sm" variant="light" onPress={() => setRevealedKey(null)}>
              <EyeOff size={14} />
            </Button>
          </CardBody>
        </Card>
      )}

      {keys.length === 0 ? (
        <Card className="p-6 border border-divider/50 bg-default-50 dark:bg-default-100/10 text-center">
          <CardBody className="p-0 flex flex-col items-center gap-3">
            <Code2 size={40} className="text-default-300" />
            <p className="text-default-500 text-sm">Aucune clé API créée.</p>
          </CardBody>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {keys.map((key) => (
            <Card key={key.id} className="border border-divider/50 bg-white/70 dark:bg-black/30">
              <CardBody className="p-4 flex flex-row items-center justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-sm">{key.label ?? "Clé sans nom"}</span>
                  <span className="text-xs text-default-400">
                    Créée le {new Date(key.created_at).toLocaleDateString("fr-CA")}
                    {key.last_used_at && ` · Utilisée le ${new Date(key.last_used_at).toLocaleDateString("fr-CA")}`}
                  </span>
                  <code className="text-xs text-default-400 font-mono">mm_••••••••••••••••••••••••••••••••</code>
                </div>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  color="danger"
                  onPress={() => handleRevoke(key.id)}
                  title="Révoquer cette clé"
                >
                  <Trash2 size={14} />
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {!showForm ? (
        <Button
          variant="flat"
          color="primary"
          startContent={<Plus size={16} />}
          onPress={() => setShowForm(true)}
          className="font-semibold w-fit"
        >
          Générer une clé API
        </Button>
      ) : (
        <Card className="p-4 border border-divider/50 border-dashed">
          <CardHeader className="p-0 pb-3">
            <span className="font-semibold text-sm">Nouvelle clé API</span>
          </CardHeader>
          <CardBody className="p-0 flex flex-col gap-3">
            <input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Nom de la clé (optionnel)"
              className="px-3 py-2 text-sm rounded-xl bg-default-100 dark:bg-default-100/10 border border-divider/40 outline-none focus:border-primary/40"
            />
            <div className="flex gap-2">
              <Button size="sm" color="primary" variant="flat" isLoading={creating} onPress={handleCreate} className="font-semibold">
                Générer
              </Button>
              <Button size="sm" variant="light" onPress={() => setShowForm(false)}>
                Annuler
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

export default function DeveloperPage() {
  const { data: planData, isLoading } = useUserPlan();
  const userPlan: string = planData?.plan ?? "free";

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Code2 size={28} className="text-primary" />
          Accès développeur
        </h1>
        <p className="text-default-400 text-sm mt-1">
          Gérez vos clés API pour intégrer MealMatch à vos propres applications.
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : (
        <PlanGate requiredPlan="premium" userPlan={userPlan}>
          <KeyManager />
        </PlanGate>
      )}

      <Divider />

      <Card className="p-4 border border-divider/50 bg-default-50 dark:bg-default-100/5">
        <CardBody className="p-0 flex flex-col gap-2">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Code2 size={14} className="text-primary" />
            Documentation API
          </h3>
          <p className="text-xs text-default-500">
            Utilisez votre clé API dans l&apos;en-tête <code className="bg-default-100 px-1 rounded">Authorization: Bearer mm_…</code> pour authentifier vos requêtes.
          </p>
          <Chip size="sm" variant="flat" color="default" className="w-fit text-xs">Documentation à venir</Chip>
        </CardBody>
      </Card>
    </div>
  );
}
