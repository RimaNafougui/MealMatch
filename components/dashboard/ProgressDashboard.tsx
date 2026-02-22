"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { Slider } from "@heroui/slider";
import {
  Scale,
  TrendingDown,
  TrendingUp,
  Flame,
  Beef,
  Wheat,
  Droplets,
  Target,
  ChevronDown,
  ChevronUp,
  Trash2,
} from "lucide-react";
import { kgToLbs } from "@/utils/nutrition";

// ─── Types ────────────────────────────────────────────────────────────────────

interface WeightLog {
  id: string;
  logged_at: string;   // "YYYY-MM-DD"
  weight_kg: number;
  note?: string | null;
}

interface NutritionProfile {
  weight_kg?: number | null;
  weight_unit?: "kg" | "lbs";
  goal_weight_kg?: number | null;
  weight_goal?: "lose" | "maintain" | "gain" | null;
  daily_calorie_target?: number | null;
  macro_protein_pct?: number | null;
  macro_carbs_pct?: number | null;
  macro_fat_pct?: number | null;
}

interface MealPlanMacros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  day: string; // "monday" etc.
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DAY_LABELS: Record<string, string> = {
  monday: "Lun", tuesday: "Mar", wednesday: "Mer",
  thursday: "Jeu", friday: "Ven", saturday: "Sam", sunday: "Dim",
};

function formatDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("fr-CA", { month: "short", day: "numeric" });
}

function displayWeight(kg: number, unit: "kg" | "lbs") {
  return unit === "lbs"
    ? `${kgToLbs(kg).toFixed(1)} lbs`
    : `${kg.toFixed(1)} kg`;
}

// ─── Weight Chart ─────────────────────────────────────────────────────────────

const MARGIN = { top: 14, right: 14, bottom: 30, left: 46 };
const CHART_HEIGHT = 170;

