"use server";

import { createClient } from "@ckrowd/ckrowd-prisma";
import { extractResponseCookies } from "@ckrowd/ckrowd-prisma/utils";
import { cookies } from "next/headers";
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
		return {
			...options,
			headers: {
				...(options.headers as Record<string, string>),
				Cookie: cookieString,
			},
		};
	},
	// Must resolve to a nullish value: Eden Treaty treats any non-null return
	// from onResponse as the already-parsed `data`, which would skip JSON body
	// parsing for every request. The cast bridges createClient's over-narrow
	// `Promise<Response>` type to that real contract.
	onResponse: (async (response: Response) => {
		const responseCookies = extractResponseCookies(response);
		if (responseCookies.length > 0) {
			const jar = await cookies();
			for (const cookie of responseCookies) {
				jar.set(cookie.name, cookie.value, cookie.options);
			}
		}
	}) as unknown as (response: Response) => Promise<Response>,
});

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

function extractPayload<T>(
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
		redirect("/login");
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
	const { data, error } = await client.auth["sign-in"].social.post({
		provider: "google",
		callbackURL,
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

export async function getArtists(
	params?: Params<typeof client.tourstack.discovery.get>,
) {
	const { data, error, status, headers } = await client.tourstack.discovery.get(
		params ? { query: params } : {},
	);
	return {
		data: extractPayload(data, { status, headers }),
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
		data: extractPayload(data, { status, headers }),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function updateTourstackProfile(
	body: Payload<typeof client.tourstack.profile.patch>,
) {
	const { data, error, status, headers } =
		await client.tourstack.profile.patch(body);
	return {
		data: extractPayload(data, { status, headers }),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

// Dashboard

export async function getTourstackDashboard() {
	const { data, error, status, headers } =
		await client.tourstack.dashboard.get();
	return {
		data: extractPayload(data, { status, headers }),
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
		data: extractPayload(data, { status: responseStatus, headers }),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function getEOI(id: string) {
	const { data, error, status, headers } = await client.tourstack
		.eoi({ id })
		.get();
	return {
		data: extractPayload(data, { status, headers }),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function createEOI(
	body: Payload<typeof client.tourstack.eoi.post>,
) {
	const { data, error, status, headers } =
		await client.tourstack.eoi.post(body);
	return {
		data: extractPayload(data, { status, headers }),
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
		data: extractPayload(data, { status: responseStatus, headers }),
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
		data: extractPayload(data, { status, headers }),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function getTourMilestones(id: string) {
	const { data, error, status, headers } = await client.tourstack
		.tours({ id })
		.milestones.get();
	return {
		data: extractPayload(data, { status, headers }),
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
		data: extractPayload(data, { status: responseStatus, headers }),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function getFinancingApplication(id: string) {
	const { data, error, status, headers } = await client.tourstack
		.financing({ id })
		.get();
	return {
		data: extractPayload(data, { status, headers }),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function applyForFinancing(
	body: Payload<typeof client.tourstack.financing.post>,
) {
	const { data, error, status, headers } =
		await client.tourstack.financing.post(body);
	return {
		data: extractPayload(data, { status, headers }),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function getFinancingPartners() {
	const { data, error } = await client.tourstack.financing.partners.get();
	return {
		data: extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

// Venues

export async function getTourstackVenues() {
	const { data, error } = await client.tourstack.venues.get();
	return {
		data: extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function createTourstackVenue(
	body: Payload<typeof client.tourstack.venues.post>,
) {
	const { data, error } = await client.tourstack.venues.post(body);
	return {
		data: extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function updateTourstackVenue(
	id: string,
	body: Payload<ReturnType<typeof client.tourstack.venues>["patch"]>,
) {
	const { data, error } = await client.tourstack.venues({ id }).patch(body);
	return {
		data: extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function deleteTourstackVenue(id: string) {
	const { data, error } = await client.tourstack.venues({ id }).delete();
	return {
		data: extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

// Notification preferences

export async function getTourstackNotifications() {
	const { data, error } = await client.tourstack.notifications.get();
	return {
		data: extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function updateTourstackNotifications(
	body: Payload<typeof client.tourstack.notifications.patch>,
) {
	const { data, error } = await client.tourstack.notifications.patch(body);
	return {
		data: extractPayload(data),
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
		data: extractPayload(data, { status, headers }),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function getCrewMember(id: string) {
	const { data, error, status, headers } = await client.tourstack
		.workforce({ id })
		.get();
	return {
		data: extractPayload(data, { status, headers }),
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
		data: extractPayload(data, { status, headers }),
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
		data: extractPayload(data),
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
	const apiUrl = process.env.API_URL ?? "https://gateway.ckrowd.com";
	const res = await fetch(`${apiUrl}/tourstack/onboarding`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	});
	const json = (await res.json().catch(() => null)) as {
		success?: boolean;
		data?: unknown;
		error?: string;
	} | null;
	return {
		data: json?.data,
		success: res.ok && json?.success === true,
		error: json?.error ?? (res.ok ? null : "Failed to submit registration"),
	};
}

// Onboarding links

export async function getOnboardingLinks() {
	const { data, error } = await client.tourstack["onboarding-links"].get();
	return {
		data: extractPayload(data),
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
		data: extractPayload(data, { status, headers }),
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
		data: extractPayload(data, { status, headers }),
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
		data: extractPayload(data),
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
		data: extractPayload(data),
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
		data: extractPayload(data),
		pagination,
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function getAdminArtists() {
	const { data, error } = await client.tourstack.admin.artists.get();
	return {
		data: extractPayload(data),
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
		data: extractPayload(data, { status, headers }),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function getAdminTour(id: string) {
	const { data, error } = await client.tourstack.admin.tours({ id }).get();
	return {
		data: extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function deleteAdminTour(id: string) {
	const { data, error } = await client.tourstack.admin.tours({ id }).delete();
	return {
		data: extractPayload(data),
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
		data: extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function purgeAdminDraftTours() {
	const { data, error } = await client.tourstack.admin.tours.drafts.delete();
	return {
		data: extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function getAdminFinancing(status?: string) {
	const { data, error } = await client.tourstack.admin.financing.get(
		status ? { query: { status } } : {},
	);
	return {
		data: extractPayload(data),
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
		data: extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function getAdminFinancingPartners() {
	const { data, error } = await client.tourstack.admin.financing.partners.get();
	return {
		data: extractPayload(data),
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
		data: extractPayload(data),
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
		data: extractPayload(data),
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
		data: extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function getInsuranceClaims(status?: string) {
	const { data, error } = await client.tourstack[
		"insurance-admin"
	].claims.get(status ? { query: { status } } : {});
	return {
		data: extractPayload(data),
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
		data: extractPayload(data),
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
		data: extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function getInsurancePartners() {
	const { data, error } =
		await client.tourstack["insurance-admin"].partners.get();
	return {
		data: extractPayload(data),
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
		data: extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function getAdminReport() {
	const { data, error } = await client.tourstack.admin.reports.get();
	return {
		data: extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function exportAdminReport() {
	const { data, error } = await client.tourstack.admin.reports.export.get({
		query: { format: "csv" },
	});
	return {
		data: extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function getAdminSettings() {
	const { data, error } = await client.tourstack.admin.settings.get();
	return {
		data: extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function updateAdminSettings(
	body: Payload<typeof client.tourstack.admin.settings.patch>,
) {
	const { data, error } = await client.tourstack.admin.settings.patch(body);
	return {
		data: extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function getAdminTeam() {
	const { data, error } = await client.tourstack.admin.team.get();
	return {
		data: extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function inviteAdminTeamMember(
	body: Payload<typeof client.tourstack.admin.team.post>,
) {
	const { data, error } = await client.tourstack.admin.team.post(body);
	return {
		data: extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function resendAdminInvite(inviteId: string) {
	const { data, error } = await client.tourstack.admin.team.invites({
		id: inviteId,
	}).resend.post();
	return {
		data: extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function revokeAdminInvite(inviteId: string) {
	const { data, error } = await client.tourstack.admin.team.invites({
		id: inviteId,
	}).delete();
	return {
		data: extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function setAdminRoles(
	body: Payload<typeof client.tourstack.admin.team.patch>,
) {
	const { data, error } = await client.tourstack.admin.team.patch(body);
	return {
		data: extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function getAdminInvite(token: string) {
	const { data, error } = await client.tourstack.admin.invites({ token }).get();
	return {
		data: extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function acceptAdminInvite(token: string) {
	const { data, error } = await client.tourstack.admin
		.invites({ token })
		.accept.post();
	return {
		data: extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
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
		data: extractPayload(data),
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
		data: extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

// Financing-admin scoped settings / products / team

export async function getFinancingSettings() {
	const { data, error } =
		await client.tourstack["financing-admin"].settings.get();
	return {
		data: extractPayload(data),
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
		data: extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function listFinancingProducts() {
	const { data, error } =
		await client.tourstack["financing-admin"].products.get();
	return {
		data: extractPayload(data),
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
		data: extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function deleteFinancingProduct(id: string) {
	const { data, error } = await client.tourstack["financing-admin"]
		.products({ id })
		.delete();
	return {
		data: extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function getFinancingTeam() {
	const { data, error } =
		await client.tourstack["financing-admin"].team.get();
	return {
		data: extractPayload(data),
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
		data: extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function resendFinancingInvite(inviteId: string) {
	const { data, error } = await client.tourstack["financing-admin"].team
		.invites({ id: inviteId })
		.resend.post();
	return {
		data: extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}

export async function revokeFinancingInvite(inviteId: string) {
	const { data, error } = await client.tourstack["financing-admin"].team
		.invites({ id: inviteId })
		.delete();
	return {
		data: extractPayload(data),
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
		data: extractPayload(data),
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
		data: extractPayload(data),
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
		data: extractPayload(data),
		success: !error && data?.success,
		error: extractError(error, data),
	};
}
