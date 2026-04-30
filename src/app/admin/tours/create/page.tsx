"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createAdminTour } from "@/app/actions";

export default function CreateTourPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const body = {
      // These fields should map to your Prisma schema for tours
      // Here using a generic schema assumption based on the previous UI mock
      artist_name: formData.get("artist_name") as string,
      tour_name: formData.get("tour_name") as string,
      fee_min: Number(formData.get("fee_min")),
      fee_max: Number(formData.get("fee_max")),
      date_from: formData.get("date_from") as string,
      date_to: formData.get("date_to") as string,
      genre: formData.get("genre") as string,
      technical_requirements: formData.get("technical_requirements") as string,
    };

    try {
      // Assuming payload shape for `createAdminTour` fits this. 
      // This may need adjusting depending on the actual trpc/eden payload type
      const res = await createAdminTour(body as unknown as Parameters<typeof createAdminTour>[0]);
      
      if (res.success) {
        router.push("/admin/tours");
      } else {
        setError(res.error || "Failed to create tour project");
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="mb-10 flex items-center gap-4">
        <Link
          href="/admin/tours"
          className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors"
        >
          <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
        </Link>
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#FF5A30] block mb-1">
            Tour Management
          </span>
          <h1 className="text-3xl font-black font-(family-name:--font-manrope) tracking-tight text-on-surface">
            New Tour Project
          </h1>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-8">
          <span className="material-symbols-outlined text-[#FF5A30]">
            add_circle
          </span>
          <h3 className="font-(family-name:--font-manrope) font-bold text-lg">
            Project Details
          </h3>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="artist_name"
                className="block text-xs font-bold text-on-surface-variant mb-1.5 uppercase tracking-wider"
              >
                Artiste Name
              </label>
              <input
                id="artist_name"
                name="artist_name"
                type="text"
                required
                placeholder="e.g. Burna Boy"
                className="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-sm text-on-surface focus:ring-2 focus:ring-[#FF5A30] outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="tour_name"
                className="block text-xs font-bold text-on-surface-variant mb-1.5 uppercase tracking-wider"
              >
                Tour Name
              </label>
              <input
                id="tour_name"
                name="tour_name"
                type="text"
                required
                placeholder="e.g. Twice As Tall World Tour"
                className="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-sm text-on-surface focus:ring-2 focus:ring-[#FF5A30] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="fee_min"
                className="block text-xs font-bold text-on-surface-variant mb-1.5 uppercase tracking-wider"
              >
                Min Fee (USD)
              </label>
              <input
                id="fee_min"
                name="fee_min"
                type="number"
                min="0"
                required
                placeholder="50000"
                className="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-sm text-on-surface focus:ring-2 focus:ring-[#FF5A30] outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="fee_max"
                className="block text-xs font-bold text-on-surface-variant mb-1.5 uppercase tracking-wider"
              >
                Max Fee (USD)
              </label>
              <input
                id="fee_max"
                name="fee_max"
                type="number"
                min="0"
                required
                placeholder="150000"
                className="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-sm text-on-surface focus:ring-2 focus:ring-[#FF5A30] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="date_from"
                className="block text-xs font-bold text-on-surface-variant mb-1.5 uppercase tracking-wider"
              >
                Available From
              </label>
              <input
                id="date_from"
                name="date_from"
                type="date"
                required
                className="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-sm text-on-surface focus:ring-2 focus:ring-[#FF5A30] outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="date_to"
                className="block text-xs font-bold text-on-surface-variant mb-1.5 uppercase tracking-wider"
              >
                Available To
              </label>
              <input
                id="date_to"
                name="date_to"
                type="date"
                required
                className="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-sm text-on-surface focus:ring-2 focus:ring-[#FF5A30] outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="genre"
              className="block text-xs font-bold text-on-surface-variant mb-1.5 uppercase tracking-wider"
            >
              Genre
            </label>
            <div className="relative">
              <select
                id="genre"
                name="genre"
                required
                className="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-sm font-medium text-on-surface focus:ring-2 focus:ring-[#FF5A30] outline-none appearance-none"
              >
                <option value="Afrobeats">Afrobeats</option>
                <option value="Afropop">Afropop</option>
                <option value="Electronic">Electronic</option>
                <option value="Jazz & Soul">Jazz & Soul</option>
                <option value="World / Folk">World / Folk</option>
                <option value="Hip-Hop">Hip-Hop</option>
              </select>
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                expand_more
              </span>
            </div>
          </div>

          <div>
            <label
              htmlFor="technical_requirements"
              className="block text-xs font-bold text-on-surface-variant mb-1.5 uppercase tracking-wider"
            >
              Technical Requirements
            </label>
            <textarea
              id="technical_requirements"
              name="technical_requirements"
              rows={4}
              placeholder="Stage size, hospitality, tech rider notes..."
              className="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-sm text-on-surface focus:ring-2 focus:ring-[#FF5A30] outline-none resize-none"
            />
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-[#FF5A30] text-white rounded-xl font-(family-name:--font-manrope) font-bold shadow-lg shadow-[#FF5A30]/20 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Publishing..." : "Publish Tour Project"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
