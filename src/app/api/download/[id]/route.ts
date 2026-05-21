import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Streams a stored file from the backend so the API URL stays server-side.
// The backend route accepts either the storage ID or path and serves the file
// with Content-Disposition: attachment.
export async function GET(
	_req: Request,
	context: { params: Promise<{ id: string }> },
) {
	const { id } = await context.params;
	const apiUrl = process.env.API_URL ?? "https://gateway.ckrowd.com";

	const cookieJar = await cookies();
	const cookieHeader = cookieJar
		.getAll()
		.map((c) => `${c.name}=${c.value}`)
		.join("; ");

	const upstream = await fetch(
		`${apiUrl}/storage/${encodeURIComponent(id)}`,
		{
			headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
		},
	);

	if (!upstream.ok || !upstream.body) {
		return new NextResponse("Not found", { status: upstream.status || 404 });
	}

	const headers = new Headers();
	const contentType = upstream.headers.get("content-type");
	const contentLength = upstream.headers.get("content-length");
	const disposition = upstream.headers.get("content-disposition");
	if (contentType) headers.set("Content-Type", contentType);
	if (contentLength) headers.set("Content-Length", contentLength);
	headers.set("Content-Disposition", disposition ?? "attachment");
	headers.set("Cache-Control", "private, no-store");

	return new NextResponse(upstream.body, { headers });
}
