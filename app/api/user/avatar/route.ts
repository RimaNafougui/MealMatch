import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSupabaseServer } from "@/utils/supabase-server";
import { cacheDel, CacheKey } from "@/utils/redis";

const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// POST — upload avatar to Supabase Storage and update profiles.image
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const formData = await req.formData();
    const file = formData.get("avatar") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Format non supporté. Utilise JPG, PNG, WebP ou GIF." },
        { status: 400 },
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Le fichier dépasse la limite de 2 Mo." },
        { status: 400 },
      );
    }

    const ext = file.type.split("/")[1].replace("jpeg", "jpg");
    const path = `${userId}/avatar.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const supabase = getSupabaseServer();

    // Upload to Supabase Storage (bucket: avatars — must be created first)
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, buffer, {
        contentType: file.type,
        upsert: true, // overwrite existing avatar
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json({ error: "Erreur lors de l'upload" }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
    const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`; // cache-bust

    // Save the URL to the profiles table
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ image: publicUrl })
      .eq("id", userId);

    if (updateError) {
      console.error("Profile update error:", updateError);
      return NextResponse.json({ error: "Erreur lors de la mise à jour du profil" }, { status: 500 });
    }

    // Bust profile cache
    await cacheDel(CacheKey.userProfile(userId));

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (err) {
    console.error("POST /api/user/avatar error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
