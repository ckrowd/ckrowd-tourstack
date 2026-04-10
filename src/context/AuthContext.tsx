"use client";

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import { getSession, signIn, signOut, signUp } from "@/app/actions";
import type { AuthState } from "@/lib/auth";

type SessionUser = {
	email?: string | null;
	name?: string | null;
	displayName?: string | null;
	role?: string | null;
};

type SessionAccount = {
	first_name?: string | null;
	last_name?: string | null;
	stage_name?: string | null;
	bio?: string | null;
	location?: string | null;
};

type SessionPayload =
	| {
			user?: SessionUser;
			account?: SessionAccount;
	  }
	| null
	| undefined;

interface AuthContextValue {
	auth: AuthState | null;
	isLoading: boolean;
	login: (email: string, password: string) => Promise<boolean>;
	register: (data: {
		firstName: string;
		lastName: string;
		email: string;
		password: string;
		confirmPassword: string;
	}) => Promise<boolean>;
	logout: () => Promise<void>;
	refreshAuth: () => Promise<AuthState | null>;
	markProfileComplete: () => void;
}

const AuthContext = createContext<AuthContextValue>({
	auth: null,
	isLoading: true,
	login: async () => false,
	register: async () => false,
	logout: async () => undefined,
	refreshAuth: async () => null,
	markProfileComplete: () => undefined,
});

function buildDisplayName(session: SessionPayload): string {
	const user = session?.user;
	const account = session?.account;
	const directName = user?.displayName || user?.name || account?.stage_name;
	if (directName) return directName;

	const firstName = account?.first_name?.trim() || "";
	const lastName = account?.last_name?.trim() || "";
	const fullName = `${firstName} ${lastName}`.trim();
	if (fullName) return fullName;

	return user?.email?.split("@")[0] || "TourStack User";
}

function toAuthState(session: SessionPayload): AuthState | null {
	if (!session?.user) return null;

	return {
		authenticated: true,
		email: session.user.email || "",
		displayName: buildDisplayName(session),
		profileComplete: Boolean(
			session.account?.bio ||
				session.account?.location ||
				session.account?.stage_name,
		),
		role: session.user.role || undefined,
	};
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [auth, setAuthState] = useState<AuthState | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const refreshAuth = useCallback(async () => {
		setIsLoading(true);
		try {
			const session = await getSession();
			const nextAuth = toAuthState(session);
			setAuthState(nextAuth);
			return nextAuth;
		} catch {
			setAuthState(null);
			return null;
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		void refreshAuth();
	}, [refreshAuth]);

	const login = useCallback(
		async (email: string, password: string) => {
			setIsLoading(true);
			try {
				const formData = new FormData();
				formData.set("email", email);
				formData.set("password", password);

				const result = await signIn(formData);
				if (!result.success) {
					throw new Error(result.error ?? "Invalid email or password");
				}

				const nextAuth = await refreshAuth();
				if (!nextAuth) {
					throw new Error("Signed in, but failed to load the session");
				}

				return true;
			} finally {
				setIsLoading(false);
			}
		},
		[refreshAuth],
	);

	const register = useCallback(
		async (data: {
			firstName: string;
			lastName: string;
			email: string;
			password: string;
			confirmPassword: string;
		}) => {
			setIsLoading(true);
			try {
				const formData = new FormData();
				formData.set("first_name", data.firstName);
				formData.set("last_name", data.lastName);
				formData.set("email", data.email);
				formData.set("password", data.password);
				formData.set("confirm_password", data.confirmPassword);

				const result = await signUp(formData);
				if (!result.success) {
					throw new Error(result.error ?? "Registration failed");
				}

				const nextAuth = await refreshAuth();
				return Boolean(nextAuth);
			} finally {
				setIsLoading(false);
			}
		},
		[refreshAuth],
	);

	const logout = useCallback(async () => {
		try {
			await signOut({ redirectTo: "/" });
		} finally {
			setAuthState(null);
			setIsLoading(false);
		}
	}, []);

	const markProfileComplete = useCallback(() => {
		setAuthState((current) =>
			current ? { ...current, profileComplete: true } : current,
		);
	}, []);

	return (
		<AuthContext.Provider
			value={{
				auth,
				isLoading,
				login,
				register,
				logout,
				refreshAuth,
				markProfileComplete,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	return useContext(AuthContext);
}
