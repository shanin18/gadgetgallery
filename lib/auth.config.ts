import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login"
  },
  session: {
    strategy: "jwt"
  },
  callbacks: {
    authorized({ auth, request }) {
      const pathname = request.nextUrl.pathname;
      const isLoggedIn = Boolean(auth?.user);
      const role = auth?.user?.role;

      if (pathname.startsWith("/admin")) return isLoggedIn && role === "ADMIN";
      if (pathname.startsWith("/account")) return isLoggedIn;
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = user.role ?? "USER";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = token.role ?? "USER";
      }
      return session;
    }
  },
  providers: []
} satisfies NextAuthConfig;
