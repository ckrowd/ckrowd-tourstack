"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@ckrowd/ckrowd-prisma";

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

function extractError(err: unknown): string | undefined {
	if (!err) return undefined;
	if (typeof err === "string") return err;
	if (typeof err === "object" && err !== null) {
		// Handle better-auth error responses
		if ("error" in err && typeof (err as { error: unknown }).error === "string") {
			return (err as { error: string }).error;
		}
		if ("message" in err && typeof (err as { message: unknown }).message === "string") {
			return (err as { message: string }).message;
		}
		const v = (err as { value?: unknown }).value;
		if (typeof v === "string") return v;
		if (typeof v === "object" && v !== null && "message" in v) {
			return String((v as { message: unknown }).message);
		}
	}
	return undefined;
}

function extractPayload<T>(value: T | null | undefined) {
	if (value == null) return undefined;
	const response = value as unknown as Response;
	if (response.status === 401 && ["POST", "PUT", "DELETE"].includes(response.headers.get("X-Request-Method")??"GET")) {
		redirect( "/login" );
	}
	return ((value as T extends { data?: infer P } ? { data?: P } : never)
		?.data || undefined) as T extends { data?: infer P } ? P : undefined;
}

export async function auth() {
	try {
		const { data, error } = await client.profile.session.get();
		
		// If there's an error, return undefined to indicate no session
		if (error) {
			return undefined;
		}
		
		// Return the data if it contains a user, otherwise undefined
		return data && "user" in data ? data : undefined;
	} catch (err) {
		// If there's an exception (e.g., network error), return undefined
		return undefined;
	}
}

export { auth as getSession };

export async function signIn(formData: FormData) {
	const email = formData.get("email") as string;
	const password = formData.get("password") as string;

	if (!email || !password) {
		return { success: false, error: "Email and password are required" };
	}

	try {
		const result = await client.auth["sign-in"].email.post({
			email,
			password,
		});
		
		// Check if there's an error in the result
		if (result.error) {
			return { success: false, error: extractError(result.error) };
		}
		
		// If we get here, authentication was successful
		return { success: true, error: undefined };
	} catch (err) {
		// Handle network errors or other exceptions
		return { success: false, error: extractError(err) || "Authentication failed" };
	}
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

	try {
		const result = await client.auth["sign-up"].email.post({
			name: `${first_name} ${last_name}`,
			email,
			password,
		});
		
		// Check if there's an error in the result
		if (result.error) {
			return { success: false, error: extractError(result.error) };
		}
		
		// If we get here, registration was successful
		return { success: true, error: undefined };
	} catch (err) {
		// Handle network errors or other exceptions
		return { success: false, error: extractError(err) || "Registration failed" };
	}
}

export async function signOut(params: { redirectTo?: string } = {}) {
	try {
		const result = await client.auth["sign-out"].post();
		
		// Check if there's an error in the result
		if (result.error) {
			return {
				success: false,
				error: extractError(result.error),
				redirectTo: undefined,
			};
		}
		
		// If we get here, sign out was successful
		const jar = await cookies();
		jar.delete("better-auth.session_token");
		jar.delete("__Secure-better-auth.session_token");
		
		return {
			success: true,
			error: undefined,
			redirectTo: params.redirectTo ?? "/",
		};
	} catch (err) {
		// Handle network errors or other exceptions
		return {
			success: false,
			error: extractError(err) || "Sign out failed",
			redirectTo: undefined,
		};
	}
}

