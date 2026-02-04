import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

class EmailNotVerifiedError extends Error {
  code = "EmailNotVerified";
  constructor() {
    super("Email not verified");
    this.name = "EmailNotVerifiedError";
  }
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
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
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email as string,
            password: credentials.password as string,
          });

          if (error) {
            if (error.message.includes("Email not confirmed")) {
              throw new EmailNotVerifiedError();
            }
            return null;
          }

          if (!data.user) return null;

          const { data: existingUser } = await supabase
            .from("profiles")
            .select("id, email, username, image")
            .eq("email", data.user.email!)
            .single();

          if (existingUser) {
            return {
              id: existingUser.id,
              email: existingUser.email,
              name: existingUser.username,
              image: existingUser.image,
            };
          }

          return {
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata?.name || null,
            image: data.user.user_metadata?.avatar_url || null,
          };
        } catch (error) {
          if (error instanceof EmailNotVerifiedError) {
            throw error;
          }
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "github" || account?.provider === "google") {
        try {
          console.log("🔍 OAuth sign in for:", user.email);

          // ✅ Étape 1 : Vérifier si l'utilisateur existe déjà dans profiles
          const { data: existingProfile } = await supabase
            .from("profiles")
            .select("id, username, image")
            .eq("email", user.email!)
            .single();

          let userId: string;

          if (existingProfile) {
            // L'utilisateur existe déjà
            console.log("✅ User exists:", existingProfile.id);
            userId = existingProfile.id;

            // Mettre à jour le profil si nécessaire
            if (!existingProfile.username && user.name) {
              await supabase
                .from("profiles")
                .update({
                  username: user.name,
                  image: user.image,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", userId);
            }
          } else {
            // ✅ Étape 2 : Créer l'utilisateur dans Supabase Auth d'abord
            console.log("🔍 Creating new user in Supabase Auth...");

            const { data: authData, error: authError } =
              await supabase.auth.admin.createUser({
                email: user.email!,
                email_confirm: true,
                user_metadata: {
                  name: user.name,
                  avatar_url: user.image,
                  provider: account.provider,
                },
              });

            if (authError || !authData.user) {
              console.error("❌ Error creating auth user:", authError);
              return false;
            }

            userId = authData.user.id;
            console.log("✅ Auth user created:", userId);

            // ✅ Étape 3 : Créer le profil avec le bon ID
            console.log("🔍 Creating profile...");
            const { error: profileError } = await supabase
              .from("profiles")
              .insert({
                id: userId, // ✅ ID de Supabase Auth
                email: user.email!,
                username: user.name,
                image: user.image,
              });

            if (profileError) {
              console.error("❌ Error creating profile:", profileError);
              return false;
            }
            console.log("✅ Profile created");
          }

          // ✅ Étape 4 : Lier le compte OAuth
          console.log("🔍 Linking OAuth account...");
          const { error: accountError } = await supabase
            .from("accounts")
            .upsert(
              {
                user_id: userId, // ✅ ID de Supabase, pas de Google/GitHub
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
              {
                onConflict: "provider,provider_account_id",
              },
            );

          if (accountError) {
            console.error("❌ Error linking account:", accountError);
            return false;
          }

          console.log("✅ OAuth account linked successfully");
          (user as any).id = userId;
          return true;
        } catch (error) {
          console.error("❌ Exception in signIn callback:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = (user as any).id;
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
        try {
          const { data: userData } = await supabase
            .from("profiles")
            .select("username, image")
            .eq("id", token.id as string)
            .single();

          if (userData) {
            token.name = userData.username;
            token.picture = userData.image;
          }
        } catch (error) {
          console.error("Error fetching user data in JWT callback:", error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
