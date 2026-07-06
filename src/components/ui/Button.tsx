"use client";

import type { ComponentPropsWithoutRef } from "react";
import { Link } from "@/i18n/routing";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";

const base =
	"inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";

const variantClasses: Record<ButtonVariant, string> = {
	primary: "bg-primary text-on-primary hover:opacity-90",
	secondary:
		"bg-surface-container-low text-on-surface border border-outline-variant hover:bg-surface-container",
	outline: "border border-primary text-primary bg-transparent hover:bg-primary/10",
	ghost: "text-on-surface-variant hover:bg-surface-container-low",
};

// "Gradient CTA" from the mockup is a Primary button with a subtle gradient —
// not a distinct visual system, so it's a modifier rather than its own variant.
const gradientClasses = "bg-gradient-to-br from-primary to-[#CC4825] text-on-primary hover:opacity-90";

type CommonProps = {
	variant?: ButtonVariant;
	gradient?: boolean;
	className?: string;
	children: React.ReactNode;
};

type ButtonAsButton = CommonProps &
	ComponentPropsWithoutRef<"button"> & {
		href?: undefined;
	};

type ButtonAsLink = CommonProps &
	Omit<ComponentPropsWithoutRef<typeof Link>, "href"> & {
		href: ComponentPropsWithoutRef<typeof Link>["href"];
	};

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export default function Button({
	variant = "primary",
	gradient = false,
	className,
	children,
	...props
}: ButtonProps) {
	const variantClass = gradient && variant === "primary" ? gradientClasses : variantClasses[variant];
	const classes = `${base} ${variantClass} ${className ?? ""}`;

	if ("href" in props && props.href !== undefined) {
		const { href, ...linkProps } = props as ButtonAsLink;
		return (
			<Link href={href} className={classes} {...linkProps}>
				{children}
			</Link>
		);
	}

	const { type = "button", ...buttonProps } = props as ButtonAsButton;
	return (
		<button type={type} className={classes} {...buttonProps}>
			{children}
		</button>
	);
}
