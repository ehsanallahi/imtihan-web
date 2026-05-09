export default {
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;
      const isAdminPath = nextUrl.pathname.startsWith("/admin");
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnAuth = nextUrl.pathname.startsWith("/auth");

      const adminRoles = ["super_admin", "moderator", "marketer", "content_editor", "finance_manager", "support_agent"];

      if (isAdminPath) {
        if (isLoggedIn && adminRoles.includes(role)) return true;
        return Response.redirect(new URL("/auth/signin", nextUrl));
      }

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isOnAuth) {
        if (isLoggedIn) {
          const adminRoles = ["super_admin", "moderator", "marketer", "content_editor", "finance_manager", "support_agent"];
          if (adminRoles.includes(role)) {
            return Response.redirect(new URL("/admin", nextUrl));
          }
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }
      return true;
    },
  },
  providers: [], // Add providers with an empty array for now
};
