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
      if (pathname === "/checkout") return isLoggedIn;
      return true;
    },
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
        token.role = user.role ?? "USER";
        token.phone = user.phone ?? "";
      }
      if (trigger === "update" && session?.user) {
        token.name = session.user.name ?? token.name;
        token.picture = session.user.image ?? token.picture;
        token.phone = session.user.phone ?? token.phone;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.name = token.name ?? null;
        session.user.email = token.email ?? "";
        session.user.image = token.picture ?? null;
        session.user.role = token.role ?? "USER";
        session.user.phone = token.phone ?? "";
      }
      return session;
    }
  },
  providers: []
} satisfies NextAuthConfig;