function WeightChart({
  logs,
  color = "#17c964",
  unit,
  goalKg,
}: {
  logs: WeightLog[];
  color?: string;
  unit: "kg" | "lbs";
  goalKg?: number | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(320);
  const [tooltip, setTooltip] = useState<{
    x: number; y: number; val: string; date: string;
  } | null>(null);

  // Responsive width
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const innerW = width  - MARGIN.left - MARGIN.right;
  const innerH = CHART_HEIGHT - MARGIN.top  - MARGIN.bottom;

  // Empty state — render placeholder axes with a message (BEFORE derived calculations)
  if (logs.length < 2) {
    return (
      <div ref={containerRef} className="relative w-full select-none">
        <svg width={width} height={CHART_HEIGHT}>
          <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
            {/* Ghost grid lines */}
            {[0, 1, 2, 3].map((i) => (
              <line
                key={i}
                x1={0} y1={(innerH / 3) * i} x2={innerW} y2={(innerH / 3) * i}
                stroke="currentColor" strokeOpacity={0.06} strokeWidth={1}
              />
            ))}
            {/* Axis lines */}
            <line x1={0} y1={0} x2={0} y2={innerH} stroke="currentColor" strokeOpacity={0.15} strokeWidth={1} />
            <line x1={0} y1={innerH} x2={innerW} y2={innerH} stroke="currentColor" strokeOpacity={0.15} strokeWidth={1} />
            {/* Centered message */}
            <text
              x={innerW / 2} y={innerH / 2 - 8}
              textAnchor="middle" fontSize={12}
              fill="currentColor" opacity={0.3}
            >
              {logs.length === 0
                ? "Enregistrez votre premier poids"
                : "Enregistrez un 2e poids pour voir le graphique"}
            </text>
            {/* Single dot if 1 entry */}
            {logs.length === 1 && (
              <circle
                cx={innerW / 2}
                cy={innerH / 2 + 10}
                r={5}
                fill={color}
                opacity={0.6}
              />
            )}
          </g>
        </svg>
      </div>
    );
  }

  // ── Derived calculations (only reached when logs.length >= 2) ──────────────

  // Convert values to display unit
  const vals = logs.map((l) => unit === "lbs" ? kgToLbs(l.weight_kg) : l.weight_kg);
  const goalVal = goalKg != null ? (unit === "lbs" ? kgToLbs(goalKg) : goalKg) : null;

  const rawMin = Math.min(...vals, ...(goalVal != null ? [goalVal] : []));
  const rawMax = Math.max(...vals, ...(goalVal != null ? [goalVal] : []));
  const pad = Math.max((rawMax - rawMin) * 0.15, 0.5);
  const minVal = rawMin - pad;
  const maxVal = rawMax + pad;

  function xOf(i: number) {
    return logs.length === 1 ? innerW / 2 : (i / (logs.length - 1)) * innerW;
  }
  function yOf(v: number) {
    return innerH - ((v - minVal) / (maxVal - minVal)) * innerH;
  }

  const points = vals.map((v, i) => ({ x: xOf(i), y: yOf(v), v, log: logs[i] }));
  const lineStr = points.map((p) => `${p.x},${p.y}`).join(" ");
  const areaPath =
    `M ${points[0].x},${points[0].y} ` +
    points.slice(1).map((p) => `L ${p.x},${p.y}`).join(" ") +
    ` L ${points[points.length - 1].x},${innerH} L ${points[0].x},${innerH} Z`;

  const yTicks = Array.from({ length: 4 }, (_, i) => {
    const frac = i / 3;
    return minVal + frac * (maxVal - minVal);
  });

  const xLabelCount = Math.min(5, logs.length);
  const xLabelIndices = Array.from({ length: xLabelCount }, (_, i) =>
    Math.round((i / (xLabelCount - 1)) * (logs.length - 1))
  );

  const goalY = goalVal != null ? yOf(goalVal) : null;
  const gradId = "wg-" + color.replace("#", "");

  return (
    <div ref={containerRef} className="relative w-full select-none">
      <svg
        width={width}
        height={CHART_HEIGHT}
        onMouseLeave={() => setTooltip(null)}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0}    />
          </linearGradient>
        </defs>

        <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>

          {/* Y grid lines + labels */}
          {yTicks.map((tick, i) => {
            const ty = yOf(tick);
            return (
              <g key={i}>
                <line
                  x1={0} y1={ty} x2={innerW} y2={ty}
                  stroke="currentColor" strokeOpacity={0.07} strokeWidth={1}
                />
                <text
                  x={-6} y={ty + 4}
                  textAnchor="end"
                  fontSize={9}
                  fill="currentColor"
                  opacity={0.45}
                >
                  {tick.toFixed(1)}
                </text>
              </g>
            );
          })}

          {/* X-axis labels */}
          {xLabelIndices.map((idx) => {
            const px = xOf(idx);
            return (
              <text
                key={idx}
                x={px}
                y={innerH + 18}
                textAnchor="middle"
                fontSize={9}
                fill="currentColor"
                opacity={0.45}
              >
                {formatDate(logs[idx].logged_at)}
              </text>
            );
          })}

          {/* Area fill */}
          <path d={areaPath} fill={`url(#${gradId})`} />

          {/* Line */}
          <polyline
            points={lineStr}
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Goal weight dashed line */}
          {goalY != null && goalVal != null && (
            <g>
              <line
                x1={0} y1={goalY} x2={innerW} y2={goalY}
                stroke={color} strokeOpacity={0.55}
                strokeWidth={1.5} strokeDasharray="5,4"
              />
              <text
                x={innerW - 2} y={goalY - 4}
                textAnchor="end"
                fontSize={9}
                fill={color}
                opacity={0.8}
              >
                Objectif {goalVal.toFixed(1)} {unit}
              </text>
            </g>
          )}

          {/* Data point dots */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={tooltip && tooltip.date === formatDate(p.log.logged_at) ? 5 : 3}
              fill={color}
              stroke="white"
              strokeWidth={1.5}
              className="cursor-pointer transition-all"
              onMouseEnter={(e) => {
                const rect = containerRef.current?.getBoundingClientRect();
                const svgRect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
                if (!rect || !svgRect) return;
                setTooltip({
                  x: p.x + MARGIN.left,
                  y: p.y + MARGIN.top,
                  val: `${p.v.toFixed(1)} ${unit}`,
                  date: formatDate(p.log.logged_at),
                });
              }}
            />
          ))}

          {/* Axes border lines */}
          <line x1={0} y1={0} x2={0} y2={innerH} stroke="currentColor" strokeOpacity={0.15} strokeWidth={1} />
          <line x1={0} y1={innerH} x2={innerW} y2={innerH} stroke="currentColor" strokeOpacity={0.15} strokeWidth={1} />
        </g>
      </svg>

      {/* Floating tooltip */}
      {tooltip && (
        <div
          className="absolute pointer-events-none z-10 bg-white dark:bg-zinc-900 border border-divider rounded-lg shadow-md px-2.5 py-1.5 text-xs font-semibold"
          style={{
            left: tooltip.x + 10,
            top:  tooltip.y - 36,
            transform: tooltip.x > width * 0.7 ? "translateX(calc(-100% - 18px))" : undefined,
          }}
        >
          <span style={{ color }}>{tooltip.val}</span>
          <span className="text-default-400 ml-1.5 font-normal">{tooltip.date}</span>
        </div>
      )}
    </div>
  );
}

