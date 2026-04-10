"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getOpportunitiesPaginated } from "@/app/actions";
import TopNav from "@/components/TopNav";

type OpportunityRecord = NonNullable<
	Awaited<ReturnType<typeof getOpportunitiesPaginated>>["data"]
>[number];

type OpportunityFilters = {
	search: string;
	location: string;
	category: string;
	roleType: string;
};

const PAGE_SIZE = 12;

const emptyFilters: OpportunityFilters = {
	search: "",
	location: "",
	category: "",
	roleType: "",
};

function formatDate(value: string | Date | null | undefined) {
	if (!value) return "Recently posted";
	const date = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(date.getTime())) return "Recently posted";
	return new Intl.DateTimeFormat("en", {
		month: "short",
		day: "numeric",
		year: "numeric",
	}).format(date);
}

function formatSalary(value: string | null | undefined) {
	if (!value?.trim()) return "Budget on request";
	return value;
}

function getApplicationHref(opportunity: OpportunityRecord) {
	return `/eoi?opportunity=${encodeURIComponent(opportunity.id)}`;
}

function hasSupportedImageSource(value: string | null | undefined) {
	return value?.startsWith("https://lh3.googleusercontent.com") ?? false;
}

function OpportunityVisual({
	opportunity,
}: {
	opportunity: OpportunityRecord;
}) {
	const image = opportunity.image ?? undefined;
	const imageSrc = hasSupportedImageSource(image) ? image : null;
	const titleInitial = opportunity.title.charAt(0).toUpperCase();

	if (imageSrc) {
		return (
			<Image
				src={imageSrc}
				alt={opportunity.title}
				fill
				className="object-cover transition duration-500 group-hover:scale-105"
				sizes="(max-width: 768px) 100vw, 33vw"
			/>
		);
	}

	return (
		<div className="flex h-full min-h-56 flex-col justify-between bg-gradient-to-br from-[#FF5A30] via-[#FF7E55] to-slate-900 p-6 text-white">
			<div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-white/70">
				<span className="h-2 w-2 rounded-full bg-white/70" />
				{opportunity.category ?? "Live opportunity"}
			</div>
			<div>
				<div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-2xl font-black backdrop-blur-sm">
					{titleInitial}
				</div>
				<p className="text-lg font-extrabold leading-tight">
					{opportunity.title}
				</p>
				<p className="mt-1 text-sm text-white/80">{opportunity.company}</p>
			</div>
		</div>
	);
}

function OpportunityCard({ opportunity }: { opportunity: OpportunityRecord }) {
	const href = getApplicationHref(opportunity);

	return (
		<article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
			<div className="relative min-h-56 overflow-hidden bg-slate-100">
				<OpportunityVisual opportunity={opportunity} />
			</div>

			<div className="space-y-4 p-6">
				<div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">
					<span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
						{opportunity.category ?? "General"}
					</span>
					<span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
						{opportunity.role_type ?? "Open role"}
					</span>
				</div>

				<div>
					<h2 className="text-xl font-extrabold tracking-tight text-slate-950">
						{opportunity.title}
					</h2>
					<p className="mt-1 text-sm font-medium text-slate-500">
						{opportunity.company}
					</p>
				</div>

				<div className="grid grid-cols-1 gap-3 text-sm text-slate-600 sm:grid-cols-2">
					<div>
						<span className="block text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
							Location
						</span>
						<span className="mt-1 block font-semibold text-slate-900">
							{opportunity.location}
						</span>
					</div>
					<div>
						<span className="block text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
							Salary
						</span>
						<span className="mt-1 block font-semibold text-slate-900">
							{formatSalary(opportunity.salary)}
						</span>
					</div>
					<div>
						<span className="block text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
							Posted
						</span>
						<span className="mt-1 block font-semibold text-slate-900">
							{formatDate(opportunity.date_posted)}
						</span>
					</div>
					<div>
						<span className="block text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
							Applications
						</span>
						<span className="mt-1 block font-semibold text-slate-900">
							{opportunity.applied_users.length}
						</span>
					</div>
				</div>

				<p className="text-sm leading-6 text-slate-600">{opportunity.about}</p>

				<div className="flex flex-wrap gap-3 pt-2">
					<Link
						href={href}
						className="inline-flex items-center justify-center rounded-full bg-[#FF5A30] px-5 py-3 text-sm font-bold text-white transition hover:opacity-90"
					>
						Apply now
					</Link>
					<Link
						href={href}
						className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
					>
						Open EOI
					</Link>
				</div>
			</div>
		</article>
	);
}

function LoadingCard() {
	return (
		<div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
			<div className="h-56 animate-pulse bg-slate-200" />
			<div className="space-y-4 p-6">
				<div className="h-5 w-32 animate-pulse rounded-full bg-slate-200" />
				<div className="h-7 w-3/4 animate-pulse rounded-full bg-slate-200" />
				<div className="grid grid-cols-2 gap-3">
					<div className="h-14 animate-pulse rounded-2xl bg-slate-100" />
					<div className="h-14 animate-pulse rounded-2xl bg-slate-100" />
				</div>
				<div className="h-16 animate-pulse rounded-2xl bg-slate-100" />
				<div className="h-12 animate-pulse rounded-full bg-slate-200" />
			</div>
		</div>
	);
}

