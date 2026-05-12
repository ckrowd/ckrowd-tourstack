import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

// Auth gating is NOT done here — cookie presence does not mean the user is
// logged in. Real session validation happens in the [locale] layout via
// getSession(), which calls the backend on every protected request.
//
// We inject x-pathname so the layout server component can know which route is
// being accessed, and carry over all intlMiddleware response headers (rewrites,
// locale cookies) so locale routing is fully preserved.
export async function proxy(request: NextRequest) {
	const intlResponse = intlMiddleware(request);

	// Pass locale redirects through as-is (e.g. / → /en/)
	if (intlResponse.status >= 300 && intlResponse.status < 400) {
		return intlResponse;
	}

	// Inject x-pathname into the request so layout server components can read it
	const requestHeaders = new Headers(request.headers);
	requestHeaders.set("x-pathname", request.nextUrl.pathname);

	const response = NextResponse.next({ request: { headers: requestHeaders } });

	// Copy all intlMiddleware response headers (preserves locale rewrites etc.)
	intlResponse.headers.forEach((value, key) => {
		if (key.toLowerCase() !== "set-cookie") {
			response.headers.set(key, value);
		}
	});

	// Copy Set-Cookie values individually — getSetCookie() handles multiple
	// cookies correctly where a single get('set-cookie') would combine them
	const setCookies =
		typeof intlResponse.headers.getSetCookie === "function"
			? intlResponse.headers.getSetCookie()
			: intlResponse.headers.get("set-cookie")
				? [intlResponse.headers.get("set-cookie") as string]
				: [];
	for (const cookie of setCookies) {
		response.headers.append("set-cookie", cookie);
	}

	return response;
}

export const config = {
	matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
