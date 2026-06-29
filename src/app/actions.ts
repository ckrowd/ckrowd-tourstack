"use server";

import { createClient } from "@ckrowd/ckrowd-prisma";
import { extractResponseCookies } from "@ckrowd/ckrowd-prisma/utils";
import { getLocale } from "next-intl/server";
import { cookies, headers as nextHeaders } from "next/headers";
import { redirect } from "next/navigation";

export type Params<T extends (...args: any) => any> = NonNullable<
	Parameters<T>[0]
>["query"];

export type Payload<T extends (...args: any) => any> = NonNullable<
	Parameters<T>[0]
>;

const client = createClient({
	async onRequest(_path, options) {
		const cookieJar = await cookies();
		const cookieString = cookieJar
			.getAll()
			.map((c) => `${c.name}=${c.value}`)
			.join("; ");

		// Forward the real client IP and browser user-agent so the backend
		// can use them for login notifications. The server action runs on
		// Netlify, so the backend would otherwise see Netlify's US IP.
		const incoming = await nextHeaders();
		const clientIp =
			incoming.get("cf-connecting-ip") ??
			incoming.get("x-real-ip") ??
			incoming.get("x-forwarded-for")?.split(",")[0]?.trim() ??
			null;
		const userAgent = incoming.get("user-agent") ?? null;

		return {
			...options,
			headers: {
				...(options.headers as Record<string, string>),
				Cookie: cookieString,
				...(clientIp ? { "x-client-real-ip": clientIp } : {}),
				...(userAgent ? { "user-agent": userAgent } : {}),
			},
		};
	},
	// Must resolve to a nullish value: Eden Treaty treats any non-null return
	// from onResponse as the already-parsed `data`, which would skip JSON body
	// parsing for every request. The cast bridges createClient's over-narrow
	// `Promise<Response>` type to that real contract.
	onResponse: (async (response: Response) => {
		const responseCookies = extractResponseCookies(response);
		if (responseCookies.length === 0) return;

		// extractResponseCookies strips the `domain` attribute, but the backend
		// sets auth cookies with Domain=.ckrowd.com so the OAuth state cookie is
		// accessible from gateway.ckrowd.com during the callback. Without the
		// domain, the state cookie stays on tourstack.ckrowd.com and the callback
		// on gateway.ckrowd.com never sees it → state_mismatch.
		// Recover the domain from the raw Set-Cookie headers.
		const rawHeaders: string[] =
			typeof (response.headers as unknown as { getSetCookie?: () => string[] }).getSetCookie ===
			"function"
				? (response.headers as unknown as { getSetCookie: () => string[] }).getSetCookie()
				: [];
		const domainByName = new Map<string, string>();
		for (const raw of rawHeaders) {
			const nameMatch = raw.match(/^([^=]+)=/);
			const domainMatch = raw.match(/;\s*[Dd]omain=([^;]+)/);
			if (nameMatch?.[1] && domainMatch?.[1]) {
				domainByName.set(nameMatch[1].trim(), domainMatch[1].trim());
			}
		}

		const jar = await cookies();
		const isDev = process.env.NODE_ENV === "development";
		for (const cookie of responseCookies) {
			const domain = domainByName.get(cookie.name);
			jar.set(cookie.name, cookie.value, {
				...cookie.options,
				// On localhost the .ckrowd.com domain causes browsers to reject the
				// cookie (domain mismatch). Strip both domain and secure flag locally.
				...(isDev ? { domain: undefined, secure: false } : {}),
				...(!isDev && domain ? { domain } : {}),
			});
		}
	}) as unknown as (response: Response) => Promise<Response>,
});

// Cookie-free client for self-serve registrations that must be stored as
// unassociated (no session forwarded → promoter_id stays null on the server).
const anonymousClient = createClient();

function extractError(err: any, data?: any): string {
	// Prefer eden treaty's parsed error body, then fall back to the success-shaped
	// body's `error` field (backend often returns 200 + { success: false, error })
	// so the user sees the actual message instead of the generic fallback.
	return (
		err?.value?.error ??
		err?.value?.message ??
		(data && data.success === false && typeof data.error === "string"
			? data.error
			: undefined) ??
		"Something went wrong"
	);
}

function getErrorStatus(err: any): number | undefined {
	return err?.status ?? err?.value?.status ?? err?.response?.status;
}

function isUnauthorizedSessionError(err: any) {
	return (
		getErrorStatus(err) === 401 ||
		/unauthorized/i.test(err?.value?.error ?? err?.value?.message ?? "")
	);
}

