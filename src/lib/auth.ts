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

/** TourStack admin portal scopes. An account may hold several. */
export type AdminScope = "platform" | "insurance" | "financing";

type SessionUser = {
	is_super_admin?: boolean | null;
	/** Legacy single scope, kept as a fallback during rollout. */
	tourstack_admin_role?: AdminScope | null;
	/** Source of truth: every scope the account holds. */
	tourstack_admin_roles?: AdminScope[] | null;
};

// Order used when a single landing portal must be chosen for a multi-role admin.
const SCOPE_PRECEDENCE: AdminScope[] = ["platform", "financing", "insurance"];

/** Every TourStack admin scope on the session (empty for non-admins). */
export function getAdminScopes(
	session: Session | null | undefined,
): AdminScope[] {
	const user = session?.user as SessionUser | undefined;
	const set = new Set<AdminScope>(user?.tourstack_admin_roles ?? []);
	if (user?.tourstack_admin_role) set.add(user.tourstack_admin_role);
	return SCOPE_PRECEDENCE.filter((s) => set.has(s));
}

/** True when the session holds the given TourStack admin scope. */
export function hasAdminScope(
	session: Session | null | undefined,
	scope: AdminScope,
) {
	return getAdminScopes(session).includes(scope);
}

/** True when the session belongs to any TourStack admin (any scope). */
export function isAdminSession(session: Session | null | undefined) {
	return getAdminScopes(session).length > 0;
}

export function isPlatformAdmin(session: Session | null | undefined) {
	return hasAdminScope(session, "platform");
}

export function isInsuranceAdmin(session: Session | null | undefined) {
	return hasAdminScope(session, "insurance");
}

export function isFinancingAdmin(session: Session | null | undefined) {
	return hasAdminScope(session, "financing");
}

const ADMIN_SCOPE_HOME: Record<AdminScope, string> = {
	platform: "/admin",
	insurance: "/insurance-admin",
	financing: "/financing-admin",
};

/**
 * Default landing path for an admin session (without locale prefix), or null
 * when the session is not an admin. For a multi-role admin this is the
 * highest-precedence portal; the others remain reachable by navigation.
 */
export function adminHomePath(
	session: Session | null | undefined,
): string | null {
	const [scope] = getAdminScopes(session);
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

/** True when the TourstackProfile for this session has role === artist_mgmt. */
export function isArtmgmtProfile(profile: { role?: string | null } | null | undefined) {
	return profile?.role === "artist_mgmt";
}
