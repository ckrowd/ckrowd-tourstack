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
