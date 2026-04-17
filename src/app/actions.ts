"use server";

import { cookies } from "next/headers";
import { createClient } from "@ckrowd/ckrowd-prisma";

async function createServerClient() {
	const cookieJar = await cookies();
	const cookieString = cookieJar
		.getAll()
		.map((c) => `${c.name}=${c.value}`)
		.join("; ");

	return createClient({
		async onRequest(_path, options) {
			return {
				...options,
				headers: {
					...(options.headers as Record<string, string>),
					Cookie: cookieString,
				},
			};
		},
		async onResponse(response) {
			const setCookies = response.headers.getSetCookie?.() ?? [];
			if (setCookies.length > 0) {
				const jar = await cookies();
				for (const cookieStr of setCookies) {
					const parts = cookieStr.split(";").map((p) => p.trim());
					const nameValue = parts[0];
					if (!nameValue) continue;
					const eqIdx = nameValue.indexOf("=");
					if (eqIdx === -1) continue;
					const name = nameValue.slice(0, eqIdx).trim();
					const value = nameValue.slice(eqIdx + 1).trim();
					if (name && value) jar.set(name, value);
				}
			}
			return response;
		},
	});
}

function extractError(err: unknown): string | undefined {
	if (!err) return undefined;
	if (typeof err === "string") return err;
	if (typeof err === "object" && err !== null) {
		const v = (err as { value?: unknown }).value;
		if (typeof v === "string") return v;
		if (typeof v === "object" && v !== null && "message" in v) {
			return String((v as { message: unknown }).message);
		}
	}
	return undefined;
}

export async function auth() {
	const client = await createServerClient();
	const { data } = await client.profile.session.get();
	return data ?? undefined;
}

export { auth as getSession };

export async function signIn(formData: FormData) {
	const email = formData.get("email") as string;
	const password = formData.get("password") as string;

	if (!email || !password) {
		return { success: false, error: "Email and password are required" };
	}

	const client = await createServerClient();
	const { error } = await client.auth["sign-in"].email.post({
		email,
		password,
	});
	return { success: !error, error: extractError(error) };
}

export async function signUp(formData: FormData) {
	const first_name = formData.get("first_name") as string;
	const last_name = formData.get("last_name") as string;
	const email = formData.get("email") as string;
	const password = formData.get("password") as string;
	const confirm_password = formData.get("confirm_password") as string;

	if (!first_name || !last_name || !email || !password) {
		return { success: false, error: "All fields are required" };
	}

	if (password !== confirm_password) {
		return { success: false, error: "Passwords don't match" };
	}

	const client = await createServerClient();
	const { error } = await client.auth["sign-up"].email.post({
		name: `${first_name} ${last_name}`,
		email,
		password,
	});
	return { success: !error, error: extractError(error) };
}

export async function signOut(params: { redirectTo?: string } = {}) {
	const client = await createServerClient();
	const { error } = await client.auth["sign-out"].post();
	if (!error) {
		const jar = await cookies();
		jar.delete("better-auth.session_token");
		jar.delete("__Secure-better-auth.session_token");
	}
	return {
		success: !error,
		error: extractError(error),
		redirectTo: !error ? (params.redirectTo ?? "/") : undefined,
	};
}

export async function getArtists(params?: {
	genre?: string;
	region?: string;
	feeMin?: string;
	feeMax?: string;
	trending?: string;
}) {
	const client = await createServerClient();
	const { data, error } = await client.tourstack.discovery.get(
		params ? { query: params } : {},
	);
	return {
		data: data ?? undefined,
		success: !error,
		error: extractError(error),
	};
}

export async function getArtist(id: string) {
	const client = await createServerClient();
	const { data, error } = await client.tourstack.discovery({ id }).get();
	return {
		data: data?.data ? data.data : undefined,
		success: !error,
		error: extractError(error),
	};
}

// Profile

export async function getTourstackProfile() {
	const client = await createServerClient();
	const { data, error } = await client.tourstack.profile.get();
	return {
		data: data ?? undefined,
		success: !error,
		error: extractError(error),
	};
}

export async function updateTourstackProfile(body: {
	companyName?: string;
	tradingName?: string;
	contactPerson?: string;
	jobTitle?: string;
	bio?: string;
	phone?: string;
	country?: string;
	city?: string;
	websiteUrl?: string;
	instagramHandle?: string;
}) {
	const client = await createServerClient();
	const { data, error } = await client.tourstack.profile.patch(body);
	return {
		data: data ?? undefined,
		success: !error,
		error: extractError(error),
	};
}

// Dashboard

export async function getTourstackDashboard() {
	const client = await createServerClient();
	const { data, error } = await client.tourstack.dashboard.get();
	return {
		data: data ?? undefined,
		success: !error,
		error: extractError(error),
	};
}

// EOIs

export async function getEOIs(status?: string) {
	const client = await createServerClient();
	const { data, error } = await client.tourstack.eoi.get(
		status ? { query: { status } } : {},
	);
	return {
		data: data ?? undefined,
		success: !error,
		error: extractError(error),
	};
}

export async function getEOI(id: string) {
	const client = await createServerClient();
	const { data, error } = await client.tourstack.eoi({ id }).get();
	return {
		data: data ?? undefined,
		success: !error,
		error: extractError(error),
	};
}

export async function createEOI(body: {
	artistId: string;
	city: string;
	venue?: string;
	capacity?: number;
	audience?: string;
	notes?: string;
	budget?: number;
	fundingType?: string;
}) {
	const client = await createServerClient();
	const { data, error } = await client.tourstack.eoi.post(body);
	return {
		data: data ?? undefined,
		success: !error,
		error: extractError(error),
	};
}

