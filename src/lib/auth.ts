import type { Session } from "@/context/AuthContext";

export interface AuthState {
	authenticated: boolean;
	email: string;
	displayName: string;
	profileComplete: boolean;
	role?: string;
}

export const EMPTY_AUTH_STATE: AuthState = {
	authenticated: false,
	email: "",
	displayName: "",
	profileComplete: false,
};

type SessionUser = {
	is_super_admin?: boolean | null;
};

export function isAdminSession(session: Session | null | undefined) {
	const user = session?.user as SessionUser | undefined;
	return user?.is_super_admin === true;
}

export function normalizeInternalPath(
	path: string | null | undefined,
	fallback = "/dashboard",
) {
	const value = path?.trim();
	if (!value || value.startsWith("//") || value.includes("://")) {
		return fallback;
	}

	return value.startsWith("/") ? value : `/${value}`;
}

export function isAdminPath(path: string | null | undefined) {
	const normalized = normalizeInternalPath(path, "/");
	const pathname = normalized.split(/[?#]/, 1)[0];
	return pathname === "/admin" || pathname.startsWith("/admin/");
}

export function getRegularLoginRedirectPath(path: string | null | undefined) {
	const normalized = normalizeInternalPath(path);
	return isAdminPath(normalized) ? "/dashboard" : normalized;
}
