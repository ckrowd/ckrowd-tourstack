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

export async function getOpportunity(id: string) {
	const client = await createServerClient();
	const { data, error } = await client.opportunities({ id }).get();
	return {
		data: data ?? undefined,
		success: !error,
		error: extractError(error),
	};
}

export async function applyForOpportunity(
	id: string,
	userEmail: string,
	userName?: string,
) {
	const client = await createServerClient();
	const { data, error } = await client
		.opportunities({ id })
		.apply.post({ userEmail, userName });
	return {
		data: data ?? undefined,
		success: !error,
		error: extractError(error),
	};
}
