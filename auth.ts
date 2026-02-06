import NextAuth, { CredentialsSignin } from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js";

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
          const { data: existingUser } = await supabase
            .from("profiles")
            .select("id, name, image, username")
            .ilike("email", user.email!)
            .single();

          let userId: string;

          if (existingUser) {
            userId = existingUser.id;

            if (!existingUser.username) {
              return `/auth/complete-signup?provider=${account.provider}`;
            }

            console.log(
              `Linking ${account.provider} to existing user ${userId}`,
            );

            if (!existingUser.name && user.name) {
              await supabase
                .from("profiles")
                .update({
                  name: user.name,
                  image: user.image,
                  updated_at: new Date().toISOString(),
                })
                .eq("id", userId);
            }
          } else {
            console.log("Profile not found. Creating new user...");

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
              if (
                authError.code === "email_exists" ||
                authError.status === 422
              ) {
                console.error("User exists in Auth but not Profiles");
                return false;
              } else {
                console.error("Error creating auth user:", authError);
                return false;
              }
            } else {
              userId = authData.user.id;
            }

            const { error: profileError } = await supabase
              .from("profiles")
              .insert({
                id: userId,
                email: user.email!,
                name: user.name,
                username: null,
                image: user.image,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });

            if (profileError) {
              console.error("Error creating profile:", profileError);
              return false;
            }

            return `/auth/complete-signup?provider=${account.provider}`;
          }

          const { error: accountError } = await supabase
            .from("accounts")
            .upsert(
              {
                user_id: userId,
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
            console.error("Error linking account:", accountError);
            return false;
          }

          user.id = userId;
          return true;
        } catch (error) {
          console.error("Error in signIn callback:", error);
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
          .select("name, image")
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
