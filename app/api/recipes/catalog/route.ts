import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/utils/supabase-server";
import { withCache, CacheKey, TTL } from "@/utils/redis";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;

    const search      = searchParams.get("search") || "";
    const dietaryTags = searchParams.get("dietary_tags")?.split(",").filter(Boolean) || [];
    const intolerances = searchParams.get("intolerances")?.split(",").filter(Boolean) || [];
    const maxPrepTime = searchParams.get("max_prep_time");
    const maxCalories = searchParams.get("max_calories");
    const minCalories = searchParams.get("min_calories");
    const maxPrice    = searchParams.get("max_price");
    const minServings = searchParams.get("min_servings");
    const maxServings = searchParams.get("max_servings");
    const mealType    = searchParams.get("meal_type");
    const page        = parseInt(searchParams.get("page") || "1");
    const limit       = parseInt(searchParams.get("limit") || "12");

    // Build a stable cache key from all query params (sorted for consistency)
    const cacheParams = new URLSearchParams({
      search, page: String(page), limit: String(limit),
      ...(dietaryTags.length  ? { dietary_tags: dietaryTags.sort().join(",") }  : {}),
      ...(intolerances.length ? { intolerances: intolerances.sort().join(",") } : {}),
      ...(maxPrepTime ? { max_prep_time: maxPrepTime } : {}),
      ...(maxCalories ? { max_calories: maxCalories } : {}),
      ...(minCalories ? { min_calories: minCalories } : {}),
      ...(maxPrice    ? { max_price: maxPrice }        : {}),
      ...(minServings ? { min_servings: minServings }  : {}),
      ...(maxServings ? { max_servings: maxServings }  : {}),
      ...(mealType    ? { meal_type: mealType }        : {}),
    }).toString();

    const result = await withCache(
      CacheKey.catalog(cacheParams),
      TTL.CATALOG,
      async () => {
        const supabase = getSupabaseServer();
        const offset = (page - 1) * limit;

        let query = supabase
          .from("recipes_catalog")
          .select("*", { count: "exact" });

        if (search) {
          query = query.ilike("title", `%${search}%`);
        }

        // Combine dietary tags + meal type into one contains filter
        const allTags = [...dietaryTags];
        if (mealType) allTags.push(mealType);
        if (allTags.length > 0) {
          query = query.contains("dietary_tags", allTags);
        }

        if (intolerances.length > 0) {
          const intoleranceTagMap: Record<string, string> = {
            dairy:      "dairy free",
            gluten:     "gluten free",
            grain:      "grain free",
            peanut:     "peanut free",
            seafood:    "seafood free",
            sesame:     "sesame free",
            shellfish:  "shellfish free",
            soy:        "soy free",
            sulfite:    "sulfite free",
            "tree nut": "tree nut free",
            wheat:      "wheat free",
            egg:        "egg free",
          };
          const freeTagsRequired = intolerances
            .map((i) => intoleranceTagMap[i])
            .filter(Boolean);
          if (freeTagsRequired.length > 0) {
            query = query.contains("dietary_tags", freeTagsRequired);
          }
        }

        if (maxPrepTime) query = query.lte("prep_time", parseInt(maxPrepTime));
        if (minCalories) query = query.gte("calories", parseInt(minCalories));
        if (maxCalories) query = query.lte("calories", parseInt(maxCalories));
        if (maxPrice)    query = query.lte("price_per_serving", parseFloat(maxPrice));
        if (minServings) query = query.gte("servings", parseInt(minServings));
        if (maxServings) query = query.lte("servings", parseInt(maxServings));

        query = query
          .order("created_at", { ascending: false })
          .range(offset, offset + limit - 1);

        const { data: recipes, error, count } = await query;

        if (error) {
          console.error("Error fetching recipes:", error);
          throw error;
        }

        return {
          recipes: recipes || [],
          pagination: {
            page,
            limit,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / limit),
          },
        };
      },
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Recipe fetch error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
