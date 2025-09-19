import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { env } from "@/env";

// Utility to set a flash message in a cookie
const setFlashError = (res: NextResponse, message: string) => {
  res.cookies.set("flash_error", message, {
    maxAge: 5, // 5 seconds
    path: "/",
    httpOnly: false,
  });
};

// Read environment variable to toggle auth
const LOGIN_REQUIRED = env.LOGIN_REQUIRED;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow root
  if (pathname === "/") return NextResponse.next();

  if (!LOGIN_REQUIRED) {
    // If login not required, allow all routes
    return NextResponse.next();
  }

  // Get user token
  const token = await getToken({
    req: request,
    secret: env.AUTH_SECRET,
    cookieName: "next-auth.session-token",
  });

  // Guest-only pages: /admin/login and /team/login
  if (pathname === "/admin/login") {
    if (token?.role === "ADMIN") {
      const res = NextResponse.redirect(new URL("/admin", request.url));
      setFlashError(res, "You are already logged in as admin.");
      return res;
    }
    return NextResponse.next();
  }

  if (pathname === "/team/login") {
    if (token?.role === "TEAM") {
      const res = NextResponse.redirect(new URL("/team", request.url));
      setFlashError(res, "You are already logged in as team.");
      return res;
    }
    return NextResponse.next();
  }

  // Admin routes: /admin/*
  if (pathname.startsWith("/admin")) {
    if (!token) {
      const res = NextResponse.redirect(new URL("/admin/login", request.url));
      setFlashError(res, "Please login to access admin routes.");
      return res;
    }
    if (token.role !== "ADMIN") {
      const res = NextResponse.redirect(new URL("/", request.url));
      setFlashError(res, "Access denied: Admins only.");
      return res;
    }
    return NextResponse.next();
  }

  // Team routes: /team/*
  if (pathname.startsWith("/team")) {
    if (!token) {
      const res = NextResponse.redirect(new URL("/team/login", request.url));
      setFlashError(res, "Please login to access team routes.");
      return res;
    }
    if (token.role !== "TEAM") {
      const res = NextResponse.redirect(new URL("/", request.url));
      setFlashError(res, "Access denied: Team members only.");
      return res;
    }
    return NextResponse.next();
  }

  // All other routes for guests
  if (!token) {
    const res = NextResponse.redirect(new URL("/admin/login", request.url));
    setFlashError(res, "Please login to access this page.");
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/login",
    "/team/login",
    "/admin/:path*",
    "/team/:path*",
  ],
};
