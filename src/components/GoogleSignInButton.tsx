"use client";

import { useMutation } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

/**
 * "Continue with Google" button. Asks the backend for the OAuth consent URL
 * and redirects the browser to it; the user returns to `callbackPath` once
 * Google completes the flow.
 */
export default function GoogleSignInButton({
	callbackPath = "/dashboard",
}: {
	callbackPath?: string;
}) {
	const t = useTranslations("Auth");
	const locale = useLocale();
	const [error, setError] = useState<string | null>(null);

	const mutation = useMutation({
		mutationFn: async () => {
			const origin = window.location.origin;
			const path = callbackPath.startsWith("/") ? callbackPath : `/${callbackPath}`;
			const callbackURL = `${origin}/${locale}${path}`;

			// Use the API route instead of a server action so that Set-Cookie
			// headers from the backend (with Domain=.ckrowd.com) are forwarded
			// directly to the browser. Server actions go through Next.js's cookie
			// jar which strips the domain, preventing the state cookie from
			// reaching gateway.ckrowd.com on the OAuth callback.
			const res = await fetch("/api/auth/google", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ provider: "google", callbackURL, redirect: false }),
			});

			const data = await res.json();
			if (!res.ok || !data?.url) {
				return { success: false as const, error: data?.error ?? t("googleError") };
			}
			return { success: true as const, url: data.url as string };
		},
		onSuccess: (result) => {
			if (result.success) {
				window.location.href = result.url;
			} else {
				setError(result.error ?? t("googleError"));
			}
		},
		onError: () => setError(t("googleError")),
	});

	return (
		<div>
			<button
				type="button"
				onClick={() => {
					setError(null);
					mutation.mutate();
				}}
				disabled={mutation.isPending}
				className="w-full flex items-center justify-center gap-3 py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition-all active:scale-[0.98] disabled:opacity-60"
			>
				<svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
					<path
						fill="#4285F4"
						d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
					/>
					<path
						fill="#34A853"
						d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
					/>
					<path
						fill="#FBBC05"
						d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"
					/>
					<path
						fill="#EA4335"
						d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
					/>
				</svg>
				{mutation.isPending ? t("googleConnecting") : t("continueWithGoogle")}
			</button>
			{error && (
				<p className="mt-2 text-sm text-red-600 font-medium" role="alert">
					{error}
				</p>
			)}
		</div>
	);
}
