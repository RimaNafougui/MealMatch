"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { Skeleton } from "@heroui/skeleton";
import { Divider } from "@heroui/divider";
import { Checkbox } from "@heroui/checkbox";
import { Link } from "@heroui/link";
import { toast } from "sonner";
import {
  ShoppingCart,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  DollarSign,
  Package,
} from "lucide-react";
import type { ShoppingList, ShoppingListItem } from "@/types";

function SkeletonList() {
  return (
    <Card className="border border-divider/50 bg-white/70 dark:bg-black/40 p-6">
      <div className="flex flex-col gap-4">
        <Skeleton className="h-6 w-48 rounded-lg" />
        <Skeleton className="h-4 w-32 rounded-lg" />
        <Divider />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="w-5 h-5 rounded-full" />
            <Skeleton className="h-4 flex-1 rounded-lg" />
            <Skeleton className="h-4 w-16 rounded-lg" />
          </div>
        ))}
      </div>
    </Card>
  );
}

function ItemRow({
  item,
  index,
  listId,
  onToggle,
}: {
  item: ShoppingListItem;
  index: number;
  listId: string;
  onToggle: (index: number, checked: boolean) => void;
}) {
  const [pending, setPending] = useState(false);

  async function handleToggle(checked: boolean) {
    setPending(true);
    try {
      const res = await fetch(`/api/shopping-lists/${listId}/items`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemIndex: index, checked }),
      });
      if (!res.ok) throw new Error();
      onToggle(index, checked);
    } catch {
      toast.error("Impossible de mettre à jour l'article");
    } finally {
      setPending(false);
    }
  }

  return (
    <div
      className={`flex items-center gap-3 py-2.5 px-1 rounded-lg transition-colors ${
        item.checked ? "opacity-50" : ""
      }`}
    >
      <Checkbox
        isSelected={item.checked}
        onValueChange={handleToggle}
        isDisabled={pending}
        color="success"
        size="sm"
      />
      <span
        className={`flex-1 text-sm font-medium ${
          item.checked ? "line-through text-default-400" : ""
        }`}
      >
        {item.name}
        {item.quantity > 1 && (
          <span className="text-default-400 ml-1">
            × {item.quantity}
            {item.unit ? ` ${item.unit}` : ""}
          </span>
        )}
        {item.quantity === 1 && item.unit && (
          <span className="text-default-400 ml-1">{item.unit}</span>
        )}
      </span>
      {item.price != null && item.price > 0 && (
        <span className="text-xs text-success font-semibold flex-shrink-0">
          {(item.price * item.quantity).toFixed(2)} $
        </span>
      )}
    </div>
  );
}

