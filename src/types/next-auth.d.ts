import "next-auth";

declare module "next-auth" {
  interface User {
    id?: string;
    username?: string;
    role?: string;
    avatar?: string;
  }

  interface Session {
    user: User & {
      id: string;
      username: string;
      role: string;
      avatar?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    username?: string;
    role?: string;
    avatar?: string;
  }
}