function wait(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function extractPayload<T>(
	value: T | null | undefined,
	response?: { status: number; headers?: HeadersInit },
) {
	if (value == null) return undefined;
	if (
		response?.status === 401 &&
		["POST", "PUT", "DELETE"].includes(
			(response?.headers as Headers)?.get("X-Request-Method") ?? "GET",
		)
	) {
		const locale = await getLocale();
		redirect(`/${locale}/login`);
	}
	return ((value as T extends { data?: infer P } ? { data?: P } : never)
		?.data || undefined) as T extends { data?: infer P } ? P : undefined;
}

export async function getSession() {
	const retryDelays = [250, 750, 1500];

	for (let attempt = 0; attempt <= retryDelays.length; attempt += 1) {
		try {
			const { data, error } = await client.profile.session.get();

			if (!error && data && "user" in data) return data;
			if (error && isUnauthorizedSessionError(error)) return null;
			if (!error) return null;

			if (attempt === retryDelays.length) {
				throw new Error(extractError(error));
			}
		} catch (error) {
			if (attempt === retryDelays.length) {
				throw error;
			}
		}

		await wait(retryDelays[attempt]);
	}

	return null;
}

async function signInWithEmail(email: string, password: string) {
	const { error } = await client.auth["sign-in"].email.post({
		email,
		password,
	});
	if (error) return { success: false, error: extractError(error) };
	return { success: true };
}

export async function signIn(email: string, password: string) {
	const result = await signInWithEmail(email, password);
	if (!result.success) return result;

	const session = await getSession();
	if (session?.user?.is_super_admin === true) {
		await signOut();
		return { success: false, code: "admin_only" as const };
	}

	return { success: true };
}

export async function signInAdmin(
	email: string,
	password: string,
	requireScope?: "platform" | "insurance" | "financing",
) {
	const result = await signInWithEmail(email, password);
	if (!result.success) return result;

	const session = await getSession();
	const sessionUser = session?.user as
		| {
				tourstack_admin_role?: "platform" | "insurance" | "financing" | null;
				tourstack_admin_roles?: ("platform" | "insurance" | "financing")[] | null;
		  }
		| undefined;
	// Source of truth is the roles array; fall back to the legacy single column.
	const scopes = new Set(sessionUser?.tourstack_admin_roles ?? []);
	if (sessionUser?.tourstack_admin_role)
		scopes.add(sessionUser.tourstack_admin_role);

	if (scopes.size === 0) {
		await signOut();
		return { success: false, code: "not_admin" as const };
	}

	if (requireScope && !scopes.has(requireScope)) {
		await signOut();
		return {
			success: false,
			code: "wrong_scope" as const,
			scope: [...scopes][0],
		};
	}

	return { success: true };
}

export async function signUp(
	name: string,
	email: string,
	password: string,
	confirmPassword: string,
) {
	if (password !== confirmPassword)
		return { success: false, error: "Passwords don't match" };
	const { error } = await client.auth["sign-up"].email.post({
		name,
		email,
		password,
	});
	if (error) return { success: false, error: extractError(error) };
	return { success: true };
}

export async function signOut() {
	const { error } = await client.auth["sign-out"].post();
	if (error) return { success: false };
	return { success: true };
}

/**
 * Start a Google OAuth sign-in. Returns the provider consent URL the browser
 * must be redirected to; `callbackURL` is where the user lands afterwards.
 */
export async function signInWithGoogle(callbackURL: string) {
	const { data, error } = await (client.auth["sign-in"].social.post as any)({
		provider: "google",
		callbackURL,
		redirect: false,
	});
	if (error) return { success: false as const, error: extractError(error) };
	const url = (data as { url?: string } | null)?.url;
	if (!url) {
		return { success: false as const, error: "Couldn't start Google sign-in." };
	}
	return { success: true as const, url };
}

/**
 * Request a password-reset email. The backend sends a reset link to the
 * address if an account exists; the response is intentionally generic so
 * callers don't leak whether an email is registered.
 */
export async function requestPasswordReset(email: string, callbackURL?: string) {
	const { error } = await client.auth["reset-password"].post({
		email,
		...(callbackURL ? { callbackURL } : {}),
	});
	if (error) return { success: false, error: extractError(error) };
	return { success: true };
}

/** Complete a password reset using the token from the emailed link. */
export async function resetPassword(
	token: string,
	password: string,
	confirmPassword: string,
) {
	if (password !== confirmPassword)
		return { success: false, error: "Passwords don't match" };
	const { error } = await client.auth["change-password"].post({
		password,
		confirm_password: confirmPassword,
		token,
	});
	if (error) return { success: false, error: extractError(error) };
	return { success: true };
}

// Artmgmt portal sign-in: regular email/password + profile role check
export async function signInArtmgmt(email: string, password: string) {
	const result = await signInWithEmail(email, password);
	if (!result.success) return result;

	const profile = await getTourstackProfile();
	if (!profile.success || (profile.data as any)?.role !== "artist_mgmt") {
		await signOut();
		return { success: false, code: "not_artmgmt" as const };
	}

	return { success: true };
}

// Artist Management (artmgmt)

// biome-ignore-start lint/suspicious/noExplicitAny: artmgmt/submissions routes not yet in published pkg
export async function getArtmgmtProfile() {
	const { data, error, status, headers } = await (client as any).tourstack.artmgmt.get();
	return {
		data: await extractPayload(data, { status, headers }),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function getRosterArtists() {
	const { data, error, status, headers } =
		await (client as any).tourstack.artmgmt.artists.get();
	return {
		data: await extractPayload(data, { status, headers }),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function getRosterArtist(id: string) {
	const { data, error, status, headers } = await (client as any).tourstack.artmgmt
		.artists({ id })
		.get();
	return {
		data: await extractPayload(data, { status, headers }),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function clearForcePasswordChange() {
	const { data, error, status, headers } = await (client as any).tourstack.artmgmt[
		"acknowledge-password"
	].patch();
	return {
		data: await extractPayload(data, { status, headers }),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}
// biome-ignore-end lint/suspicious/noExplicitAny

export async function createRosterArtist(body: {
	name: string;
	genre: string;
	nationality?: string;
	bio?: string;
	socialLinks?: {
		instagram?: string;
		spotify?: string;
		youtube?: string;
		twitter?: string;
	};
	imageUrl?: string;
	isActive?: boolean;
}) {
	// biome-ignore lint/suspicious/noExplicitAny: artmgmt routes not yet in published pkg
	const { data, error, status, headers } = await (client as any).tourstack.artmgmt.artists.post(body);
	return {
		data: await extractPayload(data, { status, headers }),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function updateRosterArtist(
	id: string,
	body: {
		name?: string;
		genre?: string;
		nationality?: string | null;
		bio?: string | null;
		socialLinks?: {
			instagram?: string;
			spotify?: string;
			youtube?: string;
			twitter?: string;
		};
		imageUrl?: string | null;
		isActive?: boolean;
	},
) {
	// biome-ignore lint/suspicious/noExplicitAny: artmgmt routes not yet in published pkg
	const { data, error, status, headers } = await (client as any).tourstack.artmgmt.artists({ id }).patch(body);
	return {
		data: await extractPayload(data, { status, headers }),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function deleteRosterArtist(id: string) {
	// biome-ignore lint/suspicious/noExplicitAny: artmgmt routes not yet in published pkg
	const { data, error, status, headers } = await (client as any).tourstack.artmgmt
		.artists({ id })
		.delete();
	return {
		data: await extractPayload(data, { status, headers }),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function getArtistPitches() {
	// biome-ignore lint/suspicious/noExplicitAny: artmgmt pitches route not yet in published pkg
	const { data, error, status, headers } = await (client as any).tourstack.artmgmt.pitches.get();
	return {
		data: await extractPayload(data, { status, headers }),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function createArtistPitch(body: {
	rosterArtistId: string;
	tourName: string;
	promoterContact?: string;
	notes?: string;
}) {
	// biome-ignore lint/suspicious/noExplicitAny: artmgmt pitches route not yet in published pkg
	const { data, error, status, headers } = await (client as any).tourstack.artmgmt.pitches.post(body);
	return {
		data: await extractPayload(data, { status, headers }),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function updateArtistPitch(
	id: string,
	body: {
		tourName?: string;
		promoterContact?: string | null;
		notes?: string | null;
		status?: "pending" | "accepted" | "rejected";
	},
) {
	// biome-ignore lint/suspicious/noExplicitAny: artmgmt pitches route not yet in published pkg
	const { data, error, status, headers } = await (client as any).tourstack.artmgmt
		.pitches({ id })
		.patch(body);
	return {
		data: await extractPayload(data, { status, headers }),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function deleteArtistPitch(id: string) {
	// biome-ignore lint/suspicious/noExplicitAny: artmgmt pitches route not yet in published pkg
	const { data, error, status, headers } = await (client as any).tourstack.artmgmt
		.pitches({ id })
		.delete();
	return {
		data: await extractPayload(data, { status, headers }),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function getArtists(
	params?: Params<typeof client.tourstack.discovery.get>,
) {
	const { data, error, status, headers } = await client.tourstack.discovery.get(
		params ? { query: params } : {},
	);
	return {
		data: await extractPayload(data, { status, headers }),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function getArtist(id: string) {
	const { data, error } = await client.tourstack.discovery({ id }).get();
	return {
		data: data?.data ? data.data : undefined,
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

// Profile

export async function getTourstackProfile() {
	const { data, error, status, headers } = await client.tourstack.profile.get();
	return {
		data: await extractPayload(data, { status, headers }),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

type ProfileExtras = {
	companyType?: string;
	registrationNumber?: string;
	taxId?: string;
	incorporationDate?: string;
	incorporationCountry?: string;
	logoUrl?: string;
	primaryAddress?: string;
	xHandle?: string;
	facebookHandle?: string;
	tiktokHandle?: string;
	contactEmail?: string;
	yearsInBusiness?: number;
	companySize?: string;
	marketsRegions?: string;
	genresSpecialties?: string;
	averageEventsYear?: number;
	bankName?: string;
	bankAccountHolder?: string;
	bankAccountNumber?: string;
	bankSwiftBic?: string;
	currencyPreference?: string;
};

export async function updateTourstackProfile(
	body: Payload<typeof client.tourstack.profile.patch> & ProfileExtras,
) {
	// biome-ignore lint/suspicious/noExplicitAny: new profile fields added in backend — remove cast after package update
	const { data, error, status, headers } =
		await client.tourstack.profile.patch(body as any);
	return {
		data: await extractPayload(data, { status, headers }),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

// Dashboard

export async function getTourstackDashboard() {
	const { data, error, status, headers } =
		await client.tourstack.dashboard.get();
	return {
		data: await extractPayload(data, { status, headers }),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

// EOIs

export async function getEOIs(status?: string) {
	const {
		data,
		error,
		status: responseStatus,
		headers,
	} = await client.tourstack.eoi.get(status ? { query: { status } } : {});
	return {
		data: await extractPayload(data, { status: responseStatus, headers }),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function getEOI(id: string) {
	const { data, error, status, headers } = await client.tourstack
		.eoi({ id })
		.get();
	return {
		data: await extractPayload(data, { status, headers }),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function createEOI(
	body: Payload<typeof client.tourstack.eoi.post>,
) {
	const { data, error, status, headers } =
		await client.tourstack.eoi.post(body);
	const result = {
		data: await extractPayload(data, { status, headers }),
		success: !error && data?.success,
		error: extractError(error, data),
	};
	if (result.success) {
		const b = body as Record<string, unknown>;
		// biome-ignore lint/suspicious/noExplicitAny: submissions routes not yet in published pkg
		void (client as any).tourstack.submissions.post({
			category: "eoi",
			title: `EOI Submission — ${String(b.artistName ?? b.artist_id ?? "Tour")}`,
			formData: {
				artist_id: b.artistId ?? b.artist_id,
				city: b.city,
				capacity: b.capacity,
				funding_type: b.fundingType ?? b.funding_type,
			},
		});
	}
	return result;
}

// EOI Documents

export async function getEOIDocuments(eoiId: string) {
	// biome-ignore lint/suspicious/noExplicitAny: eoi documents route not yet in published pkg
	const { data, error, status, headers } = await (client as any).tourstack.eoi.documents.get({ query: { eoiId } });
	return {
		data: await extractPayload(data, { status, headers }),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function uploadEOIDocument(formData: FormData) {
	const file = formData.get("file");
	const eoiId = formData.get("eoiId");
	const documentType = formData.get("documentType");
	if (!file || typeof file === "string" || typeof eoiId !== "string" || typeof documentType !== "string") {
		return { success: false as const, error: "Missing required fields" };
	}
	const ext = (file as File).name.split(".").pop()?.toLowerCase() ?? "bin";
	const path = `eoi-docs/${eoiId}/${documentType}-${Date.now()}.${ext}`;
	const { data: uploadData, error: uploadError } = await client.storage.upload.post({
		file: file as File,
		path,
		contentType: (file as File).type || "application/octet-stream",
	});
	if (uploadError || !uploadData?.success) {
		return { success: false as const, error: "File upload failed" };
	}
	const storageId = (uploadData as { data: string }).data;
	// biome-ignore lint/suspicious/noExplicitAny: eoi documents route not yet in published pkg
	const { data, error, status, headers } = await (client as any).tourstack.eoi.documents.post({
		eoiId,
		documentType,
		storageId,
		fileName: (file as File).name,
	});
	return {
		data: await extractPayload(data, { status, headers }),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function getAdminEOIDocuments(eoiId: string) {
	// biome-ignore lint/suspicious/noExplicitAny: admin eoi-documents route not yet in published pkg
	const { data, error, status, headers } = await (client as any).tourstack.admin["eoi-documents"].get({ query: { eoiId } });
	return {
		data: await extractPayload(data, { status, headers }),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

// Tours
export async function getTours(status?: string, page?: number, limit?: number) {
	const query: { status?: string; page?: string; limit?: string } = {};
	if (status) query.status = status;
	if (page != null) query.page = String(page);
	if (limit != null) query.limit = String(limit);
	const {
		data,
		error,
		status: responseStatus,
		headers,
	} = await client.tourstack.tours.get({ query });
	// biome-ignore lint/suspicious/noExplicitAny: pagination is a conditional field not in the extracted payload type
	const pagination = (data as any)?.pagination as
		| { page: number; limit: number; total: number; totalPages: number }
		| undefined;
	return {
		data: await extractPayload(data, { status: responseStatus, headers }),
		pagination,
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function getTour(id: string) {
	const { data, error, status, headers } = await client.tourstack
		.tours({ id })
		.get();
	return {
		data: await extractPayload(data, { status, headers }),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function getTourMilestones(id: string) {
	const { data, error, status, headers } = await client.tourstack
		.tours({ id })
		.milestones.get();
	return {
		data: await extractPayload(data, { status, headers }),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

// Financing
export async function getFinancingApplications(status?: string) {
	const {
		data,
		error,
		status: responseStatus,
		headers,
	} = await client.tourstack.financing.get(status ? { query: { status } } : {});
	return {
		data: await extractPayload(data, { status: responseStatus, headers }),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function getFinancingApplication(id: string) {
	const { data, error, status, headers } = await client.tourstack
		.financing({ id })
		.get();
	return {
		data: await extractPayload(data, { status, headers }),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function applyForFinancing(
	body: Payload<typeof client.tourstack.financing.post>,
) {
	const { data, error, status, headers } =
		await client.tourstack.financing.post(body);
	const result = {
		data: await extractPayload(data, { status, headers }),
		success: !error && data?.success,
		error: extractError(error, data),
	};
	if (result.success) {
		// Fire-and-forget: create a submission record for the admin directory
		const formSnapshot: Record<string, unknown> = {
			product: (body as Record<string, unknown>).product,
			amount_requested: (body as Record<string, unknown>).amountRequested,
			currency: (body as Record<string, unknown>).currency,
			purpose: (body as Record<string, unknown>).purpose,
		};
		// biome-ignore lint/suspicious/noExplicitAny: submissions routes not yet in published pkg
		void (client as any).tourstack.submissions.post({
			category: "financing",
			title: `Financing Application — ${String(formSnapshot.product ?? "Unknown Product")}`,
			formData: formSnapshot,
		});
	}
	return result;
}

export async function getFinancingPartners() {
	const { data, error } = await client.tourstack.financing.partners.get();
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

// Venues

export async function getTourstackVenues() {
	const { data, error } = await client.tourstack.venues.get();
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

type VenueExtras = { expectedAttendance?: number; notes?: string };

export async function createTourstackVenue(
	body: Payload<typeof client.tourstack.venues.post> & VenueExtras,
) {
	// biome-ignore lint/suspicious/noExplicitAny: expectedAttendance/notes added in backend — remove cast after package update
	const { data, error } = await client.tourstack.venues.post(body as any);
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function updateTourstackVenue(
	id: string,
	body: Payload<ReturnType<typeof client.tourstack.venues>["patch"]> & VenueExtras,
) {
	// biome-ignore lint/suspicious/noExplicitAny: expectedAttendance/notes added in backend — remove cast after package update
	const { data, error } = await client.tourstack.venues({ id }).patch(body as any);
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function deleteTourstackVenue(id: string) {
	const { data, error } = await client.tourstack.venues({ id }).delete();
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

// Global search

export type SearchResult = {
	id: string;
	title: string;
	subtitle: string;
	href: string;
	category: "tour" | "eoi" | "financing" | "venue";
	icon: string;
};

export async function searchDashboard(q: string): Promise<SearchResult[]> {
	const term = q.toLowerCase().trim();
	if (term.length < 2) return [];

	const str = (v: unknown) => String(v ?? "");
	const hit = (s: string) => s.toLowerCase().includes(term);

	const [toursRes, eoisRes, financingRes, venuesRes] = await Promise.allSettled([
		getTours(),
		getEOIs(),
		getFinancingApplications(),
		getTourstackVenues(),
	]);

	const results: SearchResult[] = [];

	if (toursRes.status === "fulfilled") {
		const tours = (toursRes.value.data ?? []) as Record<string, unknown>[];
		for (const tour of tours) {
			const artist = (tour.artist as Record<string, unknown> | null) ?? {};
			const name = str(tour.name);
			const artistName = str(artist.name);
			const city = str(tour.city);
			const venue = str(tour.venue);
			if ([name, artistName, city, venue].some(hit)) {
				results.push({
					id: str(tour.id),
					title: name || artistName,
					subtitle: [artistName, city].filter(Boolean).join(" · "),
					href: `/tours/${str(tour.id)}`,
					category: "tour",
					icon: "confirmation_number",
				});
			}
		}
	}

	if (eoisRes.status === "fulfilled") {
		const eois = (eoisRes.value.data ?? []) as Record<string, unknown>[];
		for (const eoi of eois) {
			const artist = (eoi.artist as Record<string, unknown> | null) ?? {};
			const artistName = str(artist.name);
			const tourName = str(artist.tour_name);
			const city = str(eoi.city);
			const venue = str(eoi.venue);
			if ([artistName, tourName, city, venue].some(hit)) {
				results.push({
					id: str(eoi.id),
					title: artistName || tourName,
					subtitle: [tourName, city].filter(Boolean).join(" · "),
					href: "/eoi",
					category: "eoi",
					icon: "description",
				});
			}
		}
	}

	if (financingRes.status === "fulfilled") {
		const apps = (financingRes.value.data ?? []) as Record<string, unknown>[];
		for (const app of apps) {
			const tour = (app.tour as Record<string, unknown> | null) ?? {};
			const artist = (tour.artist as Record<string, unknown> | null) ?? {};
			const artistName = str(artist.name);
			const product = str(app.product);
			const partner = str(app.partner_name);
			const currency = str(app.currency) || "USD";
			const amount = Number(app.amount_requested ?? 0).toLocaleString();
			if ([artistName, product, partner].some(hit)) {
				results.push({
					id: str(app.id),
					title: artistName || product,
					subtitle: `${product} · ${currency} ${amount}`,
					href: `/financing/${str(app.id)}`,
					category: "financing",
					icon: "account_balance",
				});
			}
		}
	}

	if (venuesRes.status === "fulfilled") {
		const venues = (venuesRes.value.data ?? []) as Record<string, unknown>[];
		for (const venue of venues) {
			const name = str(venue.name);
			const city = str(venue.city);
			const country = str(venue.country);
			if ([name, city, country].some(hit)) {
				results.push({
					id: str(venue.id),
					title: name,
					subtitle: [city, country].filter(Boolean).join(", "),
					href: "/settings",
					category: "venue",
					icon: "location_on",
				});
			}
		}
	}

	return results;
}

// Notification preferences

export async function getTourstackNotifications() {
	const { data, error } = await client.tourstack.notifications.get();
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function updateTourstackNotifications(
	body: Payload<typeof client.tourstack.notifications.patch>,
) {
	const { data, error } = await client.tourstack.notifications.patch(body);
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

// Workforce (crew)

export async function getCrewMembers(
	params?: Params<typeof client.tourstack.workforce.get>,
) {
	const { data, error, status, headers } = await client.tourstack.workforce.get(
		params ? { query: params } : {},
	);
	return {
		data: await extractPayload(data, { status, headers }),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function getCrewMember(id: string) {
	const { data, error, status, headers } = await client.tourstack
		.workforce({ id })
		.get();
	return {
		data: await extractPayload(data, { status, headers }),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function registerCrewMember(
	body: Payload<typeof client.tourstack.workforce.post>,
) {
	const { data, error, status, headers } =
		await client.tourstack.workforce.post(body);
	return {
		data: await extractPayload(data, { status, headers }),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

// PDF Submissions

export async function createSubmission(body: {
	category: "financing" | "insurance" | "eoi";
	title: string;
	fileKey?: string;
	formData?: Record<string, unknown>;
}) {
	// biome-ignore lint/suspicious/noExplicitAny: submissions routes not yet in published pkg
	const { data, error, status, headers } = await (client as any).tourstack.submissions.post(body);
	return {
		data: await extractPayload(data, { status, headers }),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function getAdminSubmissions(category?: string) {
	// biome-ignore lint/suspicious/noExplicitAny: submissions routes not yet in published pkg
	const { data, error } = await (client as any).tourstack.submissions.get(
		category ? { query: { category } } : {},
	);
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

// Stakeholder onboarding (direct)

export async function registerStakeholder(
	body: Payload<typeof client.tourstack.onboarding.post>,
) {
	const { data, error } = await client.tourstack.onboarding.post(body);
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

// Self-serve registration that intentionally omits the session cookie so the
// stakeholder is stored as unassociated (admin-only directory) regardless of
// whether the submitter happens to be logged in. Token-based submissions via
// /stakeholders/[token] use submitOnboardingLink instead, which ties to a link.
export async function registerStakeholderAnonymous(
	body: Payload<typeof client.tourstack.onboarding.post>,
) {
	const { data, error } = await anonymousClient.tourstack.onboarding.post(body);
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

// Onboarding links

export async function getOnboardingLinks() {
	const { data, error } = await client.tourstack["onboarding-links"].get();
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function createOnboardingLink(
	body: Payload<(typeof client.tourstack)["onboarding-links"]["post"]>,
) {
	const { data, error, status, headers } =
		await client.tourstack["onboarding-links"].post(body);
	return {
		data: await extractPayload(data, { status, headers }),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function getOnboardingLink(token: string) {
	const apiUrl = process.env.API_URL ?? "https://gateway.ckrowd.com";
	const res = await fetch(`${apiUrl}/tourstack/onboarding-links/${token}`);
	const data = await res.json();
	return {
		data: data?.data,
		success: res.ok && data?.success,
		error: data?.error ?? null,
	};
}

export async function revokeOnboardingLink(token: string) {
	const { data, error, status, headers } = await client.tourstack[
		"onboarding-links"
	]({
		token,
	}).delete();
	return {
		data: await extractPayload(data, { status, headers }),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function submitOnboardingLink(
	token: string,
	body: Payload<
		ReturnType<(typeof client.tourstack)["onboarding-links"]>["submit"]["post"]
	>,
) {
	const { data, error } = await client.tourstack["onboarding-links"]({
		token,
	}).submit.post(body);
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export type StakeholderSubmission = {
	id: string;
	category: string;
	name: string;
	email: string;
	phone: string | null;
	company: string | null;
	country: string | null;
	city: string | null;
	extra_data: Record<string, unknown> | null;
	submitted_at: string;
	link: { id: string; token: string; label: string | null } | null;
};

export type StakeholderFilters = {
	q?: string;
	city?: string;
	country?: string;
	category?: string;
};

export async function getStakeholders(
	scope?: "all",
	filters?: StakeholderFilters,
): Promise<{
	data: StakeholderSubmission[];
	success: boolean;
	error: string | null;
}> {
	const apiUrl = process.env.API_URL ?? "https://gateway.ckrowd.com";
	const jar = await cookies();
	const cookieString = jar
		.getAll()
		.map((c) => `${c.name}=${c.value}`)
		.join("; ");
	const params = new URLSearchParams();
	if (scope) params.set("scope", scope);
	if (filters?.q?.trim()) params.set("q", filters.q.trim());
	if (filters?.city?.trim()) params.set("city", filters.city.trim());
	if (filters?.country?.trim()) params.set("country", filters.country.trim());
	if (filters?.category) params.set("category", filters.category);
	const qs = params.toString();
	const url = qs
		? `${apiUrl}/tourstack/stakeholders?${qs}`
		: `${apiUrl}/tourstack/stakeholders`;
	const res = await fetch(url, {
		headers: { Cookie: cookieString },
		cache: "no-store",
	});
	const body = await res.json().catch(() => null);
	return {
		data: res.ok && body?.success ? (body.data ?? []) : [],
		success: res.ok && Boolean(body?.success),
		error: body?.error ?? null,
	};
}

// Admin

export async function getAdminEOIs(status?: string) {
	const { data, error } = await client.tourstack.admin.eois.get(
		status ? { query: { status } } : {},
	);
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function getAdminTours(status?: string, page?: number, limit?: number) {
	const query: { status?: string; page?: string; limit?: string } = {};
	if (status) query.status = status;
	if (page != null) query.page = String(page);
	if (limit != null) query.limit = String(limit);
	const { data, error } = await client.tourstack.admin.tours.get({ query });
	// biome-ignore lint/suspicious/noExplicitAny: pagination is a conditional field not in the extracted payload type
	const pagination = (data as any)?.pagination as
		| { page: number; limit: number; total: number; totalPages: number }
		| undefined;
	return {
		data: await extractPayload(data),
		pagination,
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function getAdminArtists() {
	const { data, error } = await client.tourstack.admin.artists.get();
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function updateAdminArtist(
	id: string,
	body: {
		name?: string;
		genre?: string;
		tourName?: string;
		tourStart?: string;
		tourEnd?: string;
		feeMin?: number;
		feeMax?: number;
		markets?: string[];
		region?: string;
		tourWindow?: string;
		isTrending?: boolean;
		isActive?: boolean;
		bio?: string | null;
	},
) {
	const { data, error } = await (client.tourstack.admin.artists as any)({
		id,
	}).patch(body);
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function deleteAdminArtist(id: string) {
	const { data, error } = await (client.tourstack.admin.artists as any)({
		id,
	}).delete();
	return {
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

// biome-ignore lint/suspicious/noExplicitAny: admin roster-artists endpoint pending backend implementation
export async function getAdminRosterArtists() {
	const { data, error } = await (client as any).tourstack.admin["roster-artists"].get();
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

// biome-ignore lint/suspicious/noExplicitAny: admin roster-artists endpoint pending backend implementation
export async function approveRosterArtist(id: string) {
	const { data, error } = await (client as any).tourstack.admin["roster-artists"]({ id }).patch({ status: "approved" });
	return {
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

// biome-ignore lint/suspicious/noExplicitAny: admin roster-artists endpoint pending backend implementation
export async function rejectRosterArtist(id: string) {
	const { data, error } = await (client as any).tourstack.admin["roster-artists"]({ id }).patch({ status: "rejected" });
	return {
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function uploadTourImage(formData: FormData) {
	const file = formData.get("file");
	if (!file || typeof file === "string") {
		return { success: false as const, error: "No file provided" };
	}
	const ext = (file as File).name.split(".").pop()?.toLowerCase() ?? "jpg";
	const path = `ts-artist-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
	const { data, error } = await client.storage.upload.post({
		file: file as File,
		path,
		contentType: (file as File).type || "image/jpeg",
		upsert: false,
	});
	if (error || !data?.success) {
		return { success: false as const, error: extractError(error, data) };
	}
	const publicUrl = `${process.env.API_URL}/storage/${path}`;
	return { success: true as const, data: publicUrl };
}

export async function createAdminTour(
	body: Payload<typeof client.tourstack.admin.tours.post> & {
		region?: string;
		markets?: string[];
		image_url?: string;
		bio?: string;
	},
) {
	const { data, error, status, headers } =
		await client.tourstack.admin.tours.post(body as Payload<typeof client.tourstack.admin.tours.post>);
	return {
		data: await extractPayload(data, { status, headers }),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function getAdminTour(id: string) {
	const { data, error } = await client.tourstack.admin.tours({ id }).get();
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function deleteAdminTour(id: string) {
	const { data, error } = await client.tourstack.admin.tours({ id }).delete();
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function updateAdminTour(
	id: string,
	body: {
		venue?: string;
		city?: string;
		country?: string | null;
		date?: string;
		capacity?: number | null;
		feeUsd?: number;
		status?: string;
		financing?: boolean;
		financingAmount?: number | null;
	},
) {
	const { data, error, status: httpStatus, headers } = await (client.tourstack.admin.tours({ id }) as any).patch(body);
	return {
		data: await extractPayload(data, { status: httpStatus, headers }),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function createTourFromEoi(
	body: Payload<typeof client.tourstack.admin.tours["from-eoi"]["post"]>,
) {
	const { data, error, status, headers } = await client.tourstack.admin.tours[
		"from-eoi"
	].post(body);
	return {
		data: await extractPayload(data, { status, headers }),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function updateAdminEoi(
	id: string,
	body: Payload<ReturnType<typeof client.tourstack.eoi>["patch"]>,
) {
	const { data, error } = await client.tourstack.eoi({ id }).patch(body);
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function purgeAdminDraftTours() {
	const { data, error } = await client.tourstack.admin.tours.drafts.delete();
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function getAdminFinancing(status?: string) {
	const { data, error } = await client.tourstack.admin.financing.get(
		status ? { query: { status } } : {},
	);
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function updateFinancingApplication(
	id: string,
	body: Payload<ReturnType<typeof client.tourstack.financing>["patch"]>,
) {
	const { data, error } = await client.tourstack.financing({ id }).patch(body);
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function getAdminFinancingPartners() {
	const { data, error } = await client.tourstack.admin.financing.partners.get();
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function createFinancingPartner(
	body: Payload<typeof client.tourstack.admin.financing.partners.post>,
) {
	const { data, error } =
		await client.tourstack.admin.financing.partners.post(body);
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

// Insurance Admin

export async function getInsuranceApplications(status?: string) {
	const { data, error } = await client.tourstack["insurance-admin"].get(
		status ? { query: { status } } : {},
	);
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function updateInsuranceApplication(
	id: string,
	body: Payload<
		ReturnType<(typeof client.tourstack)["insurance-admin"]>["patch"]
	>,
) {
	const { data, error } = await client.tourstack["insurance-admin"]({
		id,
	}).patch(body);
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function getInsuranceClaims(status?: string) {
	const { data, error } = await client.tourstack[
		"insurance-admin"
	].claims.get(status ? { query: { status } } : {});
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function createInsuranceClaim(
	body: Payload<(typeof client.tourstack)["insurance-admin"]["claims"]["post"]>,
) {
	const { data, error } =
		await client.tourstack["insurance-admin"].claims.post(body);
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function updateInsuranceClaim(
	id: string,
	body: Payload<
		ReturnType<
			(typeof client.tourstack)["insurance-admin"]["claims"]
		>["patch"]
	>,
) {
	const { data, error } = await client.tourstack["insurance-admin"].claims({
		id,
	}).patch(body);
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function getInsurancePartners() {
	const { data, error } =
		await client.tourstack["insurance-admin"].partners.get();
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function createInsurancePartner(
	body: Payload<
		(typeof client.tourstack)["insurance-admin"]["partners"]["post"]
	>,
) {
	const { data, error } =
		await client.tourstack["insurance-admin"].partners.post(body);
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function getAdminReport() {
	const { data, error } = await client.tourstack.admin.reports.get();
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function exportAdminReport() {
	const { data, error } = await client.tourstack.admin.reports.export.get({
		query: { format: "csv" },
	});
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function getAdminSettings() {
	const { data, error } = await client.tourstack.admin.settings.get();
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function updateAdminSettings(
	body: Payload<typeof client.tourstack.admin.settings.patch>,
) {
	const { data, error } = await client.tourstack.admin.settings.patch(body);
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function getAdminTeam() {
	const { data, error } = await client.tourstack.admin.team.get();
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function inviteAdminTeamMember(
	body: Payload<typeof client.tourstack.admin.team.post>,
) {
	const { data, error } = await client.tourstack.admin.team.post(body);
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function resendAdminInvite(inviteId: string) {
	const { data, error } = await client.tourstack.admin.team.invites({
		id: inviteId,
	}).resend.post();
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function revokeAdminInvite(inviteId: string) {
	const { data, error } = await client.tourstack.admin.team.invites({
		id: inviteId,
	}).delete();
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function setAdminRoles(
	body: Payload<typeof client.tourstack.admin.team.patch>,
) {
	const { data, error } = await client.tourstack.admin.team.patch(body);
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function getAdminInvite(token: string) {
	const { data, error } = await client.tourstack.admin.invites({ token }).get();
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function acceptAdminInvite(token: string) {
	const { data, error } = await client.tourstack.admin
		.invites({ token })
		.accept.post();
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function forwardEoi(eoiId: string, target: "finance" | "insurance" | "both") {
	try {
		const cookieJar = await cookies();
		const cookieString = cookieJar
			.getAll()
			.map((c) => `${c.name}=${c.value}`)
			.join("; ");
		const res = await fetch(
			`${process.env.API_URL}/tourstack/admin/eois/${eoiId}/forward`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json", Cookie: cookieString },
				body: JSON.stringify({ target }),
			},
		);
		let json: { success: boolean; error?: string; data?: unknown } | null = null;
		try {
			json = await res.json();
		} catch {
			const text = await res.text().catch(() => "(unreadable)");
			return { data: null, success: false, error: `HTTP ${res.status}: ${text.slice(0, 120)}` };
		}
		return {
			data: json?.data ?? null,
			success: json?.success === true,
			error: json?.error ?? (res.ok ? null : `HTTP ${res.status}`),
		};
	} catch (err) {
		return {
			data: null,
			success: false,
			error: `[threw] ${err instanceof Error ? err.message : String(err)}`,
		};
	}
}

export async function getFinancingEois() {
	const { data, error } = await (client.tourstack["financing-admin"] as any).eois.get();
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function getInsuranceEois() {
	const { data, error } = await (client.tourstack["insurance-admin"] as any).eois.get();
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function updateFinancingEoi(
	id: string,
	body: { finance_status?: string; partner_name?: string; term_sheet_url?: string; note?: string },
) {
	const { data, error } = await (client.tourstack["financing-admin"] as any).eois({ id }).patch(body);
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function updateInsuranceEoi(
	id: string,
	body: { insurance_status?: string; partner_name?: string; note?: string },
) {
	const { data, error } = await (client.tourstack["insurance-admin"] as any).eois({ id }).patch(body);
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

// biome-ignore lint/suspicious/noExplicitAny: revise route not yet in published package type
export async function reviseEoi(
	id: string,
	body: { city?: string; venue?: string; capacity?: number; audience?: string; notes?: string; budget?: number; fundingType?: string },
) {
	const { data, error } = await (client as any).tourstack.eoi({ id }).revise.patch(body);
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

// biome-ignore lint/suspicious/noExplicitAny: financing-admin profile not yet in published package type
export async function getFinancingAdminProfile() {
	const { data, error } = await (client as any).tourstack["financing-admin"].profile.get();
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

// biome-ignore lint/suspicious/noExplicitAny: financing-admin profile not yet in published package type
export async function updateFinancingAdminProfile(body: { orgName?: string; contactPerson?: string; role?: string; adminSignature?: string | null }) {
	const { data, error } = await (client as any).tourstack["financing-admin"].profile.patch(body);
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

// biome-ignore lint/suspicious/noExplicitAny: insurance-admin profile not yet in published package type
export async function getInsuranceAdminProfile() {
	const { data, error } = await (client as any).tourstack["insurance-admin"].profile.get();
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

// biome-ignore lint/suspicious/noExplicitAny: insurance-admin profile not yet in published package type
export async function updateInsuranceAdminProfile(body: { orgName?: string; contactPerson?: string; role?: string; adminSignature?: string | null }) {
	const { data, error } = await (client as any).tourstack["insurance-admin"].profile.patch(body);
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

// biome-ignore lint/suspicious/noExplicitAny: admin claims not yet in published package type
export async function getAdminClaims(status?: string) {
	const { data, error } = await (client as any).tourstack.admin.claims.get(status ? { query: { status } } : {});
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function setLeadAdmin(userId: string) {
	try {
		const cookieJar = await cookies();
		const cookieString = cookieJar.getAll().map((c) => `${c.name}=${c.value}`).join("; ");
		const res = await fetch(`${process.env.API_URL}/tourstack/admin/team/lead`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json", Cookie: cookieString },
			body: JSON.stringify({ userId }),
		});
		const json: { success: boolean; error?: string; data?: unknown } | null =
			await res.json().catch(() => null);
		return {
			data: json?.data ?? null,
			success: json?.success === true,
			error: json?.error ?? (res.ok ? null : `HTTP ${res.status}`),
		};
	} catch (err) {
		return { data: null, success: false, error: `[threw] ${err instanceof Error ? err.message : String(err)}` };
	}
}

// Active Sessions

export async function revokeSession(
	body: Payload<(typeof client.auth)["revoke-session"]["post"]>,
) {
	const { error } = await client.auth["revoke-session"].post(body);
	return { success: !error, error: extractError(error) };
}

export async function revokeOtherSessions() {
	const { error } = await client.auth["revoke-other-sessions"].post({});
	return { success: !error, error: extractError(error) };
}

// Email verification

export async function verifyEmail(email: string, otp: string) {
	const { error } = await client.auth["verify-email"].post({ email, otp });
	return { success: !error, error: extractError(error) };
}

export async function resendVerificationOtp(email: string) {
	const { error } = await client.auth["send-verification-otp"].post({
		email,
		type: "email-verification",
	});
	return { success: !error, error: extractError(error) };
}

// Newsletter

export async function subscribeNewsletter(email: string) {
	const { data, error } = await client.newsletter.join.post({ email });
	return { success: !error && data?.success, error: extractError(error) };
}

export async function unsubscribeNewsletter(email: string) {
	const { data, error } = await client.newsletter.unsubscribe.post({ email });
	return { success: !error && data?.success, error: extractError(error) };
}

// 2FA

export async function setup2FA(): Promise<{
	success: boolean;
	data?: { qrCodeUrl: string; secret: string };
	error: string;
}> {
	const { data, error } = await client.auth["two-factor"].enable.post({});
	return {
		success: !error && data?.success,
		data: await extractPayload(data),
		error: extractError(error, data),
	};
}

export async function verify2FA(
	code: string,
): Promise<{ success: boolean; error: string }> {
	const { data, error } = await client.auth["two-factor"].verify.post({ code });
	return { success: !error && data?.success, error: extractError(error) };
}

export async function disable2FA(
	password: string,
): Promise<{ success: boolean; error: string }> {
	const { data, error } = await client.auth["two-factor"].disable.post({
		password,
	});
	return { success: !error && data?.success, error: extractError(error) };
}

// Password

export async function changePassword(
	currentPassword: string,
	newPassword: string,
): Promise<{ success: boolean; error: string }> {
	const { error } = await client.auth["new-password"].post({
		currentPassword,
		newPassword,
	});
	return { success: !error, error: extractError(error) };
}

// Account Deletion

export async function deleteAccount(): Promise<{
	success: boolean;
	error: string;
}> {
	const { data, error } = await client.auth["delete-account"].post({});
	return { success: !error && data?.success, error: extractError(error) };
}

// Stakeholders Export

export async function exportStakeholders(format: "json" | "csv" = "csv") {
	const { data, error } = await client.tourstack["onboarding-links"].export.get(
		{ query: { format } },
	);
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

// Financing-admin scoped settings / products / team

export async function getFinancingSettings() {
	const { data, error } =
		await client.tourstack["financing-admin"].settings.get();
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function updateFinancingSettings(
	body: Payload<typeof client.tourstack["financing-admin"]["settings"]["patch"]>,
) {
	const { data, error } =
		await client.tourstack["financing-admin"].settings.patch(body);
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function listFinancingProducts() {
	const { data, error } =
		await client.tourstack["financing-admin"].products.get();
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function createFinancingProduct(
	body: Payload<typeof client.tourstack["financing-admin"]["products"]["post"]>,
) {
	const { data, error } =
		await client.tourstack["financing-admin"].products.post(body);
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function deleteFinancingProduct(id: string) {
	const { data, error } = await client.tourstack["financing-admin"]
		.products({ id })
		.delete();
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function getFinancingTeam() {
	const { data, error } =
		await client.tourstack["financing-admin"].team.get();
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function inviteFinancingTeamMember(
	body: Payload<typeof client.tourstack["financing-admin"]["team"]["post"]>,
) {
	const { data, error } =
		await client.tourstack["financing-admin"].team.post(body);
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function resendFinancingInvite(inviteId: string) {
	const { data, error } = await client.tourstack["financing-admin"].team
		.invites({ id: inviteId })
		.resend.post();
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function revokeFinancingInvite(inviteId: string) {
	const { data, error } = await client.tourstack["financing-admin"].team
		.invites({ id: inviteId })
		.delete();
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

// Storage

export async function uploadFile(
	body: Payload<typeof client.storage.upload.post>,
) {
	const { data, error } = await client.storage.upload.post(body);
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

// Payments / banking

export async function listBanks(country = "nigeria") {
	const { data, error } = await client.payments.banks.get({
		query: { country },
	});
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

// ── AI Tools (Tour Intelligence) ──────────────────────────────────────────
// All AI calls run on the backend (Dokploy) which holds the AI API keys.
// biome-ignore lint/suspicious/noExplicitAny: AI routes not yet in published package types

// biome-ignore lint/suspicious/noExplicitAny: AI routes not yet in published package types
export async function getEOIScore(eoiId: string) {
	const { data, error } = await (client as any).tourstack.ai["eoi-score"].get({ query: { eoiId } });
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

// biome-ignore lint/suspicious/noExplicitAny: AI routes not yet in published package types
export async function generateEOIScore(eoiId: string) {
	const { data, error } = await (client as any).tourstack.ai["eoi-score"].post({ eoiId });
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

// biome-ignore lint/suspicious/noExplicitAny: AI routes not yet in published package types
export async function getTicketForecast(eoiId: string, ticketPriceNgn: number) {
	const { data, error } = await (client as any).tourstack.ai["ticket-forecast"].post({ eoiId, ticketPriceNgn });
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

// biome-ignore lint/suspicious/noExplicitAny: AI routes not yet in published package types
export async function getSponsorshipMatches(eoiId: string) {
	const { data, error } = await (client as any).tourstack.ai["sponsorship-match"].post({ eoiId });
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

// biome-ignore lint/suspicious/noExplicitAny: AI routes not yet in published package types
export async function getVenueRecommendations(body: {
	city: string;
	genre: string;
	expectedAttendance: number;
	budgetMaxUsd?: number;
}) {
	const { data, error } = await (client as any).tourstack.ai["venue-recommendations"].post(body);
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

// biome-ignore lint/suspicious/noExplicitAny: AI routes not yet in published package types
export async function optimizeTourRoute(body: {
	cities: string[];
	startCity: string;
	tourDurationDays?: number;
}) {
	const { data, error } = await (client as any).tourstack.ai["route-optimizer"].post(body);
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

// biome-ignore lint/suspicious/noExplicitAny: AI routes not yet in published package types
export async function generateMarketingContent(eoiId: string) {
	const { data, error } = await (client as any).tourstack.ai["marketing-content"].post({ eoiId });
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

// ── Post-event Tour Report ─────────────────────────────────────────────────

// biome-ignore lint/suspicious/noExplicitAny: tour report routes not yet in published pkg
export async function getTourReport(tourId: string) {
	const { data, error, status, headers } = await (client as any).tourstack.tours({ id: tourId })
		.report.get();
	return {
		data: await extractPayload(data, { status, headers }),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

// biome-ignore lint/suspicious/noExplicitAny: tour report routes not yet in published pkg
export async function submitTourReport(
	tourId: string,
	body: {
		actualAttendance?: number;
		actualTicketRevenue?: number;
		actualSponsorshipRevenue?: number;
		actualMerchRevenue?: number;
		actualTotalCosts?: number;
		actualNetProfit?: number;
		sellOutPct?: number;
		promoterNotes?: string;
	},
) {
	const { data, error, status, headers } = await (client as any).tourstack.tours({ id: tourId })
		.report.post(body);
	return {
		data: await extractPayload(data, { status, headers }),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function resolveBankAccount(
	body: Payload<(typeof client.payments)["resolve-account"]["post"]>,
) {
	const { data, error } =
		await client.payments["resolve-account"].post(body);
	return {
		data: await extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

