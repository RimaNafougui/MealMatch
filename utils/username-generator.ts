import { getSupabaseServer } from "./supabase-server";

export async function generateUniqueUsername(
  name: string | null | undefined,
  email: string | null | undefined,
): Promise<string> {
  const supabase = getSupabaseServer();

  if (!email) {
    return `user_${Date.now().toString().slice(-8)}`;
  }

  let baseUsername: string;

  if (name) {
    baseUsername = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "");
  } else {
    baseUsername = email
      .split("@")[0]
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "");
  }

  if (baseUsername.length < 3) {
    baseUsername = `user_${baseUsername}`;
  }

  if (baseUsername.length > 25) {
    baseUsername = baseUsername.substring(0, 25);
  }

  const { data: existingUser } = await supabase
    .from("profiles")
    .select("id")
    .ilike("username", baseUsername)
    .single();

  if (!existingUser) {
    return baseUsername;
  }

  let attempts = 0;
  let uniqueUsername = baseUsername;

  while (attempts < 10) {
    const randomNum = Math.floor(Math.random() * 9999) + 1;
    uniqueUsername = `${baseUsername}_${randomNum}`;

    const { data: duplicate } = await supabase
      .from("profiles")
      .select("id")
      .ilike("username", uniqueUsername)
      .single();

    if (!duplicate) {
      return uniqueUsername;
    }

    attempts++;
  }

  return `${baseUsername}_${Date.now().toString().slice(-6)}`;
}
