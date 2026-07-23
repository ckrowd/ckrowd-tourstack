// Fallback cover art for tour/artist cards that have no image of their own.
// A fixed pool of 10 concert/live-music photos (sourced from Pexels, stored in
// public/) assigned by a stable hash of the record's id — so each card gets a
// varied-but-consistent cover with no reshuffle on refresh.

export const TOUR_COVER_POOL = [
	"/tour-01.jpg",
	"/tour-02.jpg",
	"/tour-03.jpg",
	"/tour-04.jpg",
	"/tour-05.jpg",
	"/tour-06.jpg",
	"/tour-07.jpg",
	"/tour-08.jpg",
	"/tour-09.jpg",
	"/tour-10.jpg",
] as const;

export function tourCoverFor(id: string): string {
	let hash = 0;
	for (let i = 0; i < id.length; i++) {
		hash = (hash * 31 + id.charCodeAt(i)) | 0;
	}
	return TOUR_COVER_POOL[Math.abs(hash) % TOUR_COVER_POOL.length];
}
