import { getRequestConfig } from "next-intl/server";
import enMessages from "../../messages/en.json";
import frMessages from "../../messages/fr.json";
import { routing } from "./routing";

const messageMap = {
	en: enMessages,
	fr: frMessages,
} as const;

export default getRequestConfig(async ({ requestLocale }) => {
	let locale = await requestLocale;

	if (!locale || !routing.locales.includes(locale as "en" | "fr")) {
		locale = routing.defaultLocale;
	}

	return {
		locale,
		messages: messageMap[locale as keyof typeof messageMap],
	};
});