export async function getArtists(
	params?: Params<typeof client.tourstack.discovery.get>,
) {
	const { data, error } = await client.tourstack.discovery.get(
		params ? { query: params } : {},
	);
	return {
		data: extractPayload(data),
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
	const { data, error } = await client.tourstack.profile.get();
	return {
		data: extractPayload(data),
		success: !error && data?.success,
		error: extractError(error),
	};
}

export async function updateTourstackProfile(
	body: Payload<typeof client.tourstack.profile.patch>,
) {
	const { data, error } = await client.tourstack.profile.patch(body);
	return {
		data: extractPayload(data),
		success: !error && data?.success,
		error: extractError(error),
	};
}

// Dashboard

export async function getTourstackDashboard() {
	const { data, error } = await client.tourstack.dashboard.get();
	return {
		data: extractPayload(data),
		success: !error && data?.success,
		error: extractError(error),
	};
}

// EOIs

export async function getEOIs(status?: string) {
	const { data, error } = await client.tourstack.eoi.get(
		status ? { query: { status } } : {},
	);
	return {
		data: extractPayload(data),
		success: !error && data?.success,
		error: extractError(error),
	};
}

export async function getEOI(id: string) {
	const { data, error } = await client.tourstack.eoi({ id }).get();
	return {
		data: extractPayload(data),
		success: !error && data?.success,
		error: extractError(error),
	};
}

export async function createEOI(
	body: Payload<typeof client.tourstack.eoi.post>,
) {
	const { data, error } = await client.tourstack.eoi.post(body);
	return {
		data: extractPayload(data),
		success: !error && data?.success,
		error: extractError(error),
	};
}

// Tours
export async function getTours(status?: string) {
	const { data, error } = await client.tourstack.tours.get(
		status ? { query: { status } } : {},
	);
	return {
		data: extractPayload(data),
		success: !error && data?.success,
		error: extractError(error),
	};
}

export async function getTour(id: string) {
	const { data, error } = await client.tourstack.tours({ id }).get();
	return {
		data: extractPayload(data),
		success: !error && data?.success,
		error: extractError(error),
	};
}

export async function getTourMilestones(id: string) {
	const { data, error } = await client.tourstack.tours({ id }).milestones.get();
	return {
		data: extractPayload(data),
		success: !error && data?.success,
		error: extractError(error),
	};
}

// Financing
export async function getFinancingApplications(status?: string) {
	const { data, error } = await client.tourstack.financing.get(
		status ? { query: { status } } : {},
	);
	return {
		data: extractPayload(data),
		success: !error && data?.success,
		error: extractError(error),
	};
}

export async function getFinancingApplication(id: string) {
	const { data, error } = await client.tourstack.financing({ id }).get();
	return {
		data: extractPayload(data),
		success: !error && data?.success,
		error: extractError(error),
	};
}

export async function applyForFinancing(
	body: Payload<typeof client.tourstack.financing.post>,
) {
	const { data, error } = await client.tourstack.financing.post(body);
	return {
		data: extractPayload(data),
		success: !error && data?.success,
		error: extractError(error),
	};
}

// Workforce (crew)

export async function getCrewMembers(
	params?: Params<typeof client.tourstack.workforce.get>,
) {
	const { data, error } = await client.tourstack.workforce.get(
		params ? { query: params } : {},
	);
	return {
		data: extractPayload(data),
		success: !error && data?.success,
		error: extractError(error),
	};
}

export async function getCrewMember(id: string) {
	const { data, error } = await client.tourstack.workforce({ id }).get();
	return {
		data: extractPayload(data),
		success: !error && data?.success,
		error: extractError(error),
	};
}

export async function registerCrewMember(
	body: Payload<typeof client.tourstack.workforce.post>,
) {
	const { data, error } = await client.tourstack.workforce.post(body);
	return {
		data: extractPayload(data),
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

export async function createOnboardingLink(body: Payload<typeof client.tourstack["onboarding-links"]["post"]>) {
	const { data, error } = await client.tourstack["onboarding-links"].post(body);
	return {
		data: extractPayload(data),
		success: !error && data?.success,
		error: extractError(error),
	};
}

export async function getOnboardingLink(token: string) {
	const { data, error } = await client.tourstack["onboarding-links"]({
		token,
	}).get();
	return {
		data: extractPayload(data),
		success: !error && data?.success,
		error: extractError(error),
	};
}

export async function revokeOnboardingLink(token: string) {
	const { data, error } = await client.tourstack["onboarding-links"]({
		token,
	}).delete();
	return {
		data: extractPayload(data),
		success: !error && data?.success,
		error: extractError(error),
	};
}

export async function submitOnboardingLink(
	token: string,
	body: Payload<ReturnType<typeof client.tourstack["onboarding-links"]>["submit"]["post"]>,
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
