// src/middleware.ts
import { getToken } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default async function middleware(req: any) {
  const token = await getToken({ req });
  const isAuthPage = req.nextUrl.pathname.startsWith("/auth/");

  // If the user is authenticated and trying to access auth pages, redirect to home
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // For admin routes, use withAuth middleware
  if (req.nextUrl.pathname.startsWith("/admin")) {
    return withAuth(req, {
      callbacks: {
        authorized: ({ token }) => token?.role === "admin",
      },
    });
  }

  // For protected routes, use withAuth middleware
  if (req.nextUrl.pathname.startsWith("/profile")) {
    return withAuth(req, {
      callbacks: {
        authorized: ({ token }) => !!token,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/auth/:path*", "/admin/:path*", "/profile/:path*"],
};
