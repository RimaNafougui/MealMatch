"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Skeleton } from "@heroui/skeleton";
import { Users, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useUserPlan } from "@/hooks/useUserPlan";
import { PlanGate } from "@/components/ui/PlanGate";

interface FamilyMember {
  id: string;
  name: string;
  dietary_restrictions: string[];
  allergies: string[];
  created_at: string;
}

function FamilyList() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRestrictions, setNewRestrictions] = useState("");
  const [newAllergies, setNewAllergies] = useState("");

  useEffect(() => {
    fetch("/api/family")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setMembers(data); })
      .catch(() => toast.error("Impossible de charger les membres"))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/family", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          dietary_restrictions: newRestrictions ? newRestrictions.split(",").map((s) => s.trim()).filter(Boolean) : [],
          allergies: newAllergies ? newAllergies.split(",").map((s) => s.trim()).filter(Boolean) : [],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message ?? "Erreur lors de l'ajout");
        return;
      }
      setMembers((prev) => [...prev, data]);
      setNewName("");
      setNewRestrictions("");
      setNewAllergies("");
      setShowForm(false);
      toast.success(`${data.name} ajouté avec succès`);
    } catch {
      toast.error("Une erreur s'est produite");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      const res = await fetch("/api/family", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) { toast.error("Erreur lors de la suppression"); return; }
      setMembers((prev) => prev.filter((m) => m.id !== id));
      toast.success(`${name} retiré`);
    } catch {
      toast.error("Une erreur s'est produite");
    }
  };

  if (loading) return <Skeleton className="h-48 rounded-2xl" />;

  return (
    <div className="flex flex-col gap-4">
      {members.length === 0 ? (
        <Card className="p-6 border border-divider/50 bg-default-50 dark:bg-default-100/10 text-center">
          <CardBody className="p-0 flex flex-col items-center gap-3">
            <Users size={40} className="text-default-300" />
            <p className="text-default-500 text-sm">Aucun membre de la famille ajouté.</p>
            <p className="text-default-400 text-xs">Ajoutez des membres pour personnaliser les plans de repas selon leurs besoins.</p>
          </CardBody>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {members.map((member) => (
            <Card key={member.id} className="border border-divider/50 bg-white/70 dark:bg-black/30">
              <CardBody className="p-4 flex flex-row items-center justify-between gap-3">
                <div className="flex flex-col gap-1.5">
                  <span className="font-semibold text-sm">{member.name}</span>
                  {member.dietary_restrictions.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {member.dietary_restrictions.map((r) => (
                        <Chip key={r} size="sm" variant="flat" color="success" className="text-[10px] h-4">{r}</Chip>
                      ))}
                    </div>
                  )}
                  {member.allergies.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {member.allergies.map((a) => (
                        <Chip key={a} size="sm" variant="flat" color="danger" className="text-[10px] h-4">⚠ {a}</Chip>
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  color="danger"
                  onPress={() => handleDelete(member.id, member.name)}
                >
                  <Trash2 size={14} />
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {members.length < 4 && (
        <>
          {!showForm ? (
            <Button
              variant="flat"
              color="success"
              startContent={<Plus size={16} />}
              onPress={() => setShowForm(true)}
              className="font-semibold w-fit"
            >
              Ajouter un membre
            </Button>
          ) : (
            <Card className="p-4 border border-divider/50 border-dashed">
              <CardHeader className="p-0 pb-3">
                <span className="font-semibold text-sm">Nouveau membre</span>
              </CardHeader>
              <CardBody className="p-0 flex flex-col gap-3">
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Prénom *"
                  className="px-3 py-2 text-sm rounded-xl bg-default-100 dark:bg-default-100/10 border border-divider/40 outline-none focus:border-primary/40"
                />
                <input
                  value={newRestrictions}
                  onChange={(e) => setNewRestrictions(e.target.value)}
                  placeholder="Restrictions alimentaires (séparées par des virgules)"
                  className="px-3 py-2 text-sm rounded-xl bg-default-100 dark:bg-default-100/10 border border-divider/40 outline-none focus:border-primary/40"
                />
                <input
                  value={newAllergies}
                  onChange={(e) => setNewAllergies(e.target.value)}
                  placeholder="Allergies (séparées par des virgules)"
                  className="px-3 py-2 text-sm rounded-xl bg-default-100 dark:bg-default-100/10 border border-divider/40 outline-none focus:border-primary/40"
                />
                <div className="flex gap-2">
                  <Button size="sm" color="success" variant="flat" isLoading={adding} onPress={handleAdd} className="font-semibold">
                    Ajouter
                  </Button>
                  <Button size="sm" variant="light" onPress={() => setShowForm(false)}>
                    Annuler
                  </Button>
                </div>
              </CardBody>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

export default function FamilyPage() {
  const { data: planData, isLoading } = useUserPlan();
  const userPlan: string = planData?.plan ?? "free";

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
          <Users size={28} className="text-primary" />
          Membres de la famille
        </h1>
        <p className="text-default-400 text-sm mt-1">
          Ajoutez des membres de votre famille pour personnaliser les plans de repas selon leurs restrictions et allergies. Maximum 4 membres.
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-48 rounded-2xl" />
      ) : (
        <PlanGate requiredPlan="premium" userPlan={userPlan}>
          <FamilyList />
        </PlanGate>
      )}
    </div>
  );
}
