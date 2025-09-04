import { NextRequest, NextResponse } from "next/server";

// Exclude these because they are not dynamic
const EXCLUDED_PATHS = [
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
  "/manifest.json",
  "/firebase-messaging-sw.js",
  "/service-worker.js",
];

// Exclude these because we don't want to interfere with 3rd party services
const EXCLUDED_PREFIXES = [
  "/api/",
  "/_next/",
  "/static/",
  "/public/",
  "/assets/",
  "/images",
];

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const pathname = url.pathname;

  // Skip excluded exact paths
  if (EXCLUDED_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // Skip if path starts with any excluded prefix
  if (EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/:path*", // Apply middleware to all paths, exclude on the middleware() function
};
