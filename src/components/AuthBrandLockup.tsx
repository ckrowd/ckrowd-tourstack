import { useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/routing";

/**
 * Brand lockup shown at the top of every auth page (login, register,
 * verify-email, etc.). Always renders the CKrowd mark plus the
 * "TourStack by CKrowd" lockup so the surface stays consistent across
 * the user app, admin portals, and onboarding flows.
 */
export default function AuthBrandLockup() {
	const tCommon = useTranslations("Common");
	return (
		<Link
			href="/"
			className="flex items-center justify-center gap-2.5"
			aria-label={tCommon("brandLockupLabel")}
		>
			<Image
				src="/ckrowd-logo.png"
				alt={tCommon("logoAlt")}
				width={36}
				height={36}
				priority
			/>
			<span className="flex flex-col leading-tight text-left">
				<span className="text-lg font-black tracking-tight text-primary font-(family-name:--font-manrope)">
					{tCommon("brandName")}
				</span>
				<span className="text-[10px] font-semibold text-on-surface-variant font-(family-name:--font-manrope)">
					{tCommon("brandBy")}
				</span>
			</span>
		</Link>
	);
}
