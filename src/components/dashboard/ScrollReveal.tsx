"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Dashboard scroll-reveal engine. Mounted once in the (dashboard) layout; it
 * re-scans on every route change and reveals elements tagged `data-reveal`
 * (single) or `data-reveal-group` (staggered children) as they scroll into view.
 *
 * Implementation: IntersectionObserver + the Web Animations API. `el.animate()`
 * runs a one-shot compositor animation with its own timeline, so it can never
 * freeze mid-tween the way a stalled rAF/GSAP ticker can, and it leaves no
 * residual inline `transition` — so it never interferes with the cards' own
 * hover transitions.
 *
 * Safety contract:
 *  - Content is VISIBLE by default. We only ever hide-then-reveal, and only for
 *    elements that start BELOW the first viewport — so no-JS, SSR, and the CSS
 *    `.tsd-rise`/`.tsd-stagger` above-the-fold entrance motion are all untouched.
 *  - `prefers-reduced-motion` → no-op (nothing is ever hidden).
 */
const DURATION = 640;
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

function hiddenFrame(dir: string | null) {
	if (dir === "left") return { opacity: 0, transform: "translateX(-38px)" };
	if (dir === "right") return { opacity: 0, transform: "translateX(38px)" };
	return { opacity: 0, transform: "translateY(26px)", filter: "blur(6px)" };
}

function shownFrame(dir: string | null) {
	if (dir === "left" || dir === "right")
		return { opacity: 1, transform: "translateX(0)" };
	return { opacity: 1, transform: "translateY(0)", filter: "blur(0px)" };
}

export default function ScrollReveal() {
	const pathname = usePathname();

	useEffect(() => {
		if (
			typeof window === "undefined" ||
			typeof IntersectionObserver === "undefined" ||
			window.matchMedia("(prefers-reduced-motion: reduce)").matches
		) {
			return;
		}

		let observer: IntersectionObserver | null = null;
		let failsafe = 0;

		// Wait for the new route to paint before measuring positions.
		const start = window.setTimeout(() => {
			const root =
				document.querySelector<HTMLElement>(".ts-dash main") ??
				document.querySelector<HTMLElement>(".ts-dash");
			if (!root) return;

			// Never trust a zero/absent viewport height (embedded frames, some
			// capture contexts): if we can't measure the fold, reveal nothing —
			// leaving all content visible rather than risk hiding it with no way
			// for an IntersectionObserver (which needs a real viewport) to fire.
			const vh = window.innerHeight || document.documentElement.clientHeight;
			if (!vh || vh < 1) return;

			const belowFold = (el: Element) =>
				el.getBoundingClientRect().top > vh * 0.9;

			// [el, staggerIndex within its group] — index 0 for single elements.
			const targets: Array<[HTMLElement, number]> = [];

			root.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
				if (el.closest("[data-reveal-group]")) return;
				if (!belowFold(el)) return;
				el.style.opacity = "0";
				targets.push([el, 0]);
			});

			root
				.querySelectorAll<HTMLElement>("[data-reveal-group]")
				.forEach((group) => {
					if (!belowFold(group)) return;
					Array.from(group.children).forEach((child, i) => {
						if (!(child instanceof HTMLElement)) return;
						child.style.opacity = "0";
						targets.push([child, i]);
					});
				});

			if (!targets.length) return;

			const indexOf = new WeakMap<Element, number>();
			targets.forEach(([el, i]) => indexOf.set(el, i));

			observer = new IntersectionObserver(
				(entries, obs) => {
					entries.forEach((entry) => {
						if (!entry.isIntersecting) return;
						const el = entry.target as HTMLElement;
						obs.unobserve(el);
						// Only a direct [data-reveal="left|right"] uses a horizontal
						// slide; group children and plain [data-reveal] rise + unblur.
						const attr = el.getAttribute("data-reveal");
						const dir = attr === "left" || attr === "right" ? attr : null;
						const anim = el.animate([hiddenFrame(dir), shownFrame(dir)], {
							duration: DURATION,
							easing: EASE,
							delay: (indexOf.get(el) ?? 0) * 70,
							fill: "both",
						});
						anim.onfinish = () => {
							el.style.opacity = "";
							anim.cancel(); // drop the fill so no inline residual remains
						};
					});
				},
				// threshold 0 (fire as soon as any part crosses in) — a fixed
				// fraction like 0.15 can never be met by an element taller than
				// ~1/0.15 viewports, which would leave it stuck hidden. The negative
				// bottom margin delays the trigger until it's ~10% into view.
				{ threshold: 0, rootMargin: "0px 0px -10% 0px" },
			);

			targets.forEach(([el]) => observer?.observe(el));

			// Failsafe: one bounded sweep. If the observer never fired for an
			// element that is already within the viewport (e.g. layout thrash at
			// load), reveal it so content is never stuck hidden. Elements still
			// below the fold are left alone — they stay hidden until scrolled to,
			// where the observer (which works in any real viewport) reveals them.
			failsafe = window.setTimeout(() => {
				targets.forEach(([el]) => {
					if (
						el.style.opacity === "0" &&
						el.getBoundingClientRect().top < window.innerHeight
					) {
						el.style.opacity = "";
					}
				});
			}, 1600);
		}, 120);

		return () => {
			window.clearTimeout(start);
			window.clearTimeout(failsafe);
			observer?.disconnect();
		};
	}, [pathname]);

	return null;
}
