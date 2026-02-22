import NextAuth, { CredentialsSignin } from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";
import { generateUniqueUsername } from "@/utils/username-generator";

// Dedicated Supabase admin client for auth.ts (module-level singleton).
// This file runs in the NextAuth server context; it intentionally uses its
// own client rather than getSupabaseServer() to keep auth concerns isolated.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

class EmailNotVerifiedError extends CredentialsSignin {
  code = "EmailNotVerified";
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      credentials: {
        email: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // `credentials.email` may be a resolved email (sent by LoginForm after
          // the pre-flight check) or a raw username if called directly. Handle both.
          let emailToUse = (credentials.email as string).trim().toLowerCase();

          const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailToUse);
          if (!isEmail) {
            // Resolve username → email via profiles table
            const { data: profile } = await supabase
              .from("profiles")
              .select("email")
              .ilike("username", emailToUse)
              .single();
            if (!profile?.email) return null;
            emailToUse = profile.email;
          }

          const { data, error } = await supabase.auth.signInWithPassword({
            email: emailToUse,
            password: credentials.password as string,
          });

          if (error) {
            if (
              error.message.includes("Email not confirmed") ||
              error.message.includes("email not confirmed") ||
              error.code === "email_not_confirmed"
            ) {
              throw new EmailNotVerifiedError();
            }
            return null;
          }

          if (!data.user) return null;

          // Fetch the profile record to get our app-level user id/name/image.
          const { data: existingUser } = await supabase
            .from("profiles")
            .select("id, email, name, image")
            .eq("email", data.user.email!)
            .single();

          if (existingUser) {
            return {
              id: existingUser.id,
              email: existingUser.email,
              name: existingUser.name,
              image: existingUser.image,
            };
          }

          return {
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata?.name || null,
            image: data.user.user_metadata?.image || null,
          };
        } catch (error) {
          if (error instanceof EmailNotVerifiedError) {
            throw error; // must propagate so NextAuth surfaces the code
          }
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "github" || account?.provider === "google") {
        try {
          // ── 1. Check if a profile already exists for this email ──────────
          const { data: existingProfile, error: profileCheckError } =
            await supabase
              .from("profiles")
              .select("id, username, name, image")
              .ilike("email", user.email!)
              .single();

          if (profileCheckError && profileCheckError.code !== "PGRST116") {
            console.error("[auth] Error checking profile:", profileCheckError.message);
            return false;
          }

          let userId: string;

          if (existingProfile) {
            userId = existingProfile.id;

            // Update profile if name/image changed in the OAuth provider.
            if (
              (user.name && user.name !== existingProfile.name) ||
              (user.image && user.image !== existingProfile.image)
            ) {
              await supabase
                .from("profiles")
                .update({
                  name: user.name,
                  image: user.image,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", userId);
            }

            user.id = userId;
          } else {
            // ── 2. No profile — check auth.users by email (filtered listUsers) ─
            const { data: authUsersData, error: authUserError } =
              await supabase.auth.admin.listUsers({ filter: `email=${user.email!}` } as any);

            if (authUserError) {
              console.error("[auth] Error fetching auth user:", authUserError.message);
              return false;
            }

            const existingAuthUser = authUsersData?.users?.find(
              (u) => u.email?.toLowerCase() === user.email?.toLowerCase(),
            );

            if (existingAuthUser) {
              // Auth user exists but profile is missing — create it.
              userId = existingAuthUser.id;
              const autoUsername = await generateUniqueUsername(user.name, user.email!);

              const { error: profileInsertError } = await supabase
                .from("profiles")
                .insert({
                  id: userId,
                  email: user.email!,
                  name: user.name,
                  username: autoUsername,
                  image: user.image,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                });

              if (profileInsertError) {
                console.error("[auth] Error creating profile:", profileInsertError.message);
                return false;
              }
            } else {
              // ── 3. New user entirely — create auth user + profile ────────
              const { data: authData, error: authError } =
                await supabase.auth.admin.createUser({
                  email: user.email!,
                  email_confirm: true,
                  user_metadata: {
                    name: user.name,
                    avatar_url: user.image,
                  },
                });

              if (authError) {
                console.error("[auth] Error creating auth user:", authError.message);
                return false;
              }

              userId = authData.user.id;
              const autoUsername = await generateUniqueUsername(user.name, user.email!);

              const { error: profileError } = await supabase
                .from("profiles")
                .insert({
                  id: userId,
                  email: user.email!,
                  name: user.name,
                  username: autoUsername,
                  image: user.image,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                });

              if (profileError) {
                console.error("[auth] Error creating profile:", profileError.message);
                return false;
              }
            }

            user.id = userId;
          }

          // ── 4. Upsert the OAuth account link ────────────────────────────
          const { error: accountError } = await supabase
            .from("accounts")
            .upsert(
              {
                user_id: userId!,
                type: account.type,
                provider: account.provider,
                provider_account_id: account.providerAccountId,
                refresh_token: account.refresh_token,
                access_token: account.access_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
                session_state: account.session_state,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              { onConflict: "provider,provider_account_id" },
            );

          if (accountError) {
            console.error("[auth] Error linking OAuth account:", accountError.message);
          }

          return true;
        } catch (error) {
          console.error("[auth] Unexpected error in signIn callback:", error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }

      if (trigger === "update" && session) {
        token.name = session.user.name;
        token.picture = session.user.image;
        return token;
      }

      if (token.id) {
        const { data: userData } = await supabase
          .from("profiles")
          .select("name, image, username")
          .eq("id", token.id as string)
          .single();

        if (userData) {
          token.name = userData.name;
          token.picture = userData.image;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  trustHost: true,
});
