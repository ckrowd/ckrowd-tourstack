import { type NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL ?? "http://localhost:3001";

/**
 * Proxy for Google OAuth initiation.
 *
 * Using a Route Handler instead of a server action means we can forward the
 * Set-Cookie headers from the backend (which include Domain=.ckrowd.com)
 * directly to the browser — bypassing Next.js's cookie() jar which strips
 * the domain attribute and scopes cookies to tourstack.ckrowd.com only.
 *
 * The OAuth state cookie MUST reach gateway.ckrowd.com during the callback,
 * so it needs Domain=.ckrowd.com. This route makes that possible.
 */
export async function POST(request: NextRequest) {
	const body = await request.json();

	const backendResponse = await fetch(`${API_URL}/auth/sign-in/social`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Cookie: request.headers.get("cookie") ?? "",
		},
		body: JSON.stringify(body),
	});

	const data = await backendResponse.json();
	const response = NextResponse.json(data, { status: backendResponse.status });

	// Forward Set-Cookie headers from the backend directly to the browser.
	// This preserves Domain=.ckrowd.com so the state cookie is accessible
	// from gateway.ckrowd.com when Google redirects to the OAuth callback.
	const rawCookies =
		typeof (backendResponse.headers as unknown as { getSetCookie?: () => string[] })
			.getSetCookie === "function"
			? (
					backendResponse.headers as unknown as { getSetCookie: () => string[] }
				).getSetCookie()
			: [];

	for (const cookie of rawCookies) {
		response.headers.append("Set-Cookie", cookie);
	}

	return response;
}