export default function DiscoveryPage() {
	const [filters, setFilters] = useState<OpportunityFilters>(emptyFilters);
	const [page, setPage] = useState(1);
	const [opportunities, setOpportunities] = useState<OpportunityRecord[]>([]);
	const [pagination, setPagination] = useState({
		page: 1,
		limit: PAGE_SIZE,
		total: 0,
		totalPages: 0,
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	function updateFilter(field: keyof OpportunityFilters, value: string) {
		setPage(1);
		setFilters((prev) => ({ ...prev, [field]: value }));
	}

	useEffect(() => {
		let active = true;

		async function loadOpportunities() {
			setLoading(true);
			setError(null);

			const response = await getOpportunitiesPaginated(page, PAGE_SIZE, {
				search: filters.search.trim() || undefined,
				location: filters.location.trim() || undefined,
				category: filters.category.trim() || undefined,
				role_type: filters.roleType.trim() || undefined,
			});

			if (!active) return;

			if (response.success && response.data) {
				setOpportunities(response.data);
				setPagination({
					page: response.pagination?.page ?? page,
					limit: response.pagination?.limit ?? PAGE_SIZE,
					total: response.pagination?.total ?? response.data.length,
					totalPages: response.pagination?.totalPages ?? 1,
				});
			} else {
				setOpportunities([]);
				setPagination({
					page: 1,
					limit: PAGE_SIZE,
					total: 0,
					totalPages: 0,
				});
				setError(response.error ?? "Unable to load opportunities.");
			}

			setLoading(false);
		}

		void loadOpportunities();

		return () => {
			active = false;
		};
	}, [
		filters.category,
		filters.location,
		filters.roleType,
		filters.search,
		page,
	]);

	const hasFilters = Boolean(
		filters.search || filters.location || filters.category || filters.roleType,
	);

	return (
		<div className="bg-[#f6f4ef] text-slate-950 antialiased">
			<TopNav showSearch />

			<main className="mx-auto flex max-w-screen-2xl flex-col gap-12 px-6 pb-20 pt-24 md:px-12">
				<header className="grid gap-8 lg:grid-cols-12 lg:items-end">
					<div className="lg:col-span-8">
						<span className="mb-4 block text-xs font-bold uppercase tracking-[0.3em] text-[#FF5A30]">
							TourStack - Opportunity Discovery
						</span>
						<h1 className="max-w-4xl text-5xl font-black tracking-tight text-slate-950 md:text-6xl font-(family-name:--font-manrope)">
							Find live opportunities and move straight into the EOI flow.
						</h1>
						<p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
							Browse package-backed opportunities from the live API, narrow the
							list by search, location, category, or role type, and launch the
							application with one click.
						</p>
					</div>

					<div className="lg:col-span-4">
						<div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
							<div className="flex items-center gap-3 text-slate-950">
								<div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF5A30]/10 text-[#FF5A30]">
									<span
										className="material-symbols-outlined"
										style={{ fontVariationSettings: "'FILL' 1" }}
									>
										flash_on
									</span>
								</div>
								<div>
									<p className="text-sm font-bold uppercase tracking-[0.24em] text-slate-500">
										Live feed
									</p>
									<p className="text-lg font-extrabold">
										{pagination.total} opportunities
									</p>
								</div>
							</div>
							<p className="mt-4 text-sm leading-6 text-slate-600">
								This screen is now reading directly from
								getOpportunitiesPaginated.
							</p>
						</div>
					</div>
				</header>

				<section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
					<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
						<div>
							<label
								className="mb-2 block text-xs font-bold uppercase tracking-[0.24em] text-slate-500"
								htmlFor="search-opportunities"
							>
								Search
							</label>
							<input
								id="search-opportunities"
								type="search"
								placeholder="Artist, company, brief, or keyword"
								value={filters.search}
								onChange={(event) => updateFilter("search", event.target.value)}
								className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#FF5A30] focus:ring-2 focus:ring-[#FF5A30]/20"
							/>
						</div>
						<div>
							<label
								className="mb-2 block text-xs font-bold uppercase tracking-[0.24em] text-slate-500"
								htmlFor="location-filter"
							>
								Location
							</label>
							<input
								id="location-filter"
								type="text"
								placeholder="Lagos, Nairobi, Accra..."
								value={filters.location}
								onChange={(event) =>
									updateFilter("location", event.target.value)
								}
								className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#FF5A30] focus:ring-2 focus:ring-[#FF5A30]/20"
							/>
						</div>
						<div>
							<label
								className="mb-2 block text-xs font-bold uppercase tracking-[0.24em] text-slate-500"
								htmlFor="category-filter"
							>
								Category
							</label>
							<input
								id="category-filter"
								type="text"
								placeholder="Festival, tour, booking..."
								value={filters.category}
								onChange={(event) =>
									updateFilter("category", event.target.value)
								}
								className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#FF5A30] focus:ring-2 focus:ring-[#FF5A30]/20"
							/>
						</div>
						<div>
							<label
								className="mb-2 block text-xs font-bold uppercase tracking-[0.24em] text-slate-500"
								htmlFor="role-type-filter"
							>
								Role type
							</label>
							<input
								id="role-type-filter"
								type="text"
								placeholder="Producer, promoter, lead..."
								value={filters.roleType}
								onChange={(event) =>
									updateFilter("roleType", event.target.value)
								}
								className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#FF5A30] focus:ring-2 focus:ring-[#FF5A30]/20"
							/>
						</div>
					</div>

					<div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-sm text-slate-500">
						<p>
							{loading
								? "Loading live opportunities..."
								: `${opportunities.length} results on this page`}
						</p>
						<button
							type="button"
							onClick={() => {
								setFilters(emptyFilters);
								setPage(1);
							}}
							disabled={!hasFilters}
							className="rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
						>
							Reset filters
						</button>
					</div>
				</section>

				{error && (
					<div className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-4 text-sm font-medium text-rose-700">
						{error}
					</div>
				)}

				<section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
					{loading
						? ["a", "b", "c", "d", "e", "f"].map((key) => (
								<LoadingCard key={key} />
							))
						: opportunities.map((opportunity) => (
								<OpportunityCard
									key={opportunity.id}
									opportunity={opportunity}
								/>
							))}
				</section>

				{!loading && opportunities.length === 0 && !error && (
					<div className="rounded-3xl border border-dashed border-slate-300 bg-white px-8 py-12 text-center shadow-sm">
						<p className="text-xl font-extrabold text-slate-950">
							No opportunities match these filters.
						</p>
						<p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
							Clear the filters or widen the search terms to surface more live
							opportunities from the package.
						</p>
					</div>
				)}

				{!loading && pagination.totalPages > 1 && (
					<div className="flex flex-wrap items-center justify-center gap-3">
						<button
							type="button"
							onClick={() => setPage((current) => Math.max(1, current - 1))}
							disabled={page === 1}
							className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
						>
							Previous
						</button>
						<span className="rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white">
							Page {pagination.page} of {pagination.totalPages}
						</span>
						<button
							type="button"
							onClick={() =>
								setPage((current) =>
									Math.min(pagination.totalPages, current + 1),
								)
							}
							disabled={page >= pagination.totalPages}
							className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
						>
							Next
						</button>
					</div>
				)}
			</main>
		</div>
	);
}
/*

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getOpportunitiesPaginated } from "@/app/actions";
import TopNav from "@/components/TopNav";

type OpportunityRecord = NonNullable<Awaited<ReturnType<typeof getOpportunitiesPaginated>>["data"]>[number];

type OpportunityFilters = {
  search: string;
  location: string;
  category: string;
  roleType: string;
};

const PAGE_SIZE = 12;

const emptyFilters: OpportunityFilters = {
  search: "",
  location: "",
  category: "",
  roleType: "",
};

function formatDate(value: string | Date | null | undefined) {
  if (!value) return "Recently posted";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently posted";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatSalary(value: string | null | undefined) {
  if (!value?.trim()) return "Budget on request";
  return value;
}

function getApplicationHref(opportunity: OpportunityRecord) {
  return `/eoi?opportunity=${encodeURIComponent(opportunity.id)}`;
}

function hasSupportedImageSource(value: string | null | undefined) {
  return value?.startsWith("https://lh3.googleusercontent.com") ?? false;
}

function OpportunityVisual({ opportunity }: { opportunity: OpportunityRecord }) {
  const image = opportunity.image ?? undefined;
  const titleInitial = opportunity.title.charAt(0).toUpperCase();

  if (hasSupportedImageSource(image)) {
    return (
      <Image
        src={image}
        alt={opportunity.title}
        fill
        className="object-cover transition duration-500 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, 33vw"
      />
    );
  }

  return (
    <div className="flex h-full min-h-56 flex-col justify-between bg-gradient-to-br from-[#FF5A30] via-[#FF7E55] to-slate-900 p-6 text-white">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-white/70">
        <span className="h-2 w-2 rounded-full bg-white/70" />
        {opportunity.category ?? "Live opportunity"}
      </div>
      <div>
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-2xl font-black backdrop-blur-sm">
          {titleInitial}
        </div>
        <p className="text-lg font-extrabold leading-tight">{opportunity.title}</p>
        <p className="mt-1 text-sm text-white/80">{opportunity.company}</p>
      </div>
    </div>
  );
}

function OpportunityCard({ opportunity }: { opportunity: OpportunityRecord }) {
  const href = getApplicationHref(opportunity);

  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative min-h-56 overflow-hidden bg-slate-100">
        <OpportunityVisual opportunity={opportunity} />
      </div>

      <div className="space-y-4 p-6">
        <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
            {opportunity.category ?? "General"}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
            {opportunity.role_type ?? "Open role"}
          </span>
        </div>

        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-950">
            {opportunity.title}
          </h2>
          <p className="mt-1 text-sm font-medium text-slate-500">{opportunity.company}</p>
        </div>

        <div className="grid grid-cols-1 gap-3 text-sm text-slate-600 sm:grid-cols-2">
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
              Location
            </span>
            <span className="mt-1 block font-semibold text-slate-900">
              {opportunity.location}
            </span>
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
              Salary
            </span>
            <span className="mt-1 block font-semibold text-slate-900">
              {formatSalary(opportunity.salary)}
            </span>
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
              Posted
            </span>
            <span className="mt-1 block font-semibold text-slate-900">
              {formatDate(opportunity.date_posted)}
            </span>
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
              Applications
            </span>
            <span className="mt-1 block font-semibold text-slate-900">
              {opportunity.applied_users.length}
            </span>
          </div>
        </div>

        <p className="text-sm leading-6 text-slate-600">{opportunity.about}</p>

        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href={href}
            className="inline-flex items-center justify-center rounded-full bg-[#FF5A30] px-5 py-3 text-sm font-bold text-white transition hover:opacity-90"
          >
            Apply now
          </Link>
          <Link
            href={href}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Open EOI
          </Link>
        </div>
      </div>
    </article>
  );
}

function LoadingCard() {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="h-56 animate-pulse bg-slate-200" />
      <div className="space-y-4 p-6">
        <div className="h-5 w-32 animate-pulse rounded-full bg-slate-200" />
        <div className="h-7 w-3/4 animate-pulse rounded-full bg-slate-200" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-14 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-14 animate-pulse rounded-2xl bg-slate-100" />
        </div>
        <div className="h-16 animate-pulse rounded-2xl bg-slate-100" />
        <div className="h-12 animate-pulse rounded-full bg-slate-200" />
      </div>
    </div>
  );
}

export default function DiscoveryPage() {
  const [filters, setFilters] = useState<OpportunityFilters>(emptyFilters);
  const [page, setPage] = useState(1);
  const [opportunities, setOpportunities] = useState<OpportunityRecord[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function updateFilter(field: keyof OpportunityFilters, value: string) {
    setPage(1);
    setFilters((prev) => ({ ...prev, [field]: value }));
  }

  useEffect(() => {
    let active = true;

    async function loadOpportunities() {
      setLoading(true);
      setError(null);

      const response = await getOpportunitiesPaginated(page, PAGE_SIZE, {
        search: filters.search.trim() || undefined,
        location: filters.location.trim() || undefined,
        category: filters.category.trim() || undefined,
        role_type: filters.roleType.trim() || undefined,
      });

      if (!active) return;

      if (response.success && response.data) {
        setOpportunities(response.data);
        setPagination({
          page: response.pagination?.page ?? page,
          limit: response.pagination?.limit ?? PAGE_SIZE,
          total: response.pagination?.total ?? response.data.length,
          totalPages: response.pagination?.totalPages ?? 1,
        });
      } else {
        setOpportunities([]);
        setPagination({
          page: 1,
          limit: PAGE_SIZE,
          total: 0,
          totalPages: 0,
        });
        setError(response.error ?? "Unable to load opportunities.");
      }

      setLoading(false);
    }

    void loadOpportunities();

    return () => {
      active = false;
    };
  }, [filters.category, filters.location, filters.roleType, filters.search, page]);

  const hasFilters = Boolean(
    filters.search || filters.location || filters.category || filters.roleType,
  );

  return (
    <div className="bg-[#f6f4ef] text-slate-950 antialiased">
      <TopNav showSearch />

      <main className="mx-auto flex max-w-screen-2xl flex-col gap-12 px-6 pb-20 pt-24 md:px-12">
        <header className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <span className="mb-4 block text-xs font-bold uppercase tracking-[0.3em] text-[#FF5A30]">
              TourStack - Opportunity Discovery
            </span>
            <h1 className="max-w-4xl text-5xl font-black tracking-tight text-slate-950 md:text-6xl font-(family-name:--font-manrope)">
              Find live opportunities and move straight into the EOI flow.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
              Browse package-backed opportunities from the live API, narrow the list by
              search, location, category, or role type, and launch the application with
              one click.
            </p>
          </div>

          <div className="lg:col-span-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 text-slate-950">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF5A30]/10 text-[#FF5A30]">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    flash_on
                  </span>
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.24em] text-slate-500">
                    Live feed
                  </p>
                  <p className="text-lg font-extrabold">{pagination.total} opportunities</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                This screen is now reading directly from getOpportunitiesPaginated.
              </p>
            </div>
          </div>
        </header>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <label
                className="mb-2 block text-xs font-bold uppercase tracking-[0.24em] text-slate-500"
                htmlFor="search-opportunities"
              >
                Search
              </label>
              <input
                id="search-opportunities"
                type="search"
                placeholder="Artist, company, brief, or keyword"
                value={filters.search}
                onChange={(event) => updateFilter("search", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#FF5A30] focus:ring-2 focus:ring-[#FF5A30]/20"
              />
            </div>
            <div>
              <label
                className="mb-2 block text-xs font-bold uppercase tracking-[0.24em] text-slate-500"
                htmlFor="location-filter"
              >
                Location
              </label>
              <input
                id="location-filter"
                type="text"
                placeholder="Lagos, Nairobi, Accra..."
                value={filters.location}
                onChange={(event) => updateFilter("location", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#FF5A30] focus:ring-2 focus:ring-[#FF5A30]/20"
              />
            </div>
            <div>
              <label
                className="mb-2 block text-xs font-bold uppercase tracking-[0.24em] text-slate-500"
                htmlFor="category-filter"
              >
                Category
              </label>
              <input
                id="category-filter"
                type="text"
                placeholder="Festival, tour, booking..."
                value={filters.category}
                onChange={(event) => updateFilter("category", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#FF5A30] focus:ring-2 focus:ring-[#FF5A30]/20"
              />
            </div>
            <div>
              <label
                className="mb-2 block text-xs font-bold uppercase tracking-[0.24em] text-slate-500"
                htmlFor="role-type-filter"
              >
                Role type
              </label>
              <input
                id="role-type-filter"
                type="text"
                placeholder="Producer, promoter, lead..."
                value={filters.roleType}
                onChange={(event) => updateFilter("roleType", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#FF5A30] focus:ring-2 focus:ring-[#FF5A30]/20"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-sm text-slate-500">
            <p>
              {loading
                ? "Loading live opportunities..."
                : `${opportunities.length} results on this page`}
            </p>
            <button
              type="button"
              onClick={() => {
                setFilters(emptyFilters);
                setPage(1);
              }}
              disabled={!hasFilters}
              className="rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Reset filters
            </button>
          </div>
        </section>

        {error && (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-4 text-sm font-medium text-rose-700">
            {error}
          </div>
        )}

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {loading
            ? ["a", "b", "c", "d", "e", "f"].map((key) => <LoadingCard key={key} />)
            : opportunities.map((opportunity) => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} />
              ))}
        </section>

        {!loading && opportunities.length === 0 && !error && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-8 py-12 text-center shadow-sm">
            <p className="text-xl font-extrabold text-slate-950">
              No opportunities match these filters.
            </p>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
              Clear the filters or widen the search terms to surface more live opportunities from the package.
            </p>
          </div>
        )}

        {!loading && pagination.totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <span className="rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(pagination.totalPages, current + 1))}
              disabled={page >= pagination.totalPages}
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
}"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getOpportunitiesPaginated } from "@/app/actions";
import TopNav from "@/components/TopNav";

type OpportunityRecord = NonNullable<
  Awaited<ReturnType<typeof getOpportunitiesPaginated>>["data"]
>[number];

type OpportunityFilters = {
  search: string;
  location: string;
  category: string;
  roleType: string;
};

const PAGE_SIZE = 12;

const emptyFilters: OpportunityFilters = {
  search: "",
  location: "",
  category: "",
  roleType: "",
};

function formatDate(value: string | Date | null | undefined) {
  if (!value) return "Recently posted";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently posted";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatSalary(value: string | null | undefined) {
  if (!value || !value.trim()) return "Budget on request";
  return value;
}

function getApplicationHref(opportunity: OpportunityRecord) {
  return `/eoi?opportunity=${encodeURIComponent(opportunity.id)}`;
}

function hasSupportedImageSource(value: string | null | undefined) {
  return Boolean(value && value.startsWith("https://lh3.googleusercontent.com"));
}

function OpportunityVisual({ opportunity }: { opportunity: OpportunityRecord }) {
  const image = opportunity.image ?? null;
  const titleInitial = opportunity.title.charAt(0).toUpperCase();

  if (hasSupportedImageSource(image)) {
    return (
      <Image
        src={image}
        alt={opportunity.title}
        fill
        className="object-cover transition duration-500 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, 33vw"
      />
    );
  }

  return (
    <div className="flex h-full min-h-56 flex-col justify-between bg-gradient-to-br from-[#FF5A30] via-[#FF7E55] to-slate-900 p-6 text-white">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-white/70">
        <span className="h-2 w-2 rounded-full bg-white/70" />
        {opportunity.category ?? "Live opportunity"}
      </div>
      <div>
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-2xl font-black backdrop-blur-sm">
          {titleInitial}
        </div>
        <p className="text-lg font-extrabold leading-tight">{opportunity.title}</p>
        <p className="mt-1 text-sm text-white/80">{opportunity.company}</p>
      </div>
    </div>
  );
}

function OpportunityCard({ opportunity }: { opportunity: OpportunityRecord }) {
  const href = getApplicationHref(opportunity);

  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative min-h-56 overflow-hidden bg-slate-100">
        <OpportunityVisual opportunity={opportunity} />
      </div>

      <div className="space-y-4 p-6">
        <div className="flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-500">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
            {opportunity.category ?? "General"}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
            {opportunity.role_type ?? "Open role"}
          </span>
        </div>

        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-950">
            {opportunity.title}
          </h2>
          <p className="mt-1 text-sm font-medium text-slate-500">{opportunity.company}</p>
        </div>

        <div className="grid grid-cols-1 gap-3 text-sm text-slate-600 sm:grid-cols-2">
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
              Location
            </span>
            <span className="mt-1 block font-semibold text-slate-900">
              {opportunity.location}
            </span>
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
              Salary
            </span>
            <span className="mt-1 block font-semibold text-slate-900">
              {formatSalary(opportunity.salary)}
            </span>
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
              Posted
            </span>
            <span className="mt-1 block font-semibold text-slate-900">
              {formatDate(opportunity.date_posted)}
            </span>
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
              Applications
            </span>
            <span className="mt-1 block font-semibold text-slate-900">
              {opportunity.applied_users.length}
            </span>
          </div>
        </div>

        <p className="text-sm leading-6 text-slate-600">{opportunity.about}</p>

        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href={href}
            className="inline-flex items-center justify-center rounded-full bg-[#FF5A30] px-5 py-3 text-sm font-bold text-white transition hover:opacity-90"
          >
            Apply now
          </Link>
          <Link
            href={href}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Open EOI
          </Link>
        </div>
      </div>
    </article>
  );
}

function LoadingCard() {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="h-56 animate-pulse bg-slate-200" />
      <div className="space-y-4 p-6">
        <div className="h-5 w-32 animate-pulse rounded-full bg-slate-200" />
        <div className="h-7 w-3/4 animate-pulse rounded-full bg-slate-200" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-14 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-14 animate-pulse rounded-2xl bg-slate-100" />
        </div>
        <div className="h-16 animate-pulse rounded-2xl bg-slate-100" />
        <div className="h-12 animate-pulse rounded-full bg-slate-200" />
      </div>
    </div>
  );
}

export default function DiscoveryPage() {
  const [filters, setFilters] = useState<OpportunityFilters>(emptyFilters);
  const [page, setPage] = useState(1);
  const [opportunities, setOpportunities] = useState<OpportunityRecord[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function updateFilter(field: keyof OpportunityFilters, value: string) {
    setPage(1);
    setFilters((prev) => ({ ...prev, [field]: value }));
  }

  useEffect(() => {
    let active = true;

    async function loadOpportunities() {
      setLoading(true);
      setError(null);

      const response = await getOpportunitiesPaginated(page, PAGE_SIZE, {
        search: filters.search.trim() || undefined,
        location: filters.location.trim() || undefined,
        category: filters.category.trim() || undefined,
        role_type: filters.roleType.trim() || undefined,
      });

      if (!active) return;

      if (response.success && response.data) {
        setOpportunities(response.data);
        setPagination({
          page: response.pagination?.page ?? page,
          limit: response.pagination?.limit ?? PAGE_SIZE,
          total: response.pagination?.total ?? response.data.length,
          totalPages: response.pagination?.totalPages ?? 1,
        });
      } else {
        setOpportunities([]);
        setPagination({
          page: 1,
          limit: PAGE_SIZE,
          total: 0,
          totalPages: 0,
        });
        setError(response.error ?? "Unable to load opportunities.");
      }

      setLoading(false);
    }

    void loadOpportunities();

    return () => {
      active = false;
    };
  }, [filters.category, filters.location, filters.roleType, filters.search, page]);

  const hasFilters = Boolean(
    filters.search || filters.location || filters.category || filters.roleType,
  );

  return (
    <div className="bg-[#f6f4ef] text-slate-950 antialiased">
      <TopNav showSearch />

      <main className="mx-auto flex max-w-screen-2xl flex-col gap-12 px-6 pb-20 pt-24 md:px-12">
        <header className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <span className="mb-4 block text-xs font-bold uppercase tracking-[0.3em] text-[#FF5A30]">
              TourStack - Opportunity Discovery
            </span>
            <h1 className="max-w-4xl text-5xl font-black tracking-tight text-slate-950 md:text-6xl font-(family-name:--font-manrope)">
              Find live opportunities and move straight into the EOI flow.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
              Browse package-backed opportunities from the live API, narrow the list by
              search, location, category, or role type, and launch the application with
              one click.
            </p>
          </div>

          <div className="lg:col-span-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 text-slate-950">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FF5A30]/10 text-[#FF5A30]">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    flash_on
                  </span>
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.24em] text-slate-500">
                    Live feed
                  </p>
                  <p className="text-lg font-extrabold">{pagination.total} opportunities</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                This screen is now reading directly from getOpportunitiesPaginated.
              </p>
            </div>
          </div>
        </header>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div>
              <label
                className="mb-2 block text-xs font-bold uppercase tracking-[0.24em] text-slate-500"
                htmlFor="search-opportunities"
              >
                Search
              </label>
              <input
                id="search-opportunities"
                type="search"
                placeholder="Artist, company, brief, or keyword"
                value={filters.search}
                onChange={(event) => updateFilter("search", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#FF5A30] focus:ring-2 focus:ring-[#FF5A30]/20"
              />
            </div>
            <div>
              <label
                className="mb-2 block text-xs font-bold uppercase tracking-[0.24em] text-slate-500"
                htmlFor="location-filter"
              >
                Location
              </label>
              <input
                id="location-filter"
                type="text"
                placeholder="Lagos, Nairobi, Accra..."
                value={filters.location}
                onChange={(event) => updateFilter("location", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#FF5A30] focus:ring-2 focus:ring-[#FF5A30]/20"
              />
            </div>
            <div>
              <label
                className="mb-2 block text-xs font-bold uppercase tracking-[0.24em] text-slate-500"
                htmlFor="category-filter"
              >
                Category
              </label>
              <input
                id="category-filter"
                type="text"
                placeholder="Festival, tour, booking..."
                value={filters.category}
                onChange={(event) => updateFilter("category", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#FF5A30] focus:ring-2 focus:ring-[#FF5A30]/20"
              />
            </div>
            <div>
              <label
                className="mb-2 block text-xs font-bold uppercase tracking-[0.24em] text-slate-500"
                htmlFor="role-type-filter"
              >
                Role type
              </label>
              <input
                id="role-type-filter"
                type="text"
                placeholder="Producer, promoter, lead..."
                value={filters.roleType}
                onChange={(event) => updateFilter("roleType", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#FF5A30] focus:ring-2 focus:ring-[#FF5A30]/20"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-sm text-slate-500">
            <p>
              {loading
                ? "Loading live opportunities..."
                : `${opportunities.length} results on this page`}
            </p>
            <button
              type="button"
              onClick={() => {
                setFilters(emptyFilters);
                setPage(1);
              }}
              disabled={!hasFilters}
              className="rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Reset filters
            </button>
          </div>
        </section>

        {error && (
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-6 py-4 text-sm font-medium text-rose-700">
            {error}
          </div>
        )}

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => <LoadingCard key={index} />)
            : opportunities.map((opportunity) => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} />
              ))}
        </section>

        {!loading && opportunities.length === 0 && !error && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-8 py-12 text-center shadow-sm">
            <p className="text-xl font-extrabold text-slate-950">
              No opportunities match these filters.
            </p>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
              Clear the filters or widen the search terms to surface more live
              opportunities from the package.
            </p>
          </div>
        )}

        {!loading && pagination.totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <span className="rounded-full bg-slate-900 px-5 py-3 text-sm font-bold text-white">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((current) => Math.min(pagination.totalPages, current + 1))}
              disabled={page >= pagination.totalPages}
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

        {/* Filters * /}
				<section className="bg-surface-container-low rounded-2xl p-4 md:p-6 flex flex-wrap items-end gap-4">
					<div className="flex-1 min-w-45">
						<label
							htmlFor="filter-genre"
							className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1"
						>
							Genre
						</label>
						<div className="relative">
							<select
								id="filter-genre"
								value={genre}
								onChange={(e) => setGenre(e.target.value)}
								className="w-full bg-surface-container-lowest border-none rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-[#FF5A30]/20 appearance-none outline-none"
							>
								<option>All Genres</option>
								<option>Afrobeats</option>
								<option>Electronic</option>
								<option>Indie Rock</option>
								<option>Jazz &amp; Soul</option>
								<option>World / Folk</option>
								<option>Modern Classical</option>
							</select>
							<span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
								expand_more
							</span>
						</div>
					</div>

					<div className="flex-1 min-w-45">
						<label
							htmlFor="filter-window"
							className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1"
						>
							Available Window
						</label>
						<div className="relative">
							<select
								id="filter-window"
								value={window}
								onChange={(e) => setWindow(e.target.value)}
								className="w-full bg-surface-container-lowest border-none rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-[#FF5A30]/20 appearance-none outline-none"
							>
								<option>All Windows</option>
								<option>Q3 2024 (Jul–Sep)</option>
								<option>Q4 2024 (Oct–Dec)</option>
								<option>Q1 2025 (Jan–Mar)</option>
								<option>Q2 2025 (Apr–Jun)</option>
							</select>
							<span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
								calendar_today
							</span>
						</div>
					</div>

					<div className="flex-1 min-w-45">
						<label
							htmlFor="filter-fee"
							className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1"
						>
							Fee Range (USD)
						</label>
						<div className="relative">
							<select
								id="filter-fee"
								value={feeRange}
								onChange={(e) => setFeeRange(e.target.value)}
								className="w-full bg-surface-container-lowest border-none rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-[#FF5A30]/20 appearance-none outline-none"
							>
								<option>All Ranges</option>
								<option>$5k – $15k</option>
								<option>$15k – $50k</option>
								<option>$50k – $150k</option>
								<option>$150k+</option>
							</select>
							<span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
								payments
							</span>
						</div>
					</div>

					<div className="flex-1 min-w-45">
						<label
							htmlFor="filter-region"
							className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1"
						>
							Region
						</label>
						<div className="relative">
							<select
								id="filter-region"
								value={region}
								onChange={(e) => setRegion(e.target.value)}
								className="w-full bg-surface-container-lowest border-none rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-[#FF5A30]/20 appearance-none outline-none"
							>
								<option>All Africa</option>
								<option>West Africa</option>
								<option>East Africa</option>
								<option>Southern Africa</option>
								<option>North Africa</option>
							</select>
							<span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
								public
							</span>
						</div>
					</div>

					<button
						type="button"
						onClick={() => {
							setGenre("All Genres");
							setWindow("All Windows");
							setFeeRange("All Ranges");
							setRegion("All Africa");
						}}
						className="bg-[#FF5A30] text-white px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-[#FF5A30]/20 self-end"
					>
						<span className="material-symbols-outlined text-sm">tune</span>
						Reset Filters
					</button>
				</section>

				<div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Gallery Grid * /}
					<div className="lg:col-span-9">
						<div className="flex items-center justify-between mb-8">
							<h2 className="font-(family-name:--font-manrope) text-2xl font-bold">
								Active Tour Projects{" "}
								<span className="text-on-surface-variant font-normal text-lg">
									({filtered.length})
								</span>
							</h2>
							<div className="flex items-center gap-2 text-on-surface-variant text-sm font-medium">
								<span>Sort by:</span>
								<button
									type="button"
									className="text-[#FF5A30] font-bold flex items-center gap-1"
								>
									Newest First{" "}
									<span className="material-symbols-outlined text-xs">
										arrow_drop_down
									</span>
								</button>
							</div>
						</div>

						{filtered.length === 0 ? (
							<div className="flex flex-col items-center justify-center py-24 text-on-surface-variant">
								<span className="material-symbols-outlined text-5xl mb-4">
									search_off
								</span>
								<p className="font-bold text-lg">
									No results match your filters
								</p>
								<p className="text-sm mt-1">
									Try adjusting or resetting the filters above.
								</p>
							</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
								{filtered.map((artist) => (
									<div
										key={artist.name}
										className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-transparent hover:border-outline-variant/20"
									>
										<div className="h-56 relative overflow-hidden">
											<Image
												src={artist.img}
												alt={artist.imgAlt}
												fill
												className="object-cover group-hover:scale-110 transition-transform duration-700"
											/>
											<div className="absolute top-4 left-4">
												<span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-[#FF5A30] uppercase tracking-tighter shadow-sm">
													{artist.genre}
												</span>
											</div>
											{artist.trending && (
												<div className="absolute top-4 right-4">
													<span className="bg-tertiary-fixed text-on-tertiary-fixed px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
														Trending
													</span>
												</div>
											)}
                      {/* Tour name overlay * /}
											<div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/60 to-transparent p-4">
												<span className="text-white text-xs font-bold uppercase tracking-wider opacity-90">
													{artist.tour}
												</span>
											</div>
										</div>

										<div className="p-5">
											<h3 className="font-(family-name:--font-manrope) text-xl font-extrabold group-hover:text-[#FF5A30] transition-colors">
												{artist.name}
											</h3>
											<div className="mt-3 space-y-2">
												<div className="flex items-center gap-2 text-on-surface-variant">
													<span className="material-symbols-outlined text-base">
														event
													</span>
													<span className="text-sm font-medium">
														{artist.dates}
													</span>
												</div>
												<div className="flex items-center gap-2 text-on-surface-variant">
													<span className="material-symbols-outlined text-base">
														monetization_on
													</span>
													<span className="text-sm font-medium">
														{artist.fee}
													</span>
												</div>
												<div className="flex items-center gap-2 text-on-surface-variant">
													<span className="material-symbols-outlined text-base">
														location_on
													</span>
													<span className="text-sm font-medium">
														{artist.markets}
													</span>
												</div>
											</div>
											<div className="mt-5">
												<Link
													href={artist.href}
													className="block w-full bg-[#FF5A30] py-3 rounded-xl text-white font-bold text-sm tracking-wide shadow-md shadow-[#FF5A30]/10 active:scale-[0.98] transition-all text-center"
												>
													Submit Expression of Interest
												</Link>
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</div>

          {/* Sidebar * /}
					<aside className="lg:col-span-3 space-y-8">
            {/* How it Works * /}
						<div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
							<h3 className="font-(family-name:--font-manrope) text-xl font-bold mb-6">
								How It Works
							</h3>
							<div className="space-y-7">
								{[
									{
										step: "01",
										title: "Browse Tour Projects",
										desc: "Ckrowd announces artistes and tours. Browse and filter by genre, date, fee, or region.",
									},
									{
										step: "02",
										title: "Submit Your EOI",
										desc: "Submit a formal Expression of Interest with your venue, date, budget, and funding plan.",
									},
									{
										step: "03",
										title: "Matching & Review",
										desc: "Ckrowd scores your EOI against artiste requirements and reviews your application.",
									},
									{
										step: "04",
										title: "Decision & Execution",
										desc: "You receive Approved, Rejected, or Needs Revision — then proceed to planning.",
									},
								].map((item) => (
									<div key={item.step} className="flex gap-4">
										<div className="shrink-0 w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-[#FF5A30] font-black text-xs">
											{item.step}
										</div>
										<div>
											<p className="font-bold text-sm text-on-surface">
												{item.title}
											</p>
											<p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
												{item.desc}
											</p>
										</div>
									</div>
								))}
							</div>
							<div className="mt-8 pt-6 border-t border-slate-100">
								<Link
									href="/eoi"
									className="w-full text-[#FF5A30] font-bold text-sm flex items-center justify-center gap-2 py-2 hover:bg-primary-fixed/30 rounded-lg transition-colors"
								>
									Start Your EOI{" "}
									<span className="material-symbols-outlined text-sm">
										arrow_forward
									</span>
								</Link>
							</div>
						</div>

            {/* Financing Banner * /}
						<div className="bg-linear-to-br from-[#FF5A30] to-[#cc4826] rounded-2xl p-8 text-white relative overflow-hidden group">
							<div className="relative z-10">
								<h4 className="font-(family-name:--font-manrope) text-xl font-bold leading-tight">
									Financing Support Available
								</h4>
								<p className="text-white/90 text-sm mt-3 leading-relaxed">
									Get up to 40% of the artiste fee covered upfront through
									TourStack&apos;s capital partners.
								</p>
								<Link
									href="/eoi"
									className="mt-6 inline-block bg-white text-[#FF5A30] px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:scale-105 transition-transform"
								>
									Apply with EOI
								</Link>
							</div>
							<span className="material-symbols-outlined absolute -bottom-4 -right-4 text-white/10 text-[120px] rotate-12 group-hover:scale-110 transition-transform duration-500">
								account_balance_wallet
							</span>
						</div>

            {/* Platform Stats * /}
						<div className="bg-surface-container-high rounded-2xl p-8">
							<h3 className="font-(family-name:--font-manrope) font-bold text-sm uppercase tracking-widest text-on-surface-variant mb-6">
								Platform Stats
							</h3>
							<div className="grid grid-cols-2 gap-4">
								{[
									{ value: "24", label: "Markets" },
									{ value: "500+", label: "Promoters" },
									{ value: `${filtered.length}`, label: "Active Tours" },
									{ value: "48h", label: "Avg Review" },
								].map((stat) => (
									<div
										key={stat.label}
										className="bg-surface-container-lowest p-4 rounded-xl text-center border border-[#FF5A30]/5"
									>
										<p className="text-2xl font-black font-(family-name:--font-manrope) text-[#FF5A30]">
											{stat.value}
										</p>
										<p className="text-[10px] uppercase font-bold text-on-surface-variant mt-1">
											{stat.label}
										</p>
									</div>
								))}
							</div>
						</div>
					</aside>
				</div>
			</main>
		</div>
	);
}
*/
