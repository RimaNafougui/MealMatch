# MealMatch Design System

A reference guide for all contributors. Follow these rules to keep the UI consistent across every page and component.

---

## Stack

| Layer | Tool |
|---|---|
| Framework | Next.js 15 App Router |
| UI Library | HeroUI (based on React Aria) |
| Styling | Tailwind CSS v4 |
| Font | **Poppins** (Google Fonts) |
| Icons | **lucide-react** — never mix with other icon sets |
| Animations | **framer-motion** for page/modal entrances |
| Notifications | **sonner** `<Toaster position="top-right" richColors />` |
| Theme | Light + Dark via `next-themes` — default is `dark` |

---

## Color Palette

All colors come from the HeroUI theme defined in `tailwind.config.ts`. Always use semantic color names — never hardcode hex values in class names.

### Semantic Colors

| Token | Light | Dark | When to use |
|---|---|---|---|
| `success` | `#2E6F40` | `#2E6F40` | **Brand color.** CTAs, active states, weight/health data, positive trends |
| `primary` | `#2563EB` | `#60A5FA` | Links (when needed), focus rings, calories/energy data |
| `warning` | `#F59E0B` | `#FBBF24` | Carbs, activity level, budget, caution states |
| `danger` | `#EF4444` | `#EF4444` | Proteins, delete actions, error states |
| `secondary` | `#64748B` | `#94A3B8` | Pro plan badge, supporting labels |
| `default` | System | System | Neutral chips, ghost UI, inactive states |

### Semantic Color Rules — Data Visualization

Always use these mappings consistently:

```
Proteins    → text-danger   / bg-danger   / #f31260
Carbs       → text-warning  / bg-warning  / #f5a524
Fats        → text-primary  / bg-primary  / #006fee
Calories    → text-warning
Weight loss → text-success / color="#17c964"
Weight gain → text-primary / color="#006fee"
Maintain    → text-warning / color="#f5a524"
```

### Plan Badge Colors

```
free     → no badge shown
premium  → color="warning"   → "Premium"
pro      → color="secondary" → "Pro"
```

---

## Typography

Font family: **Poppins** — applied globally via `font-sans`.

### Page Hierarchy

```tsx
// Page title (every page has exactly one)
<h1 className="text-3xl font-bold">Mon Titre</h1>

// Page subtitle / description
<p className="text-default-500 mt-1 text-sm">Description courte.</p>

// Section label (above a group of cards)
<h2 className="text-sm font-semibold text-default-400 uppercase tracking-wider mb-3">
  Ma section
</h2>

// Card header title
<h3 className="font-bold text-base flex items-center gap-2">
  <IconHere className="w-4 h-4 text-success" />
  Titre de la carte
</h3>

// Auth page title (login, signup, onboarding)
<h1 className="text-3xl font-extrabold tracking-tighter uppercase italic">
  Content de vous revoir
</h1>
```

### Text Sizes Quick Reference

| Use case | Class |
|---|---|
| Page title | `text-3xl font-bold` |
| Auth title | `text-3xl font-extrabold tracking-tighter uppercase italic` |
| Card title | `font-bold text-base` |
| Section label | `text-sm font-semibold text-default-400 uppercase tracking-wider` |
| Body | `text-sm text-default-500` |
| Secondary / caption | `text-xs text-default-400` |
| Micro label | `text-[10px] text-default-400` |

---

## Layout

### Page Container

Every private page wraps its content like this:

```tsx
// Standard page (dashboard, profile, settings, recettes, epicerie)
<div className="flex flex-col gap-6 max-w-4xl">

// Dashboard specifically uses gap-8
<div className="flex flex-col gap-8 max-w-4xl mx-auto">

// Explore page (wider grid needs more space)
<div className="max-w-7xl mx-auto flex flex-col gap-6">
```

> The `mx-auto` and `px-6 py-8` padding is handled by the **private layout** — don't add it again inside pages.

### Page Header Pattern

Every page starts with a header block:

```tsx
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
  <div>
    <h1 className="text-3xl font-bold">Page Title</h1>
    <p className="text-default-500 mt-1 text-sm">One-line description.</p>
  </div>
  {/* Optional: primary action button */}
  <Button color="success" startContent={<Plus size={16} />} className="font-semibold shrink-0">
    Action
  </Button>
</div>
```

### Grid Patterns

```tsx
// Stats row (3 equal columns)
<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

// Content cards (2 columns on md+)
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">

// Quick links / recipe grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

// Explore recipe grid (4 cols on large)
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
```

---

## Cards

Two main card variants — pick based on context:

### Primary Card (content, forms, detail panels)

```tsx
<Card className="p-5 border border-divider/50 bg-white/70 dark:bg-black/40">
```

### Secondary Card (stats, quick links, lighter items)

