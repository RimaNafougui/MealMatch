"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
  MapPin,
  Store,
  Navigation,
  ExternalLink,
  List,
  LayoutList,
  Loader2,
} from "lucide-react";
import type { ShoppingList, ShoppingListItem } from "@/types";
import type { SavedMealPlan } from "@/types/meal-plan";
import { classifyIngredient } from "@/lib/shopping-list-utils";

// ─── Aisle sort order & emoji lookup (matches lib/shopping-list-utils.ts) ────

const AISLE_SORT_ORDER: Record<string, number> = {
  "Fruits & Légumes": 1,
  "Viandes & Poissons": 2,
  "Produits Laitiers & Œufs": 3,
  "Boulangerie & Pains": 4,
  "Épicerie & Céréales": 5,
  "Conserves & Légumineuses": 6,
  "Huiles, Sauces & Condiments": 7,
  "Épices & Assaisonnements": 8,
  "Produits Surgelés": 9,
  "Boissons": 10,
  "Collations & Noix": 11,
  Autres: 99,
};

const AISLE_EMOJI: Record<string, string> = {
  "Fruits & Légumes": "🥦",
  "Viandes & Poissons": "🥩",
  "Produits Laitiers & Œufs": "🥛",
  "Boulangerie & Pains": "🍞",
  "Épicerie & Céréales": "🌾",
  "Conserves & Légumineuses": "🥫",
  "Huiles, Sauces & Condiments": "🫙",
  "Épices & Assaisonnements": "🌿",
  "Produits Surgelés": "🧊",
  Boissons: "🧃",
  "Collations & Noix": "🥜",
  Autres: "🛒",
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface NearbyStore {
  name: string;
  type: string;
  distance_km: number;
  lat: number;
  lng: number;
  google_maps_url: string;
}

interface AisleGroup {
  aisle: string;
  emoji: string;
  sortOrder: number;
  items: Array<{ item: ShoppingListItem; index: number }>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getAisleInfo(item: ShoppingListItem) {
  if (item.aisle) {
    return {
      aisle: item.aisle,
      emoji: item.emoji ?? AISLE_EMOJI[item.aisle] ?? "🛒",
      sortOrder: AISLE_SORT_ORDER[item.aisle] ?? 99,
    };
  }
  // Fallback: classify on the fly for old lists without aisle data
  const info = classifyIngredient(item.name);
  return { aisle: info.aisle, emoji: info.emoji, sortOrder: info.sortOrder };
}

function groupByAisle(items: ShoppingListItem[]): AisleGroup[] {
  const map = new Map<string, AisleGroup>();

  items.forEach((item, index) => {
    const { aisle, emoji, sortOrder } = getAisleInfo(item);
    if (!map.has(aisle)) {
      map.set(aisle, { aisle, emoji, sortOrder, items: [] });
    }
    map.get(aisle)!.items.push({ item, index });
  });

  return Array.from(map.values()).sort((a, b) => a.sortOrder - b.sortOrder);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

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

function AisleSection({
  group,
  listId,
  onToggle,
}: {
  group: AisleGroup;
  listId: string;
  onToggle: (index: number, checked: boolean) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const uncheckedCount = group.items.filter(({ item }) => !item.checked).length;
  const allDone = uncheckedCount === 0;

  return (
    <div className="border border-divider/40 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 bg-default-50 dark:bg-default-100/5 hover:bg-default-100 dark:hover:bg-default-100/10 transition-colors text-left"
        onClick={() => setCollapsed((c) => !c)}
        aria-expanded={!collapsed}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg leading-none">{group.emoji}</span>
          <span className="font-semibold text-sm">{group.aisle}</span>
          <Chip
            size="sm"
            variant="flat"
            color={allDone ? "success" : "default"}
            className="ml-1 h-5 text-xs"
          >
            {allDone ? "✓" : uncheckedCount}
          </Chip>
        </div>
        <span className="text-default-400 text-xs ml-2">{collapsed ? "▶" : "▼"}</span>
      </button>
      {!collapsed && (
        <div className="px-4 py-2 flex flex-col gap-0 bg-white/50 dark:bg-black/20">
          {group.items.map(({ item, index }) => (
            <ItemRow
              key={index}
              item={item}
              index={index}
              listId={listId}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function EpiceriePage() {
  const searchParams = useSearchParams();
  const mealPlanId = searchParams.get("planId");

  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeList, setActiveList] = useState<ShoppingList | null>(null);
  const [currentMealPlan, setCurrentMealPlan] = useState<SavedMealPlan | null>(null);
  const [generating, setGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<"aisle" | "flat">("aisle");

  // Nearby stores state
  const [stores, setStores] = useState<NearbyStore[]>([]);
  const [storeLoading, setStoreLoading] = useState(false);
  const [storesLoaded, setStoresLoaded] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);
  const [isCAD, setIsCAD] = useState(true);

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

  const fetchCurrentMealPlan = useCallback(async () => {
    try {
      const res = await fetch("/api/meal-plan/current");
      if (!res.ok) return;
      const { plan } = await res.json();
      setCurrentMealPlan(plan ?? null);
    } catch {
      // Non-critical – silently ignore
    }
  }, []);

  useEffect(() => {
    fetchLists();
    fetchCurrentMealPlan();
  }, [fetchLists, fetchCurrentMealPlan]);

  async function handleGenerate(planId: string) {
    setGenerating(true);
    try {
      const res = await fetch("/api/shopping-lists/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mealPlanId: planId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Erreur inconnue");
      }
      const data = await res.json();
      setActiveList(data);
      setLists((prev) => [data, ...prev.filter((l) => l.meal_plan_id !== planId)]);
      toast.success("Liste d'épicerie générée !");
    } catch (err: any) {
      toast.error(err.message ?? "Impossible de générer la liste");
    } finally {
      setGenerating(false);
    }
  }

  function handleGetLocation() {
    if (!navigator.geolocation) {
      toast.error("La géolocalisation n'est pas supportée par votre navigateur");
      return;
    }
    setStoreLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        // Rough bounds for Canada: lat > 41°N, lng < −52°W
        setIsCAD(latitude > 41 && longitude < -52);
        try {
          const res = await fetch(
            `/api/stores/nearby?lat=${latitude}&lng=${longitude}`
          );
          if (!res.ok) throw new Error();
          const { stores: data } = await res.json();
          setStores(data ?? []);
          setStoresLoaded(true);
        } catch {
          toast.error("Impossible de charger les épiceries à proximité");
        } finally {
          setStoreLoading(false);
        }
      },
      () => {
        setLocationDenied(true);
        setStoreLoading(false);
      }
    );
  }

  function handleItemToggle(itemIndex: number, checked: boolean) {
    if (!activeList) return;
    const updatedItems = activeList.items.map((item, i) =>
      i === itemIndex ? { ...item, checked } : item
    );
    const isCompleted = updatedItems.every((i) => i.checked);
    const updated = { ...activeList, items: updatedItems, is_completed: isCompleted };
    setActiveList(updated);
    setLists((prev) => prev.map((l) => (l.id === activeList.id ? updated : l)));
  }

  const checkedCount = activeList?.items.filter((i) => i.checked).length ?? 0;
  const totalCount = activeList?.items.length ?? 0;
  const totalCost = activeList?.total_cost ?? 0;
  const currencySymbol = isCAD ? "$CA" : "$US";

  // Show generate banner when there's a current meal plan with no linked shopping list
  const showGenerateBanner = useMemo(() => {
    if (!currentMealPlan) return false;
    return !lists.some((l) => l.meal_plan_id === currentMealPlan.id);
  }, [currentMealPlan, lists]);

  // Items grouped by aisle for "Par rayon" view
  const aisleGroups = useMemo(() => {
    if (!activeList) return [];
    return groupByAisle(activeList.items);
  }, [activeList]);

  // Flat view split
  const unchecked = activeList?.items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => !item.checked) ?? [];
  const checked = activeList?.items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => item.checked) ?? [];

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Liste d&apos;épicerie</h1>
          <p className="text-default-500 mt-1 text-sm">Gérez votre liste de courses.</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View toggle – only shown when a list is loaded */}
          {activeList && !loading && (
            <div className="flex items-center border border-divider rounded-lg overflow-hidden text-sm">
              <button
                className={`px-3 py-1.5 flex items-center gap-1.5 transition-colors ${
                  viewMode === "aisle"
                    ? "bg-success text-white font-semibold"
                    : "text-default-500 hover:bg-default-100"
                }`}
                onClick={() => setViewMode("aisle")}
              >
                <LayoutList size={13} />
                Par rayon
              </button>
              <button
                className={`px-3 py-1.5 flex items-center gap-1.5 transition-colors ${
                  viewMode === "flat"
                    ? "bg-success text-white font-semibold"
                    : "text-default-500 hover:bg-default-100"
                }`}
                onClick={() => setViewMode("flat")}
              >
                <List size={13} />
                Liste complète
              </button>
            </div>
          )}

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
      </div>

      {/* ── Stats chips ─────────────────────────────────────────────── */}
      {activeList && !loading && (
        <div className="flex flex-wrap gap-2">
          <Chip size="sm" variant="flat" color="default" startContent={<Package size={12} />}>
            {totalCount} article{totalCount > 1 ? "s" : ""}
          </Chip>
          <Chip size="sm" variant="flat" color="success" startContent={<CheckCircle2 size={12} />}>
            {checkedCount} / {totalCount} cochés
          </Chip>
          {totalCost > 0 && (
            <Chip size="sm" variant="flat" color="default" startContent={<DollarSign size={12} />}>
              {Number(totalCost).toFixed(2)} {currencySymbol}
            </Chip>
          )}
          {activeList.is_completed && (
            <Chip size="sm" variant="flat" color="success">
              ✓ Liste complétée
            </Chip>
          )}
        </div>
      )}

      {loading ? (
        <SkeletonList />
      ) : (
        <>
          {/* ── Generate-from-meal-plan banner ─────────────────────── */}
          {showGenerateBanner && (
            <Card className="border border-success/30 bg-success/5">
              <CardBody className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-success/10 flex-shrink-0">
                    <Sparkles size={18} className="text-success" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Plan de repas disponible</p>
                    <p className="text-default-400 text-xs mt-0.5">
                      Générez votre liste de courses depuis votre plan de repas de la semaine.
                    </p>
                  </div>
                </div>
                <Button
                  color="success"
                  variant="flat"
                  size="sm"
                  isLoading={generating}
                  startContent={!generating ? <Sparkles size={14} /> : undefined}
                  onPress={() => currentMealPlan && handleGenerate(currentMealPlan.id)}
                  className="font-semibold flex-shrink-0"
                >
                  Générer depuis mon plan
                </Button>
              </CardBody>
            </Card>
          )}

          {/* ── Empty state ─────────────────────────────────────────── */}
          {!activeList ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
              <Card className="p-8 border border-dashed border-divider bg-content2 max-w-sm w-full">
                <CardBody className="flex flex-col items-center gap-4">
                  <ShoppingCart size={48} className="text-default-300" />
                  <div>
                    <p className="font-semibold text-lg">Aucune liste d&apos;épicerie</p>
                    <p className="text-default-400 text-sm mt-1">
                      Générez un plan de repas pour créer automatiquement votre liste de courses.
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
              {/* ── Multiple lists selector ──────────────────────────── */}
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

              {/* ── Progress bar ─────────────────────────────────────── */}
              {totalCount > 0 && (
                <div>
                  <div className="w-full h-1.5 bg-default-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-success rounded-full transition-all duration-500"
                      style={{ width: `${Math.round((checkedCount / totalCount) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-default-400 mt-1 text-right">
                    {Math.round((checkedCount / totalCount) * 100)}% complété
                  </p>
                </div>
              )}

              {/* ── Shopping list card ───────────────────────────────── */}
              <Card className="border border-divider/50 bg-white/70 dark:bg-black/40">
                <CardHeader className="px-6 pt-5 pb-3 flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-success/10">
                    <ShoppingCart size={18} className="text-success" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">
                      {activeList.is_completed ? "Liste complétée !" : "Liste de courses"}
                    </h2>
                    <p className="text-default-400 text-xs">
                      {checkedCount} / {totalCount} article{totalCount > 1 ? "s" : ""} cochés
                    </p>
                  </div>
                </CardHeader>
                <Divider />
                <CardBody className="px-6 py-4">
                  {totalCount === 0 ? (
                    <div className="flex flex-col items-center py-8 gap-2 text-center">
                      <Package size={32} className="text-default-300" />
                      <p className="text-default-400 text-sm">Cette liste est vide.</p>
                    </div>
                  ) : viewMode === "aisle" ? (
                    /* ─── Aisle view ─── */
                    <div className="flex flex-col gap-3">
                      {aisleGroups.map((group) => (
                        <AisleSection
                          key={group.aisle}
                          group={group}
                          listId={activeList.id}
                          onToggle={handleItemToggle}
                        />
                      ))}
                    </div>
                  ) : (
                    /* ─── Flat view ─── */
                    <>
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

              {/* ── Nearby stores card ───────────────────────────────── */}
              <Card className="border border-divider/50 bg-white/70 dark:bg-black/40">
                <CardHeader className="px-6 pt-5 pb-3 flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <Store size={18} className="text-primary" />
                  </div>
                  <div>
                    <h2 className="font-bold text-base">Épiceries à proximité</h2>
                    <p className="text-default-400 text-xs">
                      Trouvez les épiceries proches de vous
                    </p>
                  </div>
                </CardHeader>
                <Divider />
                <CardBody className="px-6 py-4">
                  {!storesLoaded && !storeLoading && !locationDenied && (
                    <div className="flex flex-col items-center gap-3 py-4 text-center">
                      <Button
                        color="primary"
                        variant="flat"
                        startContent={<Navigation size={16} />}
                        onPress={handleGetLocation}
                        className="font-semibold"
                      >
                        Activer la géolocalisation
                      </Button>
                      <p className="text-default-400 text-xs max-w-xs">
                        Votre position est utilisée uniquement pour trouver les épiceries proches
                        et n&apos;est pas enregistrée.
                      </p>
                    </div>
                  )}

                  {locationDenied && (
                    <p className="text-default-400 text-sm text-center py-4">
                      Activez la géolocalisation dans votre navigateur pour voir les épiceries à
                      proximité.
                    </p>
                  )}

                  {storeLoading && (
                    <div className="flex items-center justify-center gap-2 py-6">
                      <Loader2 size={20} className="animate-spin text-primary" />
                      <p className="text-default-400 text-sm">
                        Recherche d&apos;épiceries&hellip;
                      </p>
                    </div>
                  )}

                  {storesLoaded && !storeLoading && stores.length === 0 && (
                    <p className="text-default-400 text-sm text-center py-4">
                      Aucune épicerie trouvée dans un rayon de 3 km.
                    </p>
                  )}

                  {storesLoaded && !storeLoading && stores.length > 0 && (
                    <div className="flex flex-col gap-1">
                      {stores.map((store, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between gap-3 py-2.5 px-3 rounded-lg hover:bg-default-50 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="p-1.5 rounded-lg bg-primary/10 flex-shrink-0">
                              <Store size={14} className="text-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-sm truncate">{store.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Chip
                                  size="sm"
                                  variant="flat"
                                  color="primary"
                                  className="h-5 text-xs"
                                >
                                  {store.type}
                                </Chip>
                                <span className="text-xs text-default-400 flex items-center gap-0.5">
                                  <MapPin size={10} />
                                  {store.distance_km} km
                                </span>
                              </div>
                            </div>
                          </div>
                          <a
                            href={store.google_maps_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center gap-1 flex-shrink-0"
                          >
                            Maps <ExternalLink size={10} />
                          </a>
                        </div>
                      ))}
                    </div>
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
        </>
      )}
    </div>
  );
}
