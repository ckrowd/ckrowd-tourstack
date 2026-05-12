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
	async onResponse(response) {
		const responseCookies = extractResponseCookies(response);
		if (responseCookies.length > 0) {
			const jar = await cookies();
			for (const cookie of responseCookies) {
				jar.set(cookie.name, cookie.value, cookie.options);
			}
		}
		return response;
	},
});

function extractError(err: any): string {
	return err?.value?.error ?? err?.value?.message ?? "Something went wrong";
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
	const { data, error } = await client.profile.session.get();
	if (error || !data || !("user" in data)) return null;
	return data;
}

export async function signIn(email: string, password: string) {
	const { error } = await client.auth["sign-in"].email.post({
		email,
		password,
	});
	if (error) return { success: false, error: extractError(error) };
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

export async function getArtists(
	params?: Params<typeof client.tourstack.discovery.get>,
) {
	const { data, error, status, headers } = await client.tourstack.discovery.get(
		params ? { query: params } : {},
	);
	return {
		data: extractPayload(data, { status, headers }),
		success: !error && data?.success,
		error: extractError(error),
	};
}

export async function getArtist(id: string) {
	const { data, error } = await client.tourstack.discovery({ id }).get();
	return {
		data: data?.data ? data.data : undefined,
		success: !error && data?.success,
		error: extractError(error),
	};
}

// Profile

export async function getTourstackProfile() {
	const { data, error, status, headers } = await client.tourstack.profile.get();
	return {
		data: extractPayload(data, { status, headers }),
		success: !error && data?.success,
		error: extractError(error),
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
		error: extractError(error),
	};
}

// Dashboard

export async function getTourstackDashboard() {
	const { data, error, status, headers } =
		await client.tourstack.dashboard.get();
	return {
		data: extractPayload(data, { status, headers }),
		success: !error && data?.success,
		error: extractError(error),
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
		error: extractError(error),
	};
}

export async function getEOI(id: string) {
	const { data, error, status, headers } = await client.tourstack
		.eoi({ id })
		.get();
	return {
		data: extractPayload(data, { status, headers }),
		success: !error && data?.success,
		error: extractError(error),
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
		error: extractError(error),
	};
}

// Tours
export async function getTours(status?: string) {
	const {
		data,
		error,
		status: responseStatus,
		headers,
	} = await client.tourstack.tours.get(status ? { query: { status } } : {});
	return {
		data: extractPayload(data, { status: responseStatus, headers }),
		success: !error && data?.success,
		error: extractError(error),
	};
}

export async function getTour(id: string) {
	const { data, error, status, headers } = await client.tourstack
		.tours({ id })
		.get();
	return {
		data: extractPayload(data, { status, headers }),
		success: !error && data?.success,
		error: extractError(error),
	};
}

export async function getTourMilestones(id: string) {
	const { data, error, status, headers } = await client.tourstack
		.tours({ id })
		.milestones.get();
	return {
		data: extractPayload(data, { status, headers }),
		success: !error && data?.success,
		error: extractError(error),
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
		error: extractError(error),
	};
}

export async function getFinancingApplication(id: string) {
	const { data, error, status, headers } = await client.tourstack
		.financing({ id })
		.get();
	return {
		data: extractPayload(data, { status, headers }),
		success: !error && data?.success,
		error: extractError(error),
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
		error: extractError(error),
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
		error: extractError(error),
	};
}

export async function getCrewMember(id: string) {
	const { data, error, status, headers } = await client.tourstack
		.workforce({ id })
		.get();
	return {
		data: extractPayload(data, { status, headers }),
		success: !error && data?.success,
		error: extractError(error),
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
		error: extractError(error),
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
		error: extractError(error),
	};
}

// Onboarding links

export async function getOnboardingLinks() {
	const { data, error } = await client.tourstack["onboarding-links"].get();
	return {
		data: extractPayload(data),
		success: !error && data?.success,
		error: extractError(error),
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
		error: extractError(error),
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
		error: extractError(error),
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
		error: extractError(error),
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
		error: extractError(error),
	};
}

export async function getAdminTours(status?: string) {
	const { data, error } = await client.tourstack.admin.tours.get(
		status ? { query: { status } } : {},
	);
	return {
		data: extractPayload(data),
		success: !error && data?.success,
		error: extractError(error),
	};
}

export async function createAdminTour(
	body: Payload<typeof client.tourstack.admin.tours.post>,
) {
	const { data, error, status, headers } =
		await client.tourstack.admin.tours.post(body);
	return {
		data: extractPayload(data, { status, headers }),
		success: !error && data?.success,
		error: extractError(error),
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

// Newsletter

export async function subscribeNewsletter(email: string) {
	// @ts-expect-error - Eden Treaty mistyps newsletter.subscribe as EdenWS (callable); .post exists at runtime
	const { data, error } = await client.newsletter.subscribe.post({ email });
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
		error: extractError(error),
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
		error: extractError(error),
	};
}