// Macro ring (SVG donut)
function MacroRing({
  proteinPct, carbsPct, fatPct, size = 80,
}: {
  proteinPct: number; carbsPct: number; fatPct: number; size?: number;
}) {
  const r = size / 2 - 6;
  const circ = 2 * Math.PI * r;
  const proteinDash = (proteinPct / 100) * circ;
  const carbsDash   = (carbsPct   / 100) * circ;
  const fatDash     = (fatPct     / 100) * circ;

  const segments = [
    { dash: proteinDash, offset: 0,                             color: "#f31260" },
    { dash: carbsDash,   offset: proteinDash,                   color: "#f5a524" },
    { dash: fatDash,     offset: proteinDash + carbsDash,       color: "#006fee" },
  ];

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e4e4e7" strokeWidth={10} />
      {segments.map((seg, i) => (
        <circle
          key={i}
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={seg.color}
          strokeWidth={10}
          strokeDasharray={`${seg.dash} ${circ - seg.dash}`}
          strokeDashoffset={-seg.offset}
          strokeLinecap="butt"
        />
      ))}
    </svg>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProgressDashboard() {
  const [nutrition, setNutrition] = useState<NutritionProfile | null>(null);
  const [logs, setLogs] = useState<WeightLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [weekMacros, setWeekMacros] = useState<MealPlanMacros[]>([]);

  // Weight entry form
  const [entryValue, setEntryValue] = useState("");
  const [entryNote, setEntryNote] = useState("");
  const [entryUnit, setEntryUnit] = useState<"kg" | "lbs">("kg");
  const [saving, setSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const unit = (nutrition?.weight_unit as "kg" | "lbs") ?? "kg";

  // Sync entryUnit with profile unit once loaded
  useEffect(() => {
    if (nutrition?.weight_unit) setEntryUnit(nutrition.weight_unit as "kg" | "lbs");
  }, [nutrition?.weight_unit]);

  // Load nutrition profile
  useEffect(() => {
    fetch("/api/user/nutrition")
      .then((r) => r.json())
      .then((d) => setNutrition(d.nutrition ?? null))
      .catch(() => {});
  }, []);

  // Load weight logs
  const fetchLogs = useCallback(async () => {
    setLoadingLogs(true);
    try {
      const r = await fetch("/api/user/weight-logs?days=90");
      const d = await r.json();
      setLogs(d.logs ?? []);
    } catch {}
    setLoadingLogs(false);
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  // Load current week meal plan macros
  useEffect(() => {
    fetch("/api/meal-plan/current")
      .then((r) => r.json())
      .then((d) => {
        if (!d?.plan?.meals?.days) return;
        const macros: MealPlanMacros[] = d.plan.meals.days.map((day: any) => {
          const totals = day.meals.reduce(
            (acc: any, m: any) => ({
              calories: acc.calories + (m.calories || 0),
              protein:  acc.protein  + (m.protein  || 0),
              carbs:    acc.carbs    + (m.carbs     || 0),
              fat:      acc.fat      + (m.fat       || 0),
            }),
            { calories: 0, protein: 0, carbs: 0, fat: 0 },
          );
          return { day: day.day, ...totals };
        });
        setWeekMacros(macros);
      })
      .catch(() => {});
  }, []);

  // Slider config per unit
  const sliderMin  = entryUnit === "kg" ? 30  : 66;
  const sliderMax  = entryUnit === "kg" ? 250 : 551;
  const sliderStep = entryUnit === "kg" ? 0.1 : 0.5;
  const sliderVal  = parseFloat(entryValue) || (entryUnit === "kg" ? 70 : 154);

  // Log today's weight
  async function handleLogWeight() {
    if (!entryValue) return;
    setSaving(true);
    try {
      const body: Record<string, unknown> = { note: entryNote || null };
      if (entryUnit === "lbs") body.weight_lbs = Number(entryValue);
      else                      body.weight_kg  = Number(entryValue);

      const r = await fetch("/api/user/weight-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (r.ok) {
        setEntryValue("");
        setEntryNote("");
        await fetchLogs();
      }
    } catch {}
    setSaving(false);
  }

  async function handleDeleteLog(id: string) {
    await fetch("/api/user/weight-logs", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setLogs((prev) => prev.filter((l) => l.id !== id));
  }

  // Derived stats
  const latestLog = logs[logs.length - 1] ?? null;
  const prevLog   = logs[logs.length - 2] ?? null;
  const firstLog  = logs[0] ?? null;
  const deltaVsPrev  = latestLog && prevLog  ? latestLog.weight_kg - prevLog.weight_kg   : null;
  const deltaVsStart = latestLog && firstLog && firstLog.id !== latestLog.id
    ? latestLog.weight_kg - firstLog.weight_kg : null;
  const goalKg   = nutrition?.goal_weight_kg ?? null;
  const remaining = latestLog && goalKg ? latestLog.weight_kg - goalKg : null;

  const proteinPct = nutrition?.macro_protein_pct ?? 30;
  const carbsPct   = nutrition?.macro_carbs_pct   ?? 40;
  const fatPct     = nutrition?.macro_fat_pct     ?? 30;
  const dailyCal   = nutrition?.daily_calorie_target ?? null;

  const macroGramsTarget = dailyCal ? {
    protein: Math.round((dailyCal * proteinPct) / 100 / 4),
    carbs:   Math.round((dailyCal * carbsPct)   / 100 / 4),
    fat:     Math.round((dailyCal * fatPct)      / 100 / 9),
  } : null;

  const todayMacros = (() => {
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
    return weekMacros.find((m) => m.day === today) ?? null;
  })();

  const hasTodayLog = logs.some(
    (l) => l.logged_at === new Date().toISOString().split("T")[0]
  );

  return (
    <div className="flex flex-col gap-4">

      {/* ── Weight Progress ────────────────────────────────────── */}
      <Card className="border border-divider/50 bg-white/50 dark:bg-black/20">
        <CardHeader className="pb-0 pt-5 px-5">
          <div className="flex items-center gap-2 w-full">
            <Scale size={16} className="text-success" />
            <h3 className="font-bold text-sm">Suivi du poids</h3>
            {latestLog && (
              <Chip size="sm" variant="flat" color="success" className="ml-auto text-xs">
                {displayWeight(latestLog.weight_kg, unit)}
              </Chip>
            )}
          </div>
        </CardHeader>
        <CardBody className="px-5 pt-3 pb-5 flex flex-col gap-4">

          {/* Stats row */}
          {latestLog && (
            <div className="flex gap-3 flex-wrap">
              {deltaVsPrev !== null && (
                <div className="flex items-center gap-1.5">
                  {deltaVsPrev < 0
                    ? <TrendingDown size={14} className="text-success" />
                    : deltaVsPrev > 0
                    ? <TrendingUp size={14} className="text-danger" />
                    : <span className="text-default-400 text-xs">–</span>}
                  <span className={`text-xs font-semibold ${deltaVsPrev < 0 ? "text-success" : deltaVsPrev > 0 ? "text-danger" : "text-default-400"}`}>
                    {deltaVsPrev > 0 ? "+" : ""}{unit === "lbs" ? kgToLbs(deltaVsPrev).toFixed(1) : deltaVsPrev.toFixed(1)} {unit} (vs hier)
                  </span>
                </div>
              )}
              {deltaVsStart !== null && (
                <div className="flex items-center gap-1.5">
                  {deltaVsStart < 0
                    ? <TrendingDown size={14} className="text-success" />
                    : <TrendingUp size={14} className="text-danger" />}
                  <span className="text-xs text-default-400">
                    {deltaVsStart > 0 ? "+" : ""}{unit === "lbs" ? kgToLbs(deltaVsStart).toFixed(1) : deltaVsStart.toFixed(1)} {unit} (total)
                  </span>
                </div>
              )}
              {remaining !== null && (
                <div className="flex items-center gap-1.5 ml-auto">
                  <Target size={14} className="text-primary" />
                  <span className="text-xs text-primary font-semibold">
                    {Math.abs(unit === "lbs" ? kgToLbs(remaining) : remaining).toFixed(1)} {unit} {remaining > 0 ? "à perdre" : "à gagner"}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Weight chart — always shown, handles empty state internally */}
          {!loadingLogs && (
            <WeightChart
              logs={logs}
              color={nutrition?.weight_goal === "lose" ? "#17c964" : nutrition?.weight_goal === "gain" ? "#006fee" : "#f5a524"}
              unit={unit}
              goalKg={goalKg}
            />
          )}

          {/* Log today's weight */}
          {!hasTodayLog && (
            <>
              <Divider className="bg-divider/40" />
              <div className="flex flex-col gap-3">
                <p className="text-xs font-semibold text-default-500">Enregistrer votre poids d&apos;aujourd&apos;hui</p>

                {/* Unit toggle */}
                <div className="flex items-center justify-center">
                  <div className="flex rounded-xl overflow-hidden border border-divider bg-default-100 p-0.5 gap-0.5">
                    {(["kg", "lbs"] as const).map((u) => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => {
                          if (u === entryUnit) return;
                          // Convert the current value when switching
                          if (entryValue) {
                            const num = parseFloat(entryValue);
                            if (!isNaN(num)) {
                              setEntryValue(
                                u === "lbs"
                                  ? kgToLbs(num).toFixed(1)
                                  : (num / 2.20462).toFixed(1)
                              );
                            }
                          }
                          setEntryUnit(u);
                        }}
                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          entryUnit === u
                            ? "bg-white dark:bg-black shadow text-foreground"
                            : "text-default-400 hover:text-foreground"
                        }`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Slider widget */}
                <div className="flex flex-col items-center gap-1 px-1">
                  <div className="text-3xl font-bold tabular-nums">
                    {entryValue
                      ? `${parseFloat(entryValue).toFixed(1)} ${entryUnit}`
                      : <span className="text-default-300">{entryUnit === "kg" ? "70.0" : "154.0"} {entryUnit}</span>
                    }
                  </div>
                  <Slider
                    aria-label="Poids"
                    minValue={sliderMin}
                    maxValue={sliderMax}
                    step={sliderStep}
                    value={sliderVal}
                    onChange={(v) => setEntryValue(Number(v).toFixed(1))}
                    color="success"
                    size="lg"
                    className="w-full"
                    showTooltip
                    tooltipProps={{ content: `${sliderVal.toFixed(1)} ${entryUnit}` }}
                  />
                  <div className="flex justify-between w-full text-[10px] text-default-400 -mt-1">
                    <span>{sliderMin} {entryUnit}</span>
                    <span>{sliderMax} {entryUnit}</span>
                  </div>
                </div>

                {/* Note + Save */}
                <div className="flex gap-2 items-center">
                  <Input
                    placeholder="Note (optionnel)"
                    size="sm"
                    value={entryNote}
                    onValueChange={setEntryNote}
                    className="flex-1"
                    variant="flat"
                  />
                  <Button
                    size="sm"
                    color="success"
                    onPress={handleLogWeight}
                    isLoading={saving}
                    isDisabled={!entryValue}
                    startContent={!saving && <Scale size={14} />}
                    className="font-semibold"
                  >
                    Enregistrer
                  </Button>
                </div>
              </div>
            </>
          )}

          {hasTodayLog && (
            <p className="text-xs text-success font-medium text-center">✓ Poids enregistré aujourd&apos;hui</p>
          )}

          {/* History toggle */}
          {logs.length > 0 && (
            <>
              <button
                type="button"
                onClick={() => setShowHistory((s) => !s)}
                className="flex items-center gap-1 text-xs text-default-400 hover:text-foreground transition-colors self-start"
              >
                {showHistory ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                {showHistory ? "Masquer" : "Voir"} l&apos;historique ({logs.length} entrées)
              </button>
              {showHistory && (
                <div className="flex flex-col gap-0.5 max-h-48 overflow-y-auto pr-1">
                  {[...logs].reverse().map((log) => (
                    <div key={log.id} className="flex items-center justify-between py-1.5 border-b border-divider/40 last:border-0">
                      <span className="text-xs text-default-400">{formatDate(log.logged_at)}</span>
                      <span className="text-xs font-semibold">{displayWeight(log.weight_kg, unit)}</span>
                      {log.note && <span className="text-xs text-default-400 italic truncate max-w-24">{log.note}</span>}
                      <button
                        type="button"
                        onClick={() => handleDeleteLog(log.id)}
                        className="p-1 rounded hover:bg-danger/10 text-default-300 hover:text-danger transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

        </CardBody>
      </Card>

      {/* ── Daily Macros ──────────────────────────────────────── */}
      <Card className="border border-divider/50 bg-white/50 dark:bg-black/20">
        <CardHeader className="pb-0 pt-5 px-5">
          <div className="flex items-center gap-2 w-full">
            <Flame size={16} className="text-danger" />
            <h3 className="font-bold text-sm">Macros & apport calorique</h3>
            {dailyCal && (
              <Chip size="sm" variant="flat" color="danger" className="ml-auto text-xs">
                Cible : {dailyCal.toLocaleString()} kcal
              </Chip>
            )}
          </div>
        </CardHeader>
        <CardBody className="px-5 pt-3 pb-5 flex flex-col gap-4">

          {/* Macro ring + targets */}
          <div className="flex items-center gap-5">
            <MacroRing proteinPct={proteinPct} carbsPct={carbsPct} fatPct={fatPct} size={84} />
            <div className="flex flex-col gap-1.5 flex-1">
              <div className="flex items-center gap-2">
                <Beef size={13} className="text-danger" />
                <span className="text-xs text-default-500">Protéines</span>
                <span className="text-xs font-bold text-danger ml-auto">{proteinPct}%{macroGramsTarget ? ` · ${macroGramsTarget.protein}g` : ""}</span>
              </div>
              <div className="flex items-center gap-2">
                <Wheat size={13} className="text-warning" />
                <span className="text-xs text-default-500">Glucides</span>
                <span className="text-xs font-bold text-warning ml-auto">{carbsPct}%{macroGramsTarget ? ` · ${macroGramsTarget.carbs}g` : ""}</span>
              </div>
              <div className="flex items-center gap-2">
                <Droplets size={13} className="text-primary" />
                <span className="text-xs text-default-500">Lipides</span>
                <span className="text-xs font-bold text-primary ml-auto">{fatPct}%{macroGramsTarget ? ` · ${macroGramsTarget.fat}g` : ""}</span>
              </div>
            </div>
          </div>

          {/* Week bar chart — calories per day from meal plan */}
          {weekMacros.length > 0 && (
            <>
              <Divider className="bg-divider/40" />
              <div className="flex flex-col gap-1.5">
                <p className="text-xs font-semibold text-default-500">Apport calorique de la semaine</p>
                <div className="flex items-end gap-1.5 h-14">
                  {weekMacros.map((m) => {
                    const pct = dailyCal ? Math.min((m.calories / dailyCal) * 100, 130) : 60;
                    const isToday = m.day === new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
                    return (
                      <div key={m.day} className="flex flex-col items-center gap-0.5 flex-1">
                        <div className="flex flex-col justify-end w-full" style={{ height: 44 }}>
                          <div
                            className={`w-full rounded-t-sm transition-all ${isToday ? "bg-success" : "bg-default-200 dark:bg-default-700"}`}
                            style={{ height: `${pct}%` }}
                          />
                        </div>
                        <span className={`text-[9px] ${isToday ? "text-success font-bold" : "text-default-400"}`}>
                          {DAY_LABELS[m.day] ?? m.day.slice(0, 3)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {/* Today detail */}
                {todayMacros && (
                  <div className="flex gap-2 pt-1 flex-wrap">
                    <Chip size="sm" variant="flat" color="default" className="text-[10px]">
                      {todayMacros.calories} kcal
                    </Chip>
                    <Chip size="sm" variant="flat" color="danger" className="text-[10px]">
                      P {todayMacros.protein}g
                    </Chip>
                    <Chip size="sm" variant="flat" color="warning" className="text-[10px]">
                      G {todayMacros.carbs}g
                    </Chip>
                    <Chip size="sm" variant="flat" color="primary" className="text-[10px]">
                      L {todayMacros.fat}g
                    </Chip>
                  </div>
                )}
              </div>
            </>
          )}

          {!dailyCal && !weekMacros.length && (
            <p className="text-xs text-default-400 text-center py-1">
              Complétez votre profil nutritionnel pour voir vos objectifs ici.
            </p>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
