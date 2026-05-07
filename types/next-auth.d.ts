import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    role?: "USER" | "ADMIN";
    phone?: string | null;
  }

  interface Session {
    user: {
      phone: string;
      id: string;
      role: "USER" | "ADMIN";
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "USER" | "ADMIN";
    phone?: string | null;
  }
}
