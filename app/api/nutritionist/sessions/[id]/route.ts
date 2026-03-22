import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabaseServer } from "@/utils/supabase-server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const supabase = getSupabaseServer();

    // Verify session belongs to user
    const { data: chatSession } = await supabase
      .from("nutritionist_sessions")
      .select("id")
      .eq("id", id)
      .eq("user_id", session.user.id)
      .single();

    if (!chatSession) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { data: messages, error } = await supabase
      .from("nutritionist_messages")
      .select("id, role, content, created_at")
      .eq("session_id", id)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return NextResponse.json({ messages: messages ?? [] });
  } catch (err) {
    console.error("Session GET error:", err);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { title } = await req.json();
    const supabase = getSupabaseServer();

    const { error } = await supabase
      .from("nutritionist_sessions")
      .update({ title })
      .eq("id", id)
      .eq("user_id", session.user.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Session PATCH error:", err);
    return NextResponse.json({ error: "Failed to update session" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const supabase = getSupabaseServer();

    const { error } = await supabase
      .from("nutritionist_sessions")
      .delete()
      .eq("id", id)
      .eq("user_id", session.user.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Session DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete session" }, { status: 500 });
  }
}