export default function EpiceriePage() {
  const searchParams = useSearchParams();
  const mealPlanId = searchParams.get("planId");

  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeList, setActiveList] = useState<ShoppingList | null>(null);

  const fetchLists = useCallback(async () => {
    setLoading(true);
    try {
      const url = mealPlanId
        ? `/api/shopping-lists?mealPlanId=${mealPlanId}`
        : "/api/shopping-lists";
      const res = await fetch(url);
      if (!res.ok) throw new Error();

      if (mealPlanId) {
        const data = await res.json();
        setActiveList(data);
        setLists(data ? [data] : []);
      } else {
        const { lists: data } = await res.json();
        setLists(data ?? []);
        setActiveList(data?.[0] ?? null);
      }
    } catch {
      toast.error("Impossible de charger la liste d'épicerie");
    } finally {
      setLoading(false);
    }
  }, [mealPlanId]);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  function handleItemToggle(itemIndex: number, checked: boolean) {
    if (!activeList) return;
    const updatedItems = activeList.items.map((item, i) =>
      i === itemIndex ? { ...item, checked } : item
    );
    const isCompleted = updatedItems.every((i) => i.checked);
    const updated = { ...activeList, items: updatedItems, is_completed: isCompleted };
    setActiveList(updated);
    setLists((prev) =>
      prev.map((l) => (l.id === activeList.id ? updated : l))
    );
  }

  const checkedCount = activeList?.items.filter((i) => i.checked).length ?? 0;
  const totalCount = activeList?.items.length ?? 0;
  const totalCost = activeList?.total_cost ?? 0;

  // Split into unchecked / checked
  const unchecked = activeList?.items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => !item.checked) ?? [];
  const checked = activeList?.items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => item.checked) ?? [];

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Liste d&apos;épicerie</h1>
          <p className="text-default-500 mt-1 text-sm">
            Gérez votre liste de courses.
          </p>
        </div>
        <Button
          size="sm"
          variant="flat"
          startContent={<RefreshCw size={14} />}
          onPress={fetchLists}
          isDisabled={loading}
        >
          Actualiser
        </Button>
      </div>

      {loading ? (
        <SkeletonList />
      ) : !activeList ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <Card className="p-8 border border-dashed border-divider bg-content2 max-w-sm w-full">
            <CardBody className="flex flex-col items-center gap-4">
              <ShoppingCart size={48} className="text-default-300" />
              <div>
                <p className="font-semibold text-lg">
                  Aucune liste d&apos;épicerie
                </p>
                <p className="text-default-400 text-sm mt-1">
                  Générez un plan de repas pour créer automatiquement votre
                  liste de courses.
                </p>
              </div>
              <Button
                as={Link}
                href="/dashboard/meal-plan/generate"
                color="success"
                variant="flat"
                startContent={<Sparkles size={16} />}
                className="font-semibold"
              >
                Générer un plan de repas
              </Button>
            </CardBody>
          </Card>
        </div>
      ) : (
        <>
          {/* Multiple lists selector */}
          {lists.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {lists.map((list, i) => (
                <Button
                  key={list.id}
                  size="sm"
                  variant={activeList.id === list.id ? "solid" : "flat"}
                  color={activeList.id === list.id ? "success" : "default"}
                  onPress={() => setActiveList(list)}
                >
                  Liste {i + 1}
                  {list.is_completed && " ✓"}
                </Button>
              ))}
            </div>
          )}

          {/* Main list card */}
          <Card className="border border-divider/50 bg-white/70 dark:bg-black/40">
            <CardHeader className="px-6 pt-6 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-success/10">
                  <ShoppingCart size={18} className="text-success" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">
                    {activeList.is_completed
                      ? "Liste complétée !"
                      : "Liste de courses"}
                  </h2>
                  <p className="text-default-400 text-xs">
                    {checkedCount} / {totalCount} article
                    {totalCount > 1 ? "s" : ""} cochés
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                {activeList.is_completed && (
                  <Chip color="success" variant="flat" size="sm">
                    <CheckCircle2 size={12} className="mr-1 inline" />
                    Terminée
                  </Chip>
                )}
                {totalCost > 0 && (
                  <Chip
                    color="default"
                    variant="flat"
                    size="sm"
                    startContent={<DollarSign size={12} />}
                  >
                    {Number(totalCost).toFixed(2)} $CA
                  </Chip>
                )}
              </div>
            </CardHeader>

            {/* Progress bar */}
            {totalCount > 0 && (
              <div className="px-6 pb-3">
                <div className="w-full h-1.5 bg-default-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-success rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.round((checkedCount / totalCount) * 100)}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-default-400 mt-1 text-right">
                  {Math.round((checkedCount / totalCount) * 100)}% complété
                </p>
              </div>
            )}

            <Divider />

            <CardBody className="px-6 py-4 flex flex-col gap-0">
              {totalCount === 0 ? (
                <div className="flex flex-col items-center py-8 gap-2 text-center">
                  <Package size={32} className="text-default-300" />
                  <p className="text-default-400 text-sm">
                    Cette liste est vide.
                  </p>
                </div>
              ) : (
                <>
                  {/* Items to buy */}
                  {unchecked.length > 0 && (
                    <div className="flex flex-col gap-0">
                      {unchecked.map(({ item, index }) => (
                        <ItemRow
                          key={index}
                          item={item}
                          index={index}
                          listId={activeList.id}
                          onToggle={handleItemToggle}
                        />
                      ))}
                    </div>
                  )}

                  {/* Already checked */}
                  {checked.length > 0 && (
                    <>
                      <Divider className="my-3" />
                      <p className="text-xs font-semibold text-default-400 uppercase tracking-wider mb-1">
                        Déjà achetés
                      </p>
                      <div className="flex flex-col gap-0">
                        {checked.map(({ item, index }) => (
                          <ItemRow
                            key={index}
                            item={item}
                            index={index}
                            listId={activeList.id}
                            onToggle={handleItemToggle}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </CardBody>
          </Card>

          <Button
            as={Link}
            href="/dashboard/meal-plan/generate"
            variant="flat"
            color="success"
            startContent={<Sparkles size={16} />}
            className="font-semibold w-fit"
          >
            Générer un nouveau plan
          </Button>
        </>
      )}
    </div>
  );
}