```tsx
<Card className="border border-divider/50 bg-white/50 dark:bg-black/20">
```

### Hoverable / Pressable Link Card

```tsx
<Card
  as={Link}
  href="/somewhere"
  isHoverable
  isPressable
  className="border border-divider/50 bg-white/50 dark:bg-black/20"
>
```

### Accent Cards (used for CTA or status banners)

```tsx
// Success/green banner
<Card className="border border-success/20 bg-success/5 p-6">

// Warning banner
<Card className="border border-warning/20 bg-warning/5 p-4">

// Primary/blue banner
<Card className="border border-primary/20 bg-primary/5 p-4">
```

### Empty State Card

```tsx
<Card className="p-8 border border-dashed border-divider bg-content2 max-w-sm w-full">
  <CardBody className="flex flex-col items-center gap-4">
    <IconHere size={48} className="text-default-300" />
    <div>
      <p className="font-semibold text-lg">Titre vide</p>
      <p className="text-default-400 text-sm mt-1">Message d'explication.</p>
    </div>
    {/* Optional action */}
    <Button color="success" variant="flat" className="font-semibold">Action</Button>
  </CardBody>
</Card>
```

### Skeleton Loading

Always provide skeletons for async content — match the shape of the real content:

```tsx
<Skeleton className="h-7 w-40 rounded-lg" />       // title
<Skeleton className="h-4 w-48 rounded-lg" />        // subtitle
<Skeleton className="h-12 w-full rounded-xl" />     // input / block
<Skeleton className="h-24 w-24 rounded-full" />     // avatar
```

---

## Buttons

### Primary Action (always `success`)

```tsx
<Button color="success" className="font-semibold">
  Enregistrer
</Button>

// With icon
<Button color="success" startContent={<Plus size={16} />} className="font-semibold">
  Ajouter
</Button>

// Full-width (auth forms)
<Button color="success" className="w-full h-12 font-bold shadow-lg shadow-success/20">
  Connexion
</Button>
```

### Secondary / Ghost

```tsx
<Button variant="flat" color="default" className="font-semibold">
  Annuler
</Button>

<Button variant="flat" color="success">
  Action secondaire
</Button>
```

### Danger

```tsx
<Button variant="flat" color="danger">
  Supprimer
</Button>
```

### Icon-only

```tsx
<Button isIconOnly size="sm" variant="flat" color="danger">
  <Trash2 size={14} />
</Button>
```

> **Rule:** Never use `color="primary"` for submit/CTA buttons — always `color="success"`. Use `color="primary"` only for pagination active state or internal data-viz labels.

---

## Chips / Badges

```tsx
// Status / count badge
<Chip size="sm" variant="flat" color="success">Actif</Chip>

// Plan badge
<Chip size="sm" variant="flat" color="warning">Premium</Chip>
<Chip size="sm" variant="flat" color="secondary">Pro</Chip>

// Data label
<Chip size="sm" variant="flat" color="default">74.2 kg</Chip>

// AI badge (small inline)
<Chip color="primary" size="sm" variant="flat" className="text-[10px] h-4">IA</Chip>

// Filter tag (active)
<Chip size="sm" variant="solid" color="success" onClose={handleRemove}>
  Végétarien
</Chip>
```

---

## Icons

Always use **lucide-react**. Never mix with `@heroicons/react` or other icon libraries (the `@heroicons` import in `SignUpForm.tsx` is a known legacy exception).

### Icon Sizes by Context

| Context | Size |
|---|---|
| Card header / section icon | `size={16}` or `w-4 h-4` |
| Navigation items | `size={18}` |
| Button start content | `size={16}` |
| Inline text icon | `size={13}` or `size={14}` |
| Empty state illustration | `size={48}` |
| Hero / banner | `size={24}` – `size={28}` |

### Icon + Label Pattern

```tsx
<h3 className="font-bold text-base flex items-center gap-2">
  <Scale className="w-4 h-4 text-success" />
  Suivi du poids
</h3>
```

---

## Forms & Inputs

```tsx
// Standard input (inside cards, settings)
<Input
  label="Label"
  placeholder="Placeholder..."
  variant="flat"
  labelPlacement="outside"
/>

// Auth form input (taller, bordered)
<Input
  label="Courriel"
  variant="bordered"
  labelPlacement="outside"
  classNames={{ inputWrapper: "h-12" }}
  startContent={<Mail size={18} className="text-default-400" />}
/>

// Select
<Select variant="bordered" size="sm" placeholder="Sélectionner">
  <SelectItem key="value">Label</SelectItem>
</Select>

// Slider
<Slider
  color="success"
  size="lg"
  minValue={0}
  maxValue={100}
  showTooltip
/>
```

> Always use `variant="flat"` inside cards. Use `variant="bordered"` in auth forms.

