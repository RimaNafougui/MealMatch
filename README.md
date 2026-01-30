## MealMatch

Application qui génère des plans de repas hebdomadaires adaptés au budget étudiant,
avec recettes faciles, liste d'épicerie automatique et suivi nutritionnel.

## Tech Stack

- Frontend: Next.js ( TypeScript)
- Styling: Tailwind
- Database: Supabase
- Authentification: OAuth , NextAuth (Google , Apple , Github)
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

## Documentation API: Spoonacular

- Chercher une recette (sans instructions):
ex: https://api.spoonacular.com/recipes/complexSearch?apiKey=XXXX&query=pasta&number=2 (donnera 2 recettes de pattes)

- Chercher un video youtube:
ex: https://api.spoonacular.com/food/videos/search?apiKey=XXXX&query=pasta&number=1 (donnera 1 video de recette de pâte)

- Chercher une recette spécifique avec instructions de preparation:
ex: https://api.spoonacular.com/recipes/{id de la recette}/analyzedInstructions?apiKey=XXXX

- Chercher une recette avec des spécification sur les nutriments:
ex: https://api.spoonacular.com/recipes/findByNutrients?minCarbs=10&maxCarbs=50&number=3&apiKey=XXXX (donnera 3 recettes avec minimum 10g carbs et maximum 50g carbs)

-Chercher une recette avec des spécification sur les ingrédients:

ex: https://api.spoonacular.com/recipes/findByIngredients?ingredients=apples,+flour,+sugar&number=2&apiKey=XXXX (donnera 2 recettes incluant les ingrédients pomme, farine sucre)

## Tree

## Sources

- https://spoonacular.com/food-api
- https://nextjs.org/docs
- https://tailwindcss.com/
- https://supabase.com/docs
- https://next-auth.js.org/
- https://tanstack.com/query/latest
- https://docs.stripe.com/

