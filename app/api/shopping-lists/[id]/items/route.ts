import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabaseServer } from "@/utils/supabase-server";

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
