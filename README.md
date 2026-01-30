# MealMatch

Application qui génère des plans de repas hebdomadaires adaptés au budget étudiant,
avec recettes faciles, liste d'épicerie automatique et suivi nutritionnel.

## Tech Stack

- Frontend: Next.js (TypeScript)
- Styling: Tailwind
- Database: Supabase
- Authentification: OAuth , NextAuth (Google , Apple)
- API Recipe: Spoonacular API.
- State Management: TanStack Query
- Payments: Stripe
- Caching: Redis (Optional)

## Developper / contributeur

- **Rima Nafougui** - Scrum Master 
- **Jimmy Chhan** - Développeur 1 
- **Charly Smith Alcide** - Développeur 2 
- **Julien Guibord** - Développeur 3/Testeur

## Fonctionnalités

- Calculer et afficher le prix du/des repas suggéré(s) 
- Configuration du profil de l’utilisateur (budget, préférences restrictions alimentaires) 
- Possibilité de générer une seule recette ou un planning pour la semaine. 
- Pouvoir mesurer la valeur nutritionnelle d’un repas. 
- Pouvoir mettre une recette en favoris. 
- Pouvoir partager une recette en lien URL 
- Génération de menus selon le budget
- Pouvoir générer une liste d'épicerie
- Filtres : végétarien, sans gluten, allergies, etc.
- Vidéo de recette rapide 

## Tree

# Documentation

## Next.js
Next.js est utilisé pour :

- Gérer le routing (dashboard, recettes, favoris, profil)

- Afficher les pages rapidement et SEO-friendly

- Intégrer les API routes pour Stripe ou Supabase

- Supporter le fetching côté serveur et la génération dynamique de menus et recettes

## API Spoonacular
Spoonacular API est utilisée pour rechercher des recettes, obtenir les instructions et vidéos, calculer les valeurs nutritionnelles et générer des listes d’épicerie adaptées au budget et aux préférences de l’utilisateur.

- Chercher une recette (sans instructions):
ex: https://api.spoonacular.com/recipes/complexSearch?apiKey=XXXX&query=pasta&number=2 (donnera 2 recettes de pâtes)

- Chercher un video youtube:
ex: https://api.spoonacular.com/food/videos/search?apiKey=XXXX&query=pasta&number=1 (donnera 1 video de recette de pâtes)

- Chercher une recette spécifique avec instructions de preparation:
ex: https://api.spoonacular.com/recipes/{id de la recette}/analyzedInstructions?apiKey=XXXX

- Chercher une recette avec des spécification sur les nutriments:
ex: https://api.spoonacular.com/recipes/findByNutrients?minCarbs=10&maxCarbs=50&number=3&apiKey=XXXX (donnera 3 recettes avec minimum 10g carbs et maximum 50g carbs)

- Chercher une recette avec des spécification sur les ingrédients:
ex: https://api.spoonacular.com/recipes/findByIngredients?ingredients=apples,+flour,+sugar&number=2&apiKey=XXXX (donnera 2 recettes incluant les ingrédients pomme, farine sucre)

## TanStack Query
TanStack Query est utilisé pour gérer les appels à l’API Spoonacular et à Supabase, en assurant un cache intelligent des recettes, une interface réactive et une synchronisation automatique après les actions de l’utilisateur (favoris, menus, etc.).

## NextAuth
NextAuth est utilisé pour permettre aux utilisateurs de se connecter via Google, Apple ou GitHub et pour sécuriser l’accès aux fonctionnalités personnalisées comme les favoris, les menus et les paiements.

## SupaBase
Supabase est utilisé comme backend pour stocker les données utilisateurs (favoris, menus, préférences) et sécuriser l’accès aux données via des règles de permissions.

## Tailwind
Tailwind CSS est utilisé pour styliser l’interface utilisateur de manière rapide, cohérente et responsive, sans avoir recours à de gros fichiers CSS personnalisés.

## Stripe
Stripe permet aux utilisateurs de souscrire à des abonnements premium pour accéder à des menus spéciaux ou des fonctionnalités exclusives, tout en sécurisant les transactions.

## Redis (optionnel)
Redis permetterai de mettre en cache les recettes et menus pour que les utilisateurs obtiennent leurs résultats plus rapidement et que l’application reste fluide même avec beaucoup de requêtes.

## Sources

- https://spoonacular.com/food-api
- https://nextjs.org/docs
- https://tailwindcss.com/
- https://supabase.com/docs
- https://next-auth.js.org/
- https://tanstack.com/query/latest
- https://docs.stripe.com/

