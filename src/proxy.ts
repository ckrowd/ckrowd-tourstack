import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export async function proxy(request: NextRequest) {
	const intlResponse = intlMiddleware(request);

	// Pass locale redirects through as-is (e.g. / → /en/)
	if (intlResponse.status >= 300 && intlResponse.status < 400) {
		return intlResponse;
	}

	const response = NextResponse.next();

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