// Tours

export async function getTours(status?: string) {
	const client = await createServerClient();
	const { data, error } = await client.tourstack.tours.get(
		status ? { query: { status } } : {},
	);
	return {
		data: data ?? undefined,
		success: !error,
		error: extractError(error),
	};
}

export async function getTour(id: string) {
	const client = await createServerClient();
	const { data, error } = await client.tourstack.tours({ id }).get();
	return {
		data: data ?? undefined,
		success: !error,
		error: extractError(error),
	};
}

export async function getTourMilestones(id: string) {
	const client = await createServerClient();
	const { data, error } = await client.tourstack.tours({ id }).milestones.get();
	return {
		data: data ?? undefined,
		success: !error,
		error: extractError(error),
	};
}

// Financing

export async function getFinancingApplications(status?: string) {
	const client = await createServerClient();
	const { data, error } = await client.tourstack.financing.get(
		status ? { query: { status } } : {},
	);
	return {
		data: data ?? undefined,
		success: !error,
		error: extractError(error),
	};
}

export async function getFinancingApplication(id: string) {
	const client = await createServerClient();
	const { data, error } = await client.tourstack.financing({ id }).get();
	return {
		data: data ?? undefined,
		success: !error,
		error: extractError(error),
	};
}

export async function applyForFinancing(body: {
	product:
		| "Tour Stop Advance"
		| "Venue Build-Out Credit"
		| "Event Insurance Bundle"
		| "Marketing & Ticketing Float";
	amountRequested: number;
	tourId?: string;
	currency?: string;
	documents?: string[];
}) {
	const client = await createServerClient();
	const { data, error } = await client.tourstack.financing.post(body);
	return {
		data: data ?? undefined,
		success: !error,
		error: extractError(error),
	};
}

// Workforce (crew)

export async function getCrewMembers(params?: {
	status?: string;
	role?: string;
	tier?: string;
}) {
	const client = await createServerClient();
	const { data, error } = await client.tourstack.workforce.get(
		params ? { query: params } : {},
	);
	return {
		data: data ?? undefined,
		success: !error,
		error: extractError(error),
	};
}

export async function getCrewMember(id: string) {
	const client = await createServerClient();
	const { data, error } = await client.tourstack.workforce({ id }).get();
	return {
		data: data ?? undefined,
		success: !error,
		error: extractError(error),
	};
}

export async function registerCrewMember(body: {
	fullName: string;
	email: string;
	phone?: string;
	country?: string;
	city?: string;
	role: string;
	yearsExperience: string;
	largestEvent: string;
	tourAvailability: string;
	deployIn48h?: boolean;
	crossBorderDocs?: boolean;
	craftTraining?: boolean;
	firstAid?: boolean;
}) {
	const client = await createServerClient();
	const { data, error } = await client.tourstack.workforce.post(body);
	return {
		data: data ?? undefined,
		success: !error,
		error: extractError(error),
	};
}

// Stakeholder onboarding (direct)

export async function registerStakeholder(body: {
	category: "service" | "workforce" | "artmgmt";
	name: string;
	email: string;
	phone: string;
	company?: string;
	country: string;
	extraData?: Record<string, unknown>;
}) {
	const client = await createServerClient();
	const { data, error } = await client.tourstack.onboarding.post(body);
	return {
		data: data ?? undefined,
		success: !error,
		error: extractError(error),
	};
}

// Onboarding links

export async function getOnboardingLinks() {
	const client = await createServerClient();
	const { data, error } = await client.tourstack["onboarding-links"].get();
	return {
		data: data ?? undefined,
		success: !error,
		error: extractError(error),
	};
}

export async function createOnboardingLink(body: {
	category: "service" | "workforce" | "artmgmt";
	label?: string;
	expiresAt?: string;
}) {
	const client = await createServerClient();
	const { data, error } = await client.tourstack["onboarding-links"].post(body);
	return {
		data: data ?? undefined,
		success: !error,
		error: extractError(error),
	};
}

export async function getOnboardingLink(token: string) {
	const client = await createServerClient();
	const { data, error } = await client.tourstack["onboarding-links"]({
		token,
	}).get();
	return {
		data: data ?? undefined,
		success: !error,
		error: extractError(error),
	};
}

export async function revokeOnboardingLink(token: string) {
	const client = await createServerClient();
	const { data, error } = await client.tourstack["onboarding-links"]({
		token,
	}).delete();
	return {
		data: data ?? undefined,
		success: !error,
		error: extractError(error),
	};
}

export async function submitOnboardingLink(
	token: string,
	body: {
		name: string;
		email: string;
		phone: string;
		company?: string;
		country: string;
		extraData?: Record<string, unknown>;
	},
) {
	const client = await createServerClient();
	const { data, error } = await client.tourstack["onboarding-links"]({
		token,
	}).submit.post(body);
	return {
		data: data ?? undefined,
		success: !error,
		error: extractError(error),
	};
}

// Admin

export async function getAdminEOIs(status?: string) {
	const client = await createServerClient();
	const { data, error } = await client.tourstack.admin.eois.get(
		status ? { query: { status } } : {},
	);
	return {
		data: data ?? undefined,
		success: !error,
		error: extractError(error),
	};
}

export async function getAdminTours(status?: string) {
	const client = await createServerClient();
	const { data, error } = await client.tourstack.admin.tours.get(
		status ? { query: { status } } : {},
	);
	return {
		data: data ?? undefined,
		success: !error,
		error: extractError(error),
	};
}
