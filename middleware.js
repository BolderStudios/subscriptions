import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard",
  "/billing",
  "/onboarding",
  "/file-uploader",
]);

export default clerkMiddleware((auth, req) => {
  const url = req.nextUrl;
  const hostname = req.headers.get("host") || "";
  console.log("hostname:", hostname);

  // Check for subdomains
  if (hostname.startsWith('admin.')) {
    // Rewrite for admin subdomain
    return NextResponse.rewrite(new URL(`/admin${url.pathname}`, req.url));
  }

  // Handle protected routes
  const { userId, sessionClaims } = auth();
  if (isProtectedRoute(req)) {
    if (!userId) {
      const signInUrl = new URL("/sign-in", req.url);
      return NextResponse.redirect(signInUrl);
    }
    // Check if onboarding is complete
    const onboardingComplete = sessionClaims?.metadata?.onboardingComplete;
    if (!onboardingComplete && url.pathname !== "/onboarding") {
      const onboardingUrl = new URL("/onboarding", req.url);
      return NextResponse.redirect(onboardingUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};