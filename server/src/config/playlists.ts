/**
 * ORBIT SUBLIMINAL PLAYLIST SOURCES
 * Adding new playlist URLs here allows the ingestion engine to automatically
 * discover, deduplicate, fetch metadata, classify, and ingest all videos.
 */

export const PLAYLIST_SOURCES: string[] = [
  'https://www.youtube.com/playlist?list=PLag5P_z1arBQpBpqXOMGIolROofiuGUY_',
  'https://youtube.com/playlist?list=PL4RaJAgykERlzpfu8SIwLPag0ukM2WE6M&si=zG-EyzqsWdofwfvD',
  'https://youtube.com/playlist?list=PLYmYc1SF3hmLdAU3jQOcS1cJRSjvxNp_p&si=_ySqzX9aqFndFoaD',
  // Note: Playlist 3 and 4 are identical and automatically deduplicated by playlist ID
  'https://youtube.com/playlist?list=PLYmYc1SF3hmLdAU3jQOcS1cJRSjvxNp_p&si=_ySqzX9aqFndFoaD',
  'https://youtube.com/playlist?list=PLsJ7aDVviFGm-c6A-MuNniXt4puu8tlvm&si=K5dvJCTu6SZ5l5Qi',
  'https://youtube.com/playlist?list=PLjyqoAdWeZSNNpWx6tbiOXDGs7iDv6vcB&si=_NaLu_7tMYEhBVh_',
  'https://youtube.com/playlist?list=PL4amqFj_U6mzWOKJOJWXHbXRwqBSAWoo5&si=cZb-GRYmpluync-J',
];

/**
 * Extracts a clean YouTube playlist ID from any YouTube playlist URL.
 */
export function extractPlaylistId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/[?&]list=([^&#]+)/);
  if (match) return match[1];
  // If the user passed just the ID directly
  if (url.startsWith('PL') || url.length >= 18) return url.trim();
  return null;
}

/**
 * Deduplicates an array of playlist URLs or IDs by their unique playlist ID.
 */
export function getUniquePlaylistIds(sources: string[] = PLAYLIST_SOURCES): string[] {
  const ids = new Set<string>();
  for (const src of sources) {
    const id = extractPlaylistId(src);
    if (id) ids.add(id);
  }
  return Array.from(ids);
}
