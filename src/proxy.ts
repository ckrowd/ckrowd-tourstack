import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export async function proxy(request: NextRequest) {
	// Server action POSTs (Next-Action header) must reach the Next.js server
	// without any locale redirect. Running intlMiddleware on them can cause a
	// 404 because next-intl is designed for navigation requests, not mutations.
	if (request.headers.has("Next-Action")) {
		return NextResponse.next();
	}

	const intlResponse = intlMiddleware(request);

	// Pass locale redirects through as-is (e.g. / → /en/)
	if (intlResponse.status >= 300 && intlResponse.status < 400) {
		return intlResponse;
	}

	// Exposes the current path (incl. query) to Server Components via
	// headers() so layouts can build a `?from=` redirect back after login.
	const requestHeaders = new Headers(request.headers);
	requestHeaders.set("x-pathname", request.nextUrl.pathname + request.nextUrl.search);
	const response = NextResponse.next({ request: { headers: requestHeaders } });

	intlResponse.headers.forEach((value, key) => {
		if (key.toLowerCase() !== "set-cookie") {
			response.headers.set(key, value);
		}
	});

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
