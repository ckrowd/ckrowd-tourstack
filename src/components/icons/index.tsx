/* ============================================================================
   TourStack dashboard icon library — vendored Lucide-style SVG glyphs.
   One consistent 24×24 stroke system (currentColor, round caps) curated to
   the glyphs the dashboard actually uses, replacing the Material Symbols
   icon font inside the redesigned promoter dashboard. Tree-shaken by
   definition: only the paths below ship.
   Usage: <Icon name="tours" size={18} /> — inherits text color.
   ============================================================================ */
import type { SVGProps } from "react";

const PATHS: Record<string, React.ReactNode> = {
	// ── navigation ──────────────────────────────────────────────────────────
	overview: (
		<>
			<rect x="3" y="3" width="7" height="7" rx="1.5" />
			<rect x="14" y="3" width="7" height="7" rx="1.5" />
			<rect x="14" y="14" width="7" height="7" rx="1.5" />
			<rect x="3" y="14" width="7" height="7" rx="1.5" />
		</>
	),
	tours: (
		<>
			<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
			<path d="M13 5v2" />
			<path d="M13 11v2" />
			<path d="M13 17v2" />
		</>
	),
	onboarding: (
		<>
			<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
			<circle cx="9" cy="7" r="4" />
			<path d="m16 11 2 2 4-4" />
		</>
	),
	stakeholders: (
		<>
			<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
			<circle cx="9" cy="7" r="4" />
			<path d="M22 21v-2a4 4 0 0 0-3-3.87" />
			<path d="M16 3.13a4 4 0 0 1 0 7.75" />
		</>
	),
	discovery: (
		<>
			<circle cx="12" cy="12" r="10" />
			<polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
		</>
	),
	financing: (
		<>
			<path d="M3 22h18" />
			<path d="M6 18v-7" />
			<path d="M10 18v-7" />
			<path d="M14 18v-7" />
			<path d="M18 18v-7" />
			<path d="m12 2 8 5H4Z" />
		</>
	),
	insurance: (
		<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
	),
	tickets: (
		<>
			<path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
			<path d="m9 12 2 2 4-4" />
		</>
	),
	ai: (
		<>
			<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
			<path d="M20 3v4" />
			<path d="M22 5h-4" />
		</>
	),
	profile: (
		<>
			<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
			<circle cx="12" cy="7" r="4" />
		</>
	),
	settings: (
		<>
			<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
			<circle cx="12" cy="12" r="3" />
		</>
	),

	// ── status + actions ────────────────────────────────────────────────────
	lock: (
		<>
			<rect x="3" y="11" width="18" height="11" rx="2" />
			<path d="M7 11V7a5 5 0 0 1 10 0v4" />
		</>
	),
	plus: (
		<>
			<path d="M5 12h14" />
			<path d="M12 5v14" />
		</>
	),
	"arrow-right": (
		<>
			<path d="M5 12h14" />
			<path d="m12 5 7 7-7 7" />
		</>
	),
	"arrow-left": (
		<>
			<path d="M19 12H5" />
			<path d="m12 19-7-7 7-7" />
		</>
	),
	"chevron-down": <path d="m6 9 6 6 6-6" />,
	"chevron-left": <path d="m15 18-6-6 6-6" />,
	"chevron-right": <path d="m9 18 6-6-6-6" />,
	check: <path d="M20 6 9 17l-5-5" />,
	x: (
		<>
			<path d="M18 6 6 18" />
			<path d="m6 6 12 12" />
		</>
	),
	search: (
		<>
			<circle cx="11" cy="11" r="8" />
			<path d="m21 21-4.3-4.3" />
		</>
	),
	bell: (
		<>
			<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
			<path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
		</>
	),
	edit: (
		<>
			<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
			<path d="m15 5 4 4" />
		</>
	),
	upload: (
		<>
			<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
			<path d="m17 8-5-5-5 5" />
			<path d="M12 3v12" />
		</>
	),
	"external-link": (
		<>
			<path d="M15 3h6v6" />
			<path d="M10 14 21 3" />
			<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
		</>
	),
	copy: (
		<>
			<rect x="8" y="8" width="14" height="14" rx="2" />
			<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
		</>
	),
	logout: (
		<>
			<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
			<path d="m16 17 5-5-5-5" />
			<path d="M21 12H9" />
		</>
	),

	// ── content ─────────────────────────────────────────────────────────────
	calendar: (
		<>
			<rect x="3" y="4" width="18" height="18" rx="2" />
			<path d="M16 2v4" />
			<path d="M8 2v4" />
			<path d="M3 10h18" />
		</>
	),
	"map-pin": (
		<>
			<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
			<circle cx="12" cy="10" r="3" />
		</>
	),
	music: (
		<>
			<path d="M9 18V5l12-2v13" />
			<circle cx="6" cy="18" r="3" />
			<circle cx="18" cy="16" r="3" />
		</>
	),
	wallet: (
		<>
			<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
			<path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
		</>
	),
	"trending-up": (
		<>
			<path d="M16 7h6v6" />
			<path d="m22 7-8.5 8.5-5-5L2 17" />
		</>
	),
	"trending-down": (
		<>
			<path d="M16 17h6v-6" />
			<path d="m22 17-8.5-8.5-5 5L2 7" />
		</>
	),
	"file-text": (
		<>
			<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
			<path d="M14 2v4a2 2 0 0 0 2 2h4" />
			<path d="M10 9H8" />
			<path d="M16 13H8" />
			<path d="M16 17H8" />
		</>
	),
	inbox: (
		<>
			<polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
			<path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
		</>
	),
	zap: (
		<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
	),
	stadium: (
		<>
			<ellipse cx="12" cy="5" rx="9" ry="3" />
			<path d="M3 5v14a9 3 0 0 0 18 0V5" />
			<path d="M3 12a9 3 0 0 0 18 0" />
		</>
	),
	clock: (
		<>
			<circle cx="12" cy="12" r="10" />
			<polyline points="12 6 12 12 16 14" />
		</>
	),
	phone: (
		<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
	),
	gavel: (
		<>
			<path d="m14.5 12.5-8 8a2.119 2.119 0 1 1-3-3l8-8" />
			<path d="m16 16 6-6" />
			<path d="m8 8 6-6" />
			<path d="m9 7 8 8" />
			<path d="m21 11-8-8" />
		</>
	),
	globe: (
		<>
			<circle cx="12" cy="12" r="10" />
			<path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
			<path d="M2 12h20" />
		</>
	),
	briefcase: (
		<>
			<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
			<rect x="2" y="6" width="20" height="14" rx="2" />
		</>
	),
	wrench: (
		<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
	),
	"check-circle": (
		<>
			<path d="M21.801 10A10 10 0 1 1 17 3.335" />
			<path d="m9 11 3 3L22 4" />
		</>
	),
	share: (
		<>
			<circle cx="18" cy="5" r="3" />
			<circle cx="6" cy="12" r="3" />
			<circle cx="18" cy="19" r="3" />
			<path d="m8.59 13.51 6.83 3.98" />
			<path d="m15.41 6.51-6.82 3.98" />
		</>
	),
	download: (
		<>
			<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
			<polyline points="7 10 12 15 17 10" />
			<path d="M12 15V3" />
		</>
	),
	star: (
		<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
	),
	"alert-circle": (
		<>
			<circle cx="12" cy="12" r="10" />
			<path d="M12 8v4" />
			<path d="M12 16h.01" />
		</>
	),
	"alert-triangle": (
		<>
			<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
			<path d="M12 9v4" />
			<path d="M12 17h.01" />
		</>
	),
	info: (
		<>
			<circle cx="12" cy="12" r="10" />
			<path d="M12 16v-4" />
			<path d="M12 8h.01" />
		</>
	),
	"help-circle": (
		<>
			<circle cx="12" cy="12" r="10" />
			<path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
			<path d="M12 17h.01" />
		</>
	),
	loader: <path d="M21 12a9 9 0 1 1-6.219-8.56" />,
	camera: (
		<>
			<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
			<circle cx="12" cy="13" r="3" />
		</>
	),
	lightbulb: (
		<>
			<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
			<path d="M9 18h6" />
			<path d="M10 22h4" />
		</>
	),
	trash: (
		<>
			<path d="M3 6h18" />
			<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
			<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
		</>
	),
	folder: (
		<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
	),
	shapes: (
		<>
			<path d="M8.3 10a.7.7 0 0 1-.626-1.079L11.4 3a.7.7 0 0 1 1.198-.043L16.3 8.9a.7.7 0 0 1-.572 1.1Z" />
			<rect x="3" y="14" width="7" height="7" rx="1" />
			<circle cx="17.5" cy="17.5" r="3.5" />
		</>
	),
	sliders: (
		<>
			<path d="M4 21v-7" />
			<path d="M4 10V3" />
			<path d="M12 21v-9" />
			<path d="M12 8V3" />
			<path d="M20 21v-5" />
			<path d="M20 12V3" />
			<path d="M2 14h4" />
			<path d="M10 8h4" />
			<path d="M18 16h4" />
		</>
	),
	"user-plus": (
		<>
			<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
			<circle cx="9" cy="7" r="4" />
			<path d="M19 8v6" />
			<path d="M22 11h-6" />
		</>
	),
	building: (
		<>
			<rect x="4" y="2" width="16" height="20" rx="2" />
			<path d="M9 22v-4h6v4" />
			<path d="M8 6h.01" />
			<path d="M16 6h.01" />
			<path d="M12 6h.01" />
			<path d="M12 10h.01" />
			<path d="M12 14h.01" />
			<path d="M16 10h.01" />
			<path d="M16 14h.01" />
			<path d="M8 10h.01" />
			<path d="M8 14h.01" />
		</>
	),
	smartphone: (
		<>
			<rect x="5" y="2" width="14" height="20" rx="2" />
			<path d="M12 18h.01" />
		</>
	),
	laptop: (
		<path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16" />
	),
	"credit-card": (
		<>
			<rect x="2" y="5" width="20" height="14" rx="2" />
			<path d="M2 10h20" />
		</>
	),
	"qr-code": (
		<>
			<rect x="3" y="3" width="5" height="5" rx="1" />
			<rect x="16" y="3" width="5" height="5" rx="1" />
			<rect x="3" y="16" width="5" height="5" rx="1" />
			<path d="M21 16h-3a2 2 0 0 0-2 2v3" />
			<path d="M21 21v.01" />
			<path d="M12 7v3a2 2 0 0 1-2 2H7" />
			<path d="M3 12h.01" />
			<path d="M12 3h.01" />
			<path d="M12 16v.01" />
			<path d="M16 12h1" />
			<path d="M21 12v.01" />
			<path d="M12 21v-1" />
		</>
	),
	"mail-check": (
		<>
			<path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8" />
			<path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
			<path d="m16 19 2 2 4-4" />
		</>
	),
	"shield-check": (
		<>
			<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
			<path d="m9 12 2 2 4-4" />
		</>
	),
	checkbox: (
		<>
			<path d="m9 11 3 3L22 4" />
			<path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
		</>
	),
	"bell-off": (
		<>
			<path d="M8.7 3A6 6 0 0 1 18 8a21.3 21.3 0 0 0 .6 5" />
			<path d="M17 17H3s3-2 3-9a4.67 4.67 0 0 1 .3-1.7" />
			<path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
			<path d="m2 2 20 20" />
		</>
	),
	"search-x": (
		<>
			<path d="m13.5 8.5-5 5" />
			<path d="m8.5 8.5 5 5" />
			<circle cx="11" cy="11" r="8" />
			<path d="m21 21-4.3-4.3" />
		</>
	),
	chart: (
		<>
			<path d="M3 3v16a2 2 0 0 0 2 2h16" />
			<path d="M18 17V9" />
			<path d="M13 17V5" />
			<path d="M8 17v-3" />
		</>
	),
	"plus-circle": (
		<>
			<circle cx="12" cy="12" r="10" />
			<path d="M8 12h8" />
			<path d="M12 8v8" />
		</>
	),
	send: (
		<>
			<path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
			<path d="m21.854 2.147-10.94 10.939" />
		</>
	),
	medal: (
		<>
			<path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15" />
			<path d="M11 12 5.12 2.2" />
			<path d="m13 12 5.88-9.8" />
			<path d="M8 7h8" />
			<circle cx="12" cy="17" r="5" />
			<path d="M12 18v-2h-.5" />
		</>
	),
	circle: <circle cx="12" cy="12" r="10" />,
	link: (
		<>
			<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
			<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
		</>
	),
	square: <rect x="3" y="3" width="18" height="18" rx="2" />,
	map: (
		<>
			<path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z" />
			<path d="M15 5.764v15" />
			<path d="M9 3.236v15" />
		</>
	),
	handshake: (
		<>
			<path d="m11 17 2 2a1 1 0 1 0 3-3" />
			<path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" />
			<path d="m21 3 1 11h-2" />
			<path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" />
			<path d="M3 4h8" />
		</>
	),
	route: (
		<>
			<circle cx="6" cy="19" r="3" />
			<path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
			<circle cx="18" cy="5" r="3" />
		</>
	),
	megaphone: (
		<>
			<path d="m3 11 18-5v12L3 14v-3z" />
			<path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
		</>
	),
	"id-card": (
		<>
			<path d="M16 10h2" />
			<path d="M16 14h2" />
			<path d="M6.17 15a3 3 0 0 1 5.66 0" />
			<circle cx="9" cy="11" r="2" />
			<rect x="2" y="5" width="20" height="14" rx="2" />
		</>
	),
	menu: (
		<>
			<path d="M4 6h16" />
			<path d="M4 12h16" />
			<path d="M4 18h16" />
		</>
	),
	sun: (
		<>
			<circle cx="12" cy="12" r="4" />
			<path d="M12 2v2" />
			<path d="M12 20v2" />
			<path d="m4.93 4.93 1.41 1.41" />
			<path d="m17.66 17.66 1.41 1.41" />
			<path d="M2 12h2" />
			<path d="M20 12h2" />
			<path d="m6.34 17.66-1.41 1.41" />
			<path d="m19.07 4.93-1.41 1.41" />
		</>
	),
	moon: <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />,
};

export type IconName = keyof typeof PATHS;

interface IconProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
	name: string;
	size?: number;
	strokeWidth?: number;
}

export default function Icon({
	name,
	size = 20,
	strokeWidth = 1.75,
	...props
}: IconProps) {
	const glyph = PATHS[name];
	if (!glyph) return null;
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={strokeWidth}
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			{...props}
		>
			{glyph}
		</svg>
	);
}
