import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
	locales: ["en", "fr"],
	defaultLocale: "en",
	// Don't override the URL-specified locale with the browser's Accept-Language
	// header — only honour what the user explicitly set.
	localeDetection: false,
	// Persist the user's locale choice in a NEXT_LOCALE cookie so page reloads
	// and new tabs stay on the same language without requiring the URL prefix.
	localeCookie: true,
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter, getPathname } =
	createNavigation(routing);
