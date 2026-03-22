import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabaseServer } from "@/utils/supabase-server";

// POST - add a custom item
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: listId } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { itemName, aisle } = await req.json();

    if (!itemName || typeof itemName !== "string" || itemName.trim().length === 0) {
      return NextResponse.json({ error: "Item name is required" }, { status: 400 });
    }
    if (itemName.trim().length > 100) {
      return NextResponse.json({ error: "Item name must be 100 characters or less" }, { status: 400 });
    }

    const supabase = getSupabaseServer();

    const { data: list, error: fetchError } = await supabase
      .from("shopping_lists")
      .select("*")
      .eq("id", listId)
      .eq("user_id", session.user.id)
      .single();

    if (fetchError || !list) {
      return NextResponse.json({ error: "Shopping list not found" }, { status: 404 });
    }

    const newItem = {
      name: itemName.trim(),
      quantity: 1,
      unit: "",
      price: null,
      checked: false,
      aisle: aisle || "Autres",
      emoji: null,
      custom: true,
    };

    const updatedItems = [...list.items, newItem];

    const { data: updated, error: updateError } = await supabase
      .from("shopping_lists")
      .update({ items: updatedItems, updated_at: new Date().toISOString() })
      .eq("id", listId)
      .eq("user_id", session.user.id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json(updated);
  } catch (err) {
    console.error("POST /api/shopping-lists/[id]/items error:", err);
    return NextResponse.json({ error: "Failed to add item" }, { status: 500 });
  }
}

// DELETE - remove a custom item by index
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: listId } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { itemIndex } = await req.json();

    const supabase = getSupabaseServer();

    const { data: list, error: fetchError } = await supabase
      .from("shopping_lists")
      .select("*")
      .eq("id", listId)
      .eq("user_id", session.user.id)
      .single();

    if (fetchError || !list) {
      return NextResponse.json({ error: "Shopping list not found" }, { status: 404 });
    }

    const item = list.items[itemIndex];
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    if (!(item as any).custom) {
      return NextResponse.json({ error: "Only custom items can be deleted" }, { status: 403 });
    }

    const updatedItems = list.items.filter((_: any, i: number) => i !== itemIndex);

    const { data: updated, error: updateError } = await supabase
      .from("shopping_lists")
      .update({ items: updatedItems, updated_at: new Date().toISOString() })
      .eq("id", listId)
      .eq("user_id", session.user.id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json(updated);
  } catch (err) {
    console.error("DELETE /api/shopping-lists/[id]/items error:", err);
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}

// PATCH - toggle a shopping list item checked state
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: listId } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { itemIndex, checked } = await req.json();

    const supabase = getSupabaseServer();

    // Fetch current list
    const { data: list, error: fetchError } = await supabase
      .from("shopping_lists")
      .select("*")
      .eq("id", listId)
      .eq("user_id", session.user.id)
      .single();

    if (fetchError || !list) {
      return NextResponse.json({ error: "Shopping list not found" }, { status: 404 });
    }

    // Update the specific item
    const updatedItems = [...list.items];
    if (itemIndex < 0 || itemIndex >= updatedItems.length) {
      return NextResponse.json({ error: "Invalid item index" }, { status: 400 });
    }
    updatedItems[itemIndex] = { ...updatedItems[itemIndex], checked };

    // Check if all items are checked → mark list completed
    const allChecked = updatedItems.every((item: any) => item.checked);

    const { data: updated, error: updateError } = await supabase
      .from("shopping_lists")
      .update({
        items: updatedItems,
        is_completed: allChecked,
        completed_at: allChecked ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", listId)
      .eq("user_id", session.user.id)
      .select()
      .single();

    if (updateError) throw updateError;

    return NextResponse.json(updated);
  } catch (err) {
    console.error("PATCH /api/shopping-lists/[id]/items error:", err);
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}
