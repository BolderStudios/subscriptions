import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import supabase from "@/utils/supabaseClient";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/billing",
  "/file-uploader",
  "/form",
  "/onboarding(.*)",
  "/connections(.*)",
  "/reviews(.*)",
  "/keywords(.*)",
  "/employee_mentions(.*)",
  "/product_feedback(.*)",
  "/review_us_page(.*)",
  "/templates(.*)",
]);

const isMainSite = (hostname) => {
  return (
    hostname === "localhost:3000" ||
    hostname === process.env.NEXT_PUBLIC_SITE_URL ||
    hostname === "www.getbrandarmor.com" ||
    hostname === "getbrandarmor.com"
  );
};

export default clerkMiddleware(async (auth, req) => {
  try {
    const url = req.nextUrl;
    // Get hostname of request (e.g. demo.vercel.pub, demo.localhost:3000)
    let hostname = req.headers.get("host") || "";

    const searchParams = req.nextUrl.searchParams.toString();
    // Get the pathname of the request (e.g. /, /about, /blog/first-post)
    const path = `${url.pathname}${
      searchParams.length > 0 ? `?${searchParams}` : ""
    }`;

    // Check if it's localhost or the main site
    if (isMainSite(hostname)) {
      if (isProtectedRoute(req)) {
        const { userId } = await auth();
        if (!userId) {
          console.log("No user ID, redirecting to sign-in");
          const signInUrl = new URL("/sign-in", req.url);
          signInUrl.searchParams.set("redirect_url", url.pathname);
          return NextResponse.redirect(signInUrl);
        }

        const { data } = await supabase
          .from("users")
          .select()
          .eq("clerk_id", userId)
          .single();

        const onboardingComplete = data?.is_onboarding_complete;
        if (!onboardingComplete && !url.pathname.startsWith("/onboarding")) {
          console.log("Redirecting to onboarding");
          return NextResponse.redirect(new URL("/onboarding", req.url));
        }
        if (onboardingComplete && url.pathname === "/onboarding") {
          console.log("Redirecting to dashboard");
          return NextResponse.redirect(new URL("/dashboard", req.url));
        }
      } else {
        console.log("Non-protected route");
      }

      return NextResponse.next();
    }

    // For subdomains, rewrite to the dynamic route
    console.log(`Rewriting to dynamic route: /${hostname}${path}`);
    return NextResponse.rewrite(new URL(`/${hostname}${path}`, req.url));
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.next();
  }
});

export const config = {
  matcher: ["/((?!.*\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
