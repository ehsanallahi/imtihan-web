import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import authConfig from "./auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.id || !user.hashedPassword) return null

        const isValid = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        )

        if (!isValid) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
        token.email = user.email;
      }
      if (trigger === "update" && session) {
        if (session.impersonating && session.targetUser) {
          // Store original admin ID if not already stored
          if (!token.originalId) {
            token.originalId = token.id;
            token.originalRole = token.role;
            token.originalName = token.name;
            token.originalEmail = token.email;
          }
          
          // Switch to target user
          token.id = session.targetUser.id;
          token.role = session.targetUser.role;
          token.name = session.targetUser.name;
          token.email = session.targetUser.email;
          token.isImpersonating = true;
        } else if (session.stopImpersonating && token.originalId) {
          // Revert back to admin
          token.id = token.originalId;
          token.role = token.originalRole;
          token.name = token.originalName;
          token.email = token.originalEmail;
          
          delete token.originalId;
          delete token.originalRole;
          delete token.originalName;
          delete token.originalEmail;
          delete token.isImpersonating;
        } else {
          // Normal updates
          if (session.role) token.role = session.role;
          if (session.name) token.name = session.name;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.isImpersonating = token.isImpersonating || false;
        session.user.originalId = token.originalId || null;
      }
      return session;
    },
  },
  debug: true, // Enable debug mode for more logs
})
