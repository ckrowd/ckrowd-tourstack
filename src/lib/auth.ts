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

/** TourStack admin portal scopes. Each admin account holds exactly one. */
export type AdminScope = "platform" | "insurance" | "financing";

type SessionUser = {
	is_super_admin?: boolean | null;
	tourstack_admin_role?: AdminScope | null;
};

/** The TourStack admin scope on the session, or null for non-admins. */
export function getAdminScope(
	session: Session | null | undefined,
): AdminScope | null {
	const user = session?.user as SessionUser | undefined;
	return user?.tourstack_admin_role ?? null;
}

/** True when the session belongs to any TourStack admin (any scope). */
export function isAdminSession(session: Session | null | undefined) {
	return getAdminScope(session) !== null;
}

export function isPlatformAdmin(session: Session | null | undefined) {
	return getAdminScope(session) === "platform";
}

export function isInsuranceAdmin(session: Session | null | undefined) {
	return getAdminScope(session) === "insurance";
}

export function isFinancingAdmin(session: Session | null | undefined) {
	return getAdminScope(session) === "financing";
}

const ADMIN_SCOPE_HOME: Record<AdminScope, string> = {
	platform: "/admin",
	insurance: "/insurance-admin",
	financing: "/financing-admin",
};

/**
 * Landing path for the session's admin scope (without locale prefix), or
 * null when the session is not an admin.
 */
export function adminHomePath(
	session: Session | null | undefined,
): string | null {
	const scope = getAdminScope(session);
	return scope ? ADMIN_SCOPE_HOME[scope] : null;
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
	return ["/admin", "/insurance-admin", "/financing-admin"].some(
		(base) => pathname === base || pathname.startsWith(`${base}/`),
	);
}

export function getRegularLoginRedirectPath(path: string | null | undefined) {
	const normalized = normalizeInternalPath(path);
	return isAdminPath(normalized) ? "/dashboard" : normalized;
}
