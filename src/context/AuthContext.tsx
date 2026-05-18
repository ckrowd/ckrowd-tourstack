"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSession, signIn, signInAdmin, signOut, signUp } from "@/app/actions";

export type Session = Awaited<ReturnType<typeof getSession>>;

export function useSession() {
	return useQuery({
		queryKey: ["session"],
		queryFn: getSession,
		retry: 2,
		staleTime: 60_000,
	});
}

export function useLogin() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ email, password }: { email: string; password: string }) =>
			signIn(email, password),
		onSuccess: (result) => {
			if (result.success) {
				void queryClient.invalidateQueries({ queryKey: ["session"] });
			}
		},
	});
}

export function useAdminLogin() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ email, password }: { email: string; password: string }) =>
			signInAdmin(email, password),
		onSuccess: (result) => {
			if (result.success) {
				void queryClient.invalidateQueries({ queryKey: ["session"] });
			} else {
				queryClient.setQueryData(["session"], null);
			}
		},
	});
}

export function useRegister() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			firstName,
			lastName,
			email,
			password,
			confirmPassword,
		}: {
			firstName: string;
			lastName: string;
			email: string;
			password: string;
			confirmPassword: string;
		}) => signUp(`${firstName} ${lastName}`, email, password, confirmPassword),
		onSuccess: (result) => {
			if (result.success) {
				void queryClient.invalidateQueries({ queryKey: ["session"] });
			}
		},
	});
}

export function useLogout() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: signOut,
		onSettled: () => {
			queryClient.setQueryData(["session"], null);
		},
	});
}
