import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/utils/supabase-server";

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabaseServer();
    const searchParams = req.nextUrl.searchParams;

    const search = searchParams.get("search") || "";
    const dietaryTags =
      searchParams.get("dietary_tags")?.split(",").filter(Boolean) || [];
    const maxPrepTime = searchParams.get("max_prep_time");
    const maxCalories = searchParams.get("max_calories");
    const minCalories = searchParams.get("min_calories");
    const maxPrice = searchParams.get("max_price");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    const offset = (page - 1) * limit;

    let query = supabase
      .from("recipes_catalog")
      .select("*", { count: "exact" });

    if (search) {
      query = query.ilike("title", `%${search}%`);
    }

    if (dietaryTags.length > 0) {
      query = query.contains("dietary_tags", dietaryTags);
    }

    if (maxPrepTime) {
      query = query.lte("prep_time", parseInt(maxPrepTime));
    }

    if (minCalories) {
      query = query.gte("calories", parseInt(minCalories));
    }
    if (maxCalories) {
      query = query.lte("calories", parseInt(maxCalories));
    }

    if (maxPrice) {
      query = query.lte("price_per_serving", parseFloat(maxPrice));
    }

    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data: recipes, error, count } = await query;

    if (error) {
      console.error("Error fetching recipes:", error);
      return NextResponse.json(
        { error: "Failed to fetch recipes" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      recipes: recipes || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Recipe fetch error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