---

## Dividers

```tsx
<Divider className="bg-divider/50" />
```

Always use opacity `/50`. Never use bare `<Divider />` without the class.

---

## Section Labels

Used above any group of related cards:

```tsx
<h2 className="text-sm font-semibold text-default-400 uppercase tracking-wider mb-3">
  Accès rapide
</h2>
```

---

## Navigation

### Navbar link hover

```tsx
className="hover:text-success hover:bg-success/5 transition-colors"
```

### Mobile menu item

```tsx
className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold text-default-700 hover:bg-success/8 hover:text-success transition-colors"
```

---

## Notifications (Toast)

```tsx
import { toast } from "sonner";

toast.success("Enregistré avec succès");
toast.error("Impossible de charger les données");
toast.info("Mise à jour disponible");
```

Never use `alert()` or custom inline toasts — always use `sonner`.

---

## Localization

- Language: **French (fr-FR)**
- Date formatting: always `toLocaleDateString("fr-FR", { ... })`
- Numbers: `toLocaleString()` for large numbers (calories, budget)
- Currency: `$ CAD` — display as `{amount} $CA` or `{amount} $ CAD`
- Do **not** use `fr-CA` locale — use `fr-FR` throughout

---

## Animations

Use `framer-motion` for page entrances and modal transitions:

```tsx
// Standard page/card entrance
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
>

// Step transitions (onboarding, multi-step forms)
<motion.div
  key={currentStep}
  initial={{ opacity: 0, x: 20 }}
  animate={{ opacity: 1, x: 0 }}
  exit={{ opacity: 0, x: -20 }}
  transition={{ duration: 0.25 }}
>

// Alert/banner appearance
<motion.div
  initial={{ opacity: 0, scale: 0.97 }}
  animate={{ opacity: 1, scale: 1 }}
>
```

Tailwind custom animations (`animate-fade-in`, `animate-slide-up`) are available for simpler cases.

---

## Auth Pages (Login / Signup)

```tsx
// Page wrapper
<div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-6 py-10">
  <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-success/8 via-transparent to-transparent" />
  <FormComponent />
</div>

// Form card (no card wrapper — plain motion.div)
<motion.div className="w-full max-w-md space-y-8">

// Form title
<h2 className="text-3xl font-extrabold tracking-tighter uppercase italic text-center">
  Titre
</h2>
```

---

## Onboarding

```tsx
// Page wrapper
<div className="min-h-screen flex items-center justify-center p-4 py-16">

// Card
<div className="backdrop-blur-xl bg-white/70 dark:bg-black/40 border border-divider/50 rounded-3xl shadow-xl p-6 sm:p-8">

// Step icon container
<div className="w-10 h-10 rounded-2xl bg-success/10 flex items-center justify-center">
  <IconHere size={20} className="text-success" />
</div>

// Step section header
<h2 className="font-bold text-lg">Titre de l'étape</h2>
<p className="text-default-500 text-xs">Sous-titre.</p>
```

Semantic colors per onboarding step:

| Step | Color |
|---|---|
| Dietary (0) | `success` |
| Intolerances (1) | `warning` |
| Budget (2) | `primary` |
| Body metrics (3) | `secondary` |
| Activity (4) | `warning` |
| Goals (5) | `primary` |
| Macros (6) | `danger` / `warning` / `primary` |
| Summary (7) | `success` |

Navigation buttons: Back = `variant="flat"`, Next/Finish = `color="success"`.

---

## Dark Mode

All cards and surfaces must have both light and dark variants:

```
bg-white/70 dark:bg-black/40   → primary card surface
bg-white/50 dark:bg-black/20   → secondary/lighter card surface
bg-white/60 dark:bg-white/5    → inner sections inside cards (onboarding summary)
bg-default-100                  → input backgrounds, toggle pills
```

Always test both modes. Never use hardcoded `bg-white` or `bg-black` without opacity.

---

## Do's and Don'ts

| ✅ Do | ❌ Don't |
|---|---|
| `color="success"` for all primary CTAs | `color="primary"` for submit buttons |
| `fr-FR` locale for all date/number formatting | `fr-CA` locale |
| `lucide-react` for all icons | Mix icon libraries |
| `variant="flat"` inputs inside cards | `variant="bordered"` inside cards |
| `<Toaster />` via sonner for all notifications | `alert()` or custom toast divs |
| `border border-divider/50` on all cards | Bare `<Card>` with no border class |
| `gap-6` or `gap-8` with `flex flex-col` for page sections | `space-y-*` utilities |
| `text-3xl font-bold` for page `<h1>` | `text-2xl` or `text-xl` for page titles |
| Skeleton components for all async states | Blank space or spinners-only loading states |
| `<Divider className="bg-divider/50" />` | Bare `<Divider />` |
