# MealMatch - User Stories

**Projet:** MealMatch - Planificateur de repas santé pour étudiants  
**Équipe:** Coding Kitchen
**Durée:** 7,5 semaines (5 sprints)  
**Méthodologie:** Scrum / Agile

---

## Table des matières

1. [Must Have (Priority 1)](#must-have-priority-1)
2. [Should Have (Priority 2)](#should-have-priority-2)
3. [Could Have (Priority 3)](#could-have-priority-3)
4. [Récapitulatif](#récapitulatif)

---

## Must Have (Priority 1)

Ces user stories sont **essentielles** au fonctionnement de l'application. Elles constituent le MVP (Minimum Viable Product).

---

### US1: Créer un compte avec restrictions alimentaires

**En tant qu'utilisateur, je veux créer un compte avec mes restrictions alimentaires afin de recevoir des recommandations personnalisées**

**Priorité:** Must Have (P1)  
**Estimation:** 5 points  
**Sprint:** Sprint 1

#### Critères d'acceptation

1. **Inscription complète**
   - L'utilisateur peut s'inscrire avec email et mot de passe
   - Le système envoie un email de confirmation
   - L'utilisateur peut se connecter après vérification de l'email

2. **Onboarding - Restrictions alimentaires**
   - Durant l'onboarding, l'utilisateur peut sélectionner ses restrictions alimentaires parmi une liste prédéfinie:
     - Végétarien
     - Végan
     - Sans gluten
     - Sans lactose
     - Halal
     - Casher
     - Pescatarien
   - Multiple selections sont possibles
   - L'utilisateur peut aussi spécifier des allergies textuelles (ex: "noix", "arachides")

3. **Persistance et utilisation**
   - Les restrictions alimentaires sélectionnées sont sauvegardées dans le profil Supabase
   - Ces restrictions sont automatiquement utilisées pour filtrer les recettes futures
   - L'utilisateur peut voir ses restrictions sur sa page de profil

#### Notes techniques

- Auth: Supabase Auth (email/password)
- Table: `profiles` avec colonnes `dietary_restrictions` (TEXT[]) et `allergies` (TEXT[])
- UI: Multi-select avec checkboxes + textarea pour allergies

#### Definition of Done

- [ ] Code écrit et testé
- [ ] PR reviewée et mergée
- [ ] Tests d'inscription fonctionnent (email + password)
- [ ] Onboarding flow complet
- [ ] Données sauvegardées dans Supabase
- [ ] Documentation mise à jour

---

### US2: Définir budget hebdomadaire

**En tant qu'utilisateur, je veux définir mon budget hebdomadaire afin d'avoir des plans de repas abordables**

**Priorité:** Must Have (P1)  
**Estimation:** 3 points  
**Sprint:** Sprint 1

#### Critères d'acceptation

1. **Saisie du budget**
   - L'utilisateur peut définir un budget minimum et maximum par semaine (en CAD)
   - Interface: dual-range slider ou deux inputs numériques
   - Range autorisé: 20$ - 200$ par semaine

2. **Validation et sauvegarde**
   - Le système valide que budget_min < budget_max
   - Le système valide que budget_min >= 20$ et budget_max <= 200$
   - Messages d'erreur clairs si validation échoue
   - Budget sauvegardé dans le profil Supabase

3. **Modification ultérieure**
   - L'utilisateur peut modifier son budget à tout moment depuis l'écran Settings
   - Les modifications sont prises en compte pour les prochains meal plans générés
   - L'historique des meal plans déjà générés n'est pas affecté

#### Notes techniques

- Table: `profiles` avec colonnes `budget_min` et `budget_max` (DECIMAL)
- UI: shadcn/ui Slider component (dual range)
- Validation: Zod schema

#### Definition of Done

- [ ] Code écrit et testé
- [ ] PR reviewée et mergée
- [ ] Slider fonctionne correctement
- [ ] Validation des limites implémentée
- [ ] Budget sauvegardé dans DB
- [ ] Page Settings permet modification

---

### US3: Générer plan de repas hebdomadaire

**En tant qu'utilisateur, je veux générer un plan de repas hebdomadaire afin de planifier mes repas**

**Priorité:** Must Have (P1)  
**Estimation:** 8 points  
**Sprint:** Sprint 3

#### Critères d'acceptation

1. **Génération avec Spoonacular API**
   - L'utilisateur peut spécifier ses préférences:
     - Diet type (vegetarian, vegan, gluten-free, etc.)
     - Target calories par jour
     - Excluded ingredients (optionnel)
   - Clic sur bouton "Générer Plan Hebdomadaire"
   - Le système appelle Spoonacular `/mealplanner/generate` API
   - Un plan pour 7 jours (3 repas/jour = 21 recettes) est généré en moins de 5 secondes
   - Loading state élégant pendant génération

2. **Respect des contraintes**
   - Le plan respecte le budget défini (±10% de tolérance)
   - Le plan respecte les restrictions alimentaires du profil
   - Le plan atteint approximativement les calories cibles (±150 cal/jour)
   - Les recettes sont variées (pas de répétitions excessives)

3. **Affichage et détails**
   - Vue calendrier hebdomadaire claire (7 colonnes pour 7 jours)
   - Chaque repas affiche:
     - Image de la recette
     - Titre cliquable
     - Temps de préparation
     - Calories
   - Total calories affiché par jour
   - Coût estimé total du plan affiché
   - L'utilisateur peut cliquer sur une recette pour voir ses détails complets

#### Notes techniques

- API: Spoonacular `/mealplanner/generate?timeFrame=week&targetCalories=X&diet=Y`
- Table: `meal_plans` avec colonne `meals` (JSONB)
- UI: Grid layout responsive, skeleton loading
- Cache: Sauvegarder recettes dans `saved_recipes` pour réduire API calls

#### Definition of Done

- [ ] Spoonacular API intégrée
- [ ] Form de préférences fonctionne
- [ ] Génération retourne 21 recettes
- [ ] Vue calendrier affiche correctement
- [ ] Respect budget et restrictions validé
- [ ] Plan sauvegardé dans Supabase
- [ ] Tests manuels passés

---

### US4: Voir recettes avec temps de préparation

**En tant qu'utilisateur, je veux voir les recettes avec temps de préparation afin de choisir des options rapides**

**Priorité:** Must Have (P1)  
**Estimation:** 5 points  
**Sprint:** Sprint 2

#### Critères d'acceptation

1. **Affichage du temps**
   - Chaque recipe card affiche clairement le temps de préparation en minutes
   - Format: "Prep: 15 min" ou icône horloge + "15 min"
   - Temps visible sans avoir à cliquer sur la recette

2. **Filtrage par temps**
   - L'utilisateur peut activer un filtre "Recettes rapides" (<30 min)
   - Le filtre s'applique immédiatement (sans recharger la page)
   - Le nombre de résultats filtrés est affiché
   - L'utilisateur peut désactiver le filtre

3. **Tri par temps**
   - L'utilisateur peut trier les recettes par temps de préparation:
     - Croissant (les plus rapides en premier)
     - Décroissant (les plus longues en premier)
   - Le tri persiste pendant la session
   - Le tri est combinable avec d'autres filtres

#### Notes techniques

- API: Spoonacular `/recipes/complexSearch?maxReadyTime=30`
- UI: Filter toggle button + sort dropdown
- State: Zustand store pour filtres actifs

#### Definition of Done

- [ ] Temps affiché sur toutes les recipe cards
- [ ] Filtre <30 min fonctionne
- [ ] Tri croissant/décroissant implémenté
- [ ] Filtres combinables
- [ ] UI responsive

---

### US5: Obtenir liste d'épicerie automatique

**En tant qu'utilisateur, je veux obtenir une liste d'épicerie automatique afin de faire mes courses efficacement**

**Priorité:** Must Have (P1)  
**Estimation:** 8 points  
**Sprint:** Sprint 4

#### Critères d'acceptation

1. **Génération automatique via Spoonacular**
   - Lorsqu'un meal plan est sauvegardé, une shopping list est générée automatiquement
   - Le système extrait tous les ingrédients via Spoonacular `/recipes/informationBulk`
   - Les ingrédients similaires sont agrégés intelligemment:
     - Ex: "2 oignons" + "1 oignon" = "3 oignons"
     - Ex: "200g chicken" + "300g chicken" = "500g chicken"
   - La liste est organisée par rayon (Produce, Meat, Dairy, Bakery, Pantry, etc.)

2. **Interface interactive**
   - L'utilisateur voit la liste groupée par rayon (sections collapsibles)
   - Chaque item a une checkbox pour marquer "acheté"
   - L'état des checkboxes est persisté dans Supabase
   - Une barre de progression affiche le % d'items cochés
   - L'utilisateur peut ajouter des items custom (hors meal plan)

3. **Coût et export**
   - Le système affiche le coût total estimé de la liste
   - Le coût est basé sur une database de prix moyens par ingrédient
   - L'utilisateur peut exporter la liste en PDF ou l'imprimer (optionnel)
   - Lorsque tous les items sont cochés, félicitations affichées

#### Notes techniques

- API: Spoonacular `/recipes/informationBulk?ids=123,456,789`
- Table: `shopping_lists` avec colonne `items` (JSONB)
- Algorithme: Fonction d'agrégation avec normalisation des unités
- UI: Accordion (shadcn/ui) pour groupes de rayons

#### Definition of Done

- [ ] Shopping list générée automatiquement
- [ ] Agrégation des ingrédients fonctionne
- [ ] Organisation par rayon implémentée
- [ ] Checkboxes persistées dans DB
- [ ] Barre de progression affichée
- [ ] Ajout d'items custom possible
- [ ] Coût total calculé et affiché

---

### US6: Voir informations nutritionnelles

**En tant qu'utilisateur, je veux voir les informations nutritionnelles afin de suivre mes calories**

**Priorité:** Must Have (P1)  
**Estimation:** 5 points  
**Sprint:** Sprint 2

#### Critères d'acceptation

1. **Sur les recipe cards**
   - Chaque recipe card affiche les calories totales de la recette
   - Format: "450 cal" ou icône + nombre
   - Visible sans cliquer sur la recette

2. **Page détail de recette**
   - La page détail affiche un tableau nutritionnel complet:
     - Calories (kcal)
     - Protéines (g)
     - Glucides (g)
     - Lipides (g)
     - Fibres (g)
     - Sodium (mg) - optionnel
   - Les valeurs sont affichées par portion
   - Le nombre de portions est indiqué

3. **Dans le meal plan**
   - Le plan de repas hebdomadaire affiche:
     - Total calories par jour (somme des 3 repas)
     - Total calories pour la semaine
     - Moyenne calories par jour
   - Un graphique en ligne montre l'évolution des calories sur 7 jours (optionnel)

#### Notes techniques

- Data: Nutrition data incluse dans Spoonacular API responses
- UI: Table (shadcn/ui) pour tableau nutritionnel
- Charts: Recharts pour graphique (optionnel)

#### Definition of Done

- [ ] Calories affichées sur recipe cards
- [ ] Tableau nutritionnel complet sur page détail
- [ ] Total calories par jour dans meal plan
- [ ] Total hebdomadaire calculé
- [ ] Données Spoonacular correctement affichées

---

## Should Have (Priority 2)

Ces user stories **améliorent significativement** l'expérience utilisateur mais ne sont pas critiques pour le MVP.

---

### US7: Sauvegarder recettes favorites

**En tant qu'utilisateur, je veux sauvegarder mes recettes favorites afin d'y accéder rapidement**

**Priorité:** Should Have (P2)  
**Estimation:** 3 points  
**Sprint:** Sprint 2

#### Critères d'acceptation

1. **Marquer comme favori**
   - Chaque recipe card et page détail a un bouton cœur (icône)
   - Clic sur le cœur marque/démarque la recette comme favorite
   - Animation de feedback visuel au clic (cœur se remplit)
   - L'état favori est persisté dans Supabase immédiatement

2. **Page Mes Favoris**
   - Un onglet "Mes Favoris" (ou page dédiée) affiche toutes les recettes favorites
   - Layout identique à la page de recherche (grid de cards)
   - Tri par date d'ajout (les plus récents en premier)
   - Message affiché si aucun favori ("Vous n'avez pas encore de favoris")

3. **Synchronisation**
   - Les favoris sont synchronisés entre sessions (persistés en DB)
   - Si l'utilisateur se connecte sur un autre appareil, il voit ses favoris
   - L'utilisateur peut retirer un favori depuis n'importe quelle page

#### Notes techniques

- Table: `user_favorites` (user_id, recipe_id, created_at)
- API Route: POST/DELETE `/api/favorites`
- UI: Heart icon (lucide-react), optimistic updates avec TanStack Query

#### Definition of Done

- [ ] Bouton cœur fonctionnel partout
- [ ] État persisté dans Supabase
- [ ] Page "Mes Favoris" créée
- [ ] Synchronisation entre sessions testée
- [ ] Optimistic updates implémentées

---

### US8: Filtrer par type alimentaire

**En tant qu'utilisateur, je veux filtrer par type (végétarien, sans gluten) afin de respecter mon régime**

**Priorité:** Should Have (P2)  
**Estimation:** 3 points  
**Sprint:** Sprint 2

#### Critères d'acceptation

1. **Filtres multiples**
   - L'utilisateur peut appliquer des filtres alimentaires sur la page de recherche:
     - Végétarien
     - Végan
     - Sans gluten
     - Sans lactose
     - Pescatarien
     - Paléo
     - Cétogène
   - Les filtres sont des checkboxes (multiple selections possibles)
   - Les filtres s'appliquent en temps réel (sans recharger la page)

2. **Indicateur de résultats**
   - Le nombre de résultats correspondants est affiché dynamiquement
   - Format: "24 recettes trouvées" ou "Aucun résultat"
   - Si 0 résultat, suggestion d'enlever des filtres

3. **Gestion des filtres actifs**
   - Les filtres actifs sont visuellement indiqués (badges colorés)
   - Chaque filtre actif a un bouton "X" pour le retirer individuellement
   - Un bouton "Réinitialiser tous les filtres" est disponible
   - Les filtres actifs persistent pendant la session (Zustand store)

#### Notes techniques

- API: Spoonacular `/recipes/complexSearch?diet=vegetarian,gluten-free`
- State: Zustand store pour filtres actifs
- UI: Checkbox group (shadcn/ui) + badges

#### Definition of Done

- [ ] Checkboxes multiples fonctionnelles
- [ ] Filtres appliqués en temps réel
- [ ] Nombre de résultats affiché
- [ ] Badges pour filtres actifs
- [ ] Bouton réinitialiser fonctionne
- [ ] State persisté dans session

---

### US9: Voir vidéos de recettes

**En tant qu'utilisateur, je veux voir des vidéos de recettes afin de mieux comprendre la préparation**

**Priorité:** Should Have (P2)  
**Estimation:** 3 points  
**Sprint:** Sprint 5

#### Critères d'acceptation

1. **Indicateur de vidéo disponible**
   - Les recettes avec vidéos disponibles affichent un badge "Vidéo" sur leur card
   - Badge visuellement distinctif (icône play + texte)
   - Badge positionné sur l'image de la recette

2. **Lecteur vidéo intégré**
   - Sur la page détail de recette, si vidéo disponible, un lecteur vidéo est affiché
   - Vidéos YouTube embedded via iframe ou react-youtube
   - Lecteur responsive (s'adapte à la largeur de l'écran)
   - Pas de pub si possible (YouTube Premium embed ou NoEmbed API)

3. **Contrôles vidéo**
   - L'utilisateur peut:
     - Play/Pause
     - Seek (avancer/reculer)
     - Contrôler le volume
     - Passer en plein écran
   - Contrôles natifs du lecteur YouTube/Vimeo utilisés

#### Notes techniques

- Data: `video_url` depuis Spoonacular (liens YouTube)
- Library: `react-youtube` ou `lite-youtube-embed` (performance)
- UI: Responsive iframe avec aspect ratio 16:9

#### Definition of Done

- [ ] Badge "Vidéo" affiché si disponible
- [ ] Lecteur YouTube intégré sur page détail
- [ ] Lecteur responsive
- [ ] Contrôles fonctionnels (play, pause, seek)
- [ ] Plein écran possible

---

### US10: Partager recettes avec amis

**En tant qu'utilisateur, je veux partager des recettes avec des amis afin de découvrir de nouvelles idées**

**Priorité:** Should Have (P2)  
**Estimation:** 5 points  
**Sprint:** Sprint 5

#### Critères d'acceptation

1. **Bouton de partage**
   - Chaque page détail de recette a un bouton "Partager"
   - Clic sur le bouton ouvre un menu de partage (ou Web Share API)
   - Options de partage:
     - Copier lien
     - Email
     - Facebook
     - Twitter
     - WhatsApp
     - Natif (Web Share API sur mobile)

2. **Lien partageable**
   - Le système génère un lien public pour la recette: `/recipes/[id]/share`
   - Ce lien est accessible sans authentification (public route)
   - La page publique affiche:
     - Image de la recette
     - Titre
     - Description
     - Temps de préparation
     - Calories
     - Bouton "Voir la recette complète" (redirige vers signup si pas connecté)

3. **Feedback et tracking**
   - Confirmation visuelle après partage ("Lien copié!" toast)
   - Compteur de partages par recette (optionnel)
   - L'utilisateur peut voir ses recettes partagées dans historique (optionnel)

#### Notes techniques

- Web Share API: `navigator.share()` pour mobile
- Route publique: `/app/(public)/recipes/[id]/share/page.tsx`
- Library: `react-share` pour boutons social media
- Toast: shadcn/ui Toast component

#### Definition of Done

- [ ] Bouton "Partager" présent sur page détail
- [ ] Web Share API fonctionnelle sur mobile
- [ ] Lien public généré et accessible
- [ ] Page publique affiche infos essentielles
- [ ] Copier lien fonctionne avec toast
- [ ] Au moins 2 options de partage social

---

## Could Have (Priority 3)

Ces user stories sont **des bonus** qui peuvent être implémentées si le temps le permet après avoir complété toutes les Priority 1 et 2.

---

### US11: Suggestions de meal prep

**En tant qu'utilisateur, je veux des suggestions de meal prep afin d'économiser du temps**

**Priorité:** Could Have (P3)  
**Estimation:** 5 points  
**Sprint:** Sprint 5 (si temps disponible)

#### Critères d'acceptation

1. **Identification des recettes meal prep**
   - Le système identifie automatiquement les recettes appropriées au meal prep:
     - Se conservent bien au frigo (3-5 jours)
     - Se réchauffent facilement
     - Portions multiples
   - Tag "Meal Prep Friendly" affiché sur ces recettes
   - Filtre "Meal Prep" disponible dans la recherche

2. **Guide de meal prep**
   - Une page dédiée ou section "Meal Prep Guide" explique:
     - Quelles recettes préparer en avance
     - Jour optimal de préparation (ex: dimanche)
     - Durée de conservation de chaque recette
     - Instructions de réchauffage
   - Suggestions basées sur le meal plan de l'utilisateur

3. **Calendrier meal prep**
   - Sur le meal plan, indication visuelle des recettes "prep-able"
   - Suggestion: "Vous pouvez préparer 4 recettes à l'avance dimanche"
   - Liste des recettes à préparer ce jour-là
   - Temps total de préparation estimé

#### Notes techniques

- Data: Tag `mealPrepFriendly` ou analyse des `dishTypes` Spoonacular
- UI: Badge sur recipe cards, page dédiée avec tips
- Algorithm: Identifier recettes avec prep_time < 60 min et servings >= 4

#### Definition of Done

- [ ] Tag "Meal Prep Friendly" affiché
- [ ] Page/section guide créée
- [ ] Suggestions basées sur meal plan
- [ ] Liste recettes à préparer générée
- [ ] Conservation et réchauffage indiqués

---

### US12: Suivre macronutriments

**En tant qu'utilisateur, je veux suivre mes macronutriments afin d'atteindre mes objectifs fitness**

**Priorité:** Could Have (P3)  
**Estimation:** 5 points  
**Sprint:** Sprint 4 (si temps disponible après shopping list)

#### Critères d'acceptation

1. **Définir objectifs de macros**
   - L'utilisateur peut définir des objectifs quotidiens dans Settings:
     - Protéines (grammes)
     - Glucides (grammes)
     - Lipides (grammes)
   - Presets disponibles:
     - Équilibré (30% protein, 40% carbs, 30% fats)
     - High Protein (40/30/30)
     - Low Carb (30/20/50)
     - Custom (sliders pour définir %)

2. **Dashboard macros**
   - Une page "Macros Dashboard" affiche:
     - 3 graphiques circulaires (1 par macro)
     - Chaque graphique montre: consommé vs objectif
     - Couleurs: vert si dans target (±10g), orange si écart modéré, rouge si gros écart
   - Affichage des macros quotidiennes et hebdomadaires
   - Toggle pour changer entre vue jour/semaine

3. **Progression visuelle**
   - Barres de progression colorées pour chaque macro
   - Pourcentage complété affiché (%/100%)
   - Suggestions si déséquilibre:
     - "Il vous manque 25g de protéines aujourd'hui"
     - "Suggestion: ajouter du poulet ou du tofu"
   - Historique des macros sur 7/14/30 jours (line chart)

#### Notes techniques

- Table: `profiles` avec colonnes `protein_goal`, `carbs_goal`, `fats_goal`
- Charts: Recharts (PieChart, BarChart, LineChart)
- Data: Nutrition data depuis Spoonacular
- Calculation: Somme des macros de tous les repas du jour

#### Definition of Done

- [ ] Settings permet définir objectifs macros
- [ ] Presets disponibles (équilibré, high protein, etc.)
- [ ] Dashboard macros créé
- [ ] 3 graphiques circulaires affichés
- [ ] Barres de progression fonctionnelles
- [ ] Toggle jour/semaine implémenté
- [ ] Suggestions de rééquilibrage affichées

---

## Récapitulatif

### Par priorité

| Priorité             | User Stories   | Total Points  | Sprints            |
| -------------------- | -------------- | ------------- | ------------------ |
| **Must Have (P1)**   | US1 - US6      | 34 points     | Sprints 1-4        |
| **Should Have (P2)** | US7 - US10     | 14 points     | Sprints 2, 5       |
| **Could Have (P3)**  | US11 - US12    | 10 points     | Sprint 4-5 (bonus) |
| **TOTAL**            | **12 stories** | **58 points** | 5 sprints          |

### Par sprint

| Sprint           | Semaine   | User Stories                         | Points | % Projet |
| ---------------- | --------- | ------------------------------------ | ------ | -------- |
| **Sprint 1**     | Semaine 2 | US1, US2 + setup                     | 21     | 20%      |
| **Sprint 2**     | Semaine 3 | US4, US6, US7, US8                   | 24     | 40%      |
| **Sprint 3**     | Semaine 4 | US3 (meal plans)                     | 26     | 60%      |
| **Sprint 4**     | Semaine 5 | US5, (US12)                          | 22     | 80%      |
| **Sprint 5**     | Semaine 6 | US9, US10, US11 + polish             | 20     | 95%      |
| **Finalisation** | Semaine 7 | Bug fixes, déploiement, présentation | -      | 100%     |

### Velocity prévue

- **Vélocité moyenne:** ~23 points/sprint
- **Total story points planifiés:** 113 points (incluant tâches techniques)
- **Capacité équipe:** 3 développeurs × ~7-8 points/dev/sprint

---

## Notes importantes

### Format des User Stories

Toutes les user stories suivent le format standard:

```
En tant que [persona],
Je veux [action/fonctionnalité],
Afin de [bénéfice/valeur].
```

### Critères d'acceptation

- Formulés de manière **testable** (pas d'ambiguïté)
- Incluent des **détails techniques précis**
- Définissent le **comportement attendu**, pas l'implémentation
- Servent de **checklist** durant le développement

### Utilisation dans GitHub Projects

1. **Créer une issue** par user story
2. **Copier les critères d'acceptation** dans la description
3. **Ajouter des labels**: `Priority: P1`, `Sprint: 1`, `Type: Feature`
4. **Cocher les critères** au fur et à mesure du développement
5. **Fermer l'issue** uniquement quand tous les critères sont validés

### Definition of Done (DoD) globale

Une user story est **"Done"** si:

- ✅ Tous les critères d'acceptation sont validés
- ✅ Code écrit, testé et reviewé
- ✅ PR approuvée et mergée dans `main`
- ✅ Déployé sur Vercel (environment preview/prod)
- ✅ Testé manuellement (happy path + edge cases)
- ✅ Documentation mise à jour (README, comments)
- ✅ Aucun bug bloquant

---

## Annexes

### MoSCoW Method

- **Must Have:** Fonctionnalités essentielles sans lesquelles le produit ne fonctionne pas
- **Should Have:** Fonctionnalités importantes mais pas critiques
- **Could Have:** Fonctionnalités bonus si temps disponible
- **Won't Have (this time):** Fonctionnalités hors scope pour ce projet

### Estimation Fibonacci

- **1 point:** < 2h (fix bug, petite UI)
- **2 points:** 2-4h (composant simple)
- **3 points:** 4-8h (écran complet)
- **5 points:** 1-2 jours (feature avec backend)
- **8 points:** 2-3 jours (feature complexe)
- **13 points:** Trop gros → à diviser en plusieurs stories

### Contacts et ressources

- **Scrum Master:** Rima Nafougui
- **Developers:** Jimmy Chhan, Charly Smith Alcide, Julien Guibord
- **Repository GitHub:** https://github.com/Mercuryy200/MealMatch
- **GitHub Projects:** https://github.com/users/Mercuryy200/projects/7
- **Documentation Spoonacular:** https://spoonacular.com/food-api/docs
- **Documentation Supabase:** https://supabase.com/docs

---

**Document créé le:** 30-01-2026  
**Dernière mise à jour:** 30-01-2026
**Version:** 1.0
