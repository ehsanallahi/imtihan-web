import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "jsmith@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        // This is a placeholder for actual authentication logic.
        // For now, it returns a demo user if fields are provided.
        if (credentials?.email && credentials?.password) {
          return { id: "1", name: "Demo User", email: credentials.email };
        }
        return null;
      }
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/signin", // You can customize this later
  },
};
