import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Generates an EOI PDF on demand by proxying to the backend's financing-admin
// or insurance-admin endpoint. The `portal` query param selects which admin
// portal's route to use (and therefore which guard applies).
export async function GET(
	_req: Request,
	context: { params: Promise<{ eoiId: string }> },
) {
	const { eoiId } = await context.params;
	const { searchParams } = new URL(_req.url);
	const portal = searchParams.get("portal");

	let backendPath: string;
	if (portal === "insurance") {
		backendPath = `/tourstack/insurance-admin/eois/${encodeURIComponent(eoiId)}/pdf`;
	} else {
		backendPath = `/tourstack/financing-admin/eois/${encodeURIComponent(eoiId)}/pdf`;
	}

	const apiUrl = process.env.API_URL ?? "https://gateway.ckrowd.com";
	const cookieJar = await cookies();
	const cookieHeader = cookieJar
		.getAll()
		.map((c) => `${c.name}=${c.value}`)
		.join("; ");

	const upstream = await fetch(`${apiUrl}${backendPath}`, {
		headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
	});

	if (!upstream.ok || !upstream.body) {
		return new NextResponse("Not found", { status: upstream.status || 404 });
	}

	const headers = new Headers();
	const contentType = upstream.headers.get("content-type");
	const contentLength = upstream.headers.get("content-length");
	const disposition = upstream.headers.get("content-disposition");
	if (contentType) headers.set("Content-Type", contentType);
	if (contentLength) headers.set("Content-Length", contentLength);
	headers.set(
		"Content-Disposition",
		disposition ?? `attachment; filename="eoi-${eoiId.slice(-6).toUpperCase()}.pdf"`,
	);
	headers.set("Cache-Control", "private, no-store");

	return new NextResponse(upstream.body, { headers });
}
