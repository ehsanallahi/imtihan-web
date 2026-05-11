export default {
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      // In middleware, the role might be directly on the user object or the token
      const role = auth?.user?.role || auth?.role;
      const { pathname } = nextUrl;
      
      const isAdminPath = pathname.startsWith("/admin");
      const isOnDashboard = pathname.startsWith("/dashboard");
      const isOnAuth = pathname.startsWith("/auth");

      const adminRoles = ["super_admin", "moderator", "marketer", "content_editor", "finance_manager", "support_agent", "institution_admin", "admin"];
      const isAdmin = isLoggedIn && role && adminRoles.includes(role);

      if (isAdminPath) {
        if (isAdmin) return true;
        if (isLoggedIn) return Response.redirect(new URL("/dashboard", nextUrl));
        return false; // Redirect to login
      }

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false;
      }

      if (isOnAuth) {
        if (isLoggedIn) {
          if (isAdmin) return Response.redirect(new URL("/admin", nextUrl));
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }

      return true;
    },
  },
  providers: [], // Add providers with an empty array for now
};
