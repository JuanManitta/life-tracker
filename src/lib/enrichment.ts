import type { TrackedItem } from '@/types'
import { CATEGORY_CREATOR_FIELD } from '@/types'

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY as string | undefined
const RAWG_API_KEY = import.meta.env.VITE_RAWG_API_KEY as string | undefined
const TMDB_BASE = 'https://api.themoviedb.org/3'
const RAWG_BASE = 'https://api.rawg.io/api'
const OPEN_LIBRARY_BASE = 'https://openlibrary.org'

/**
 * Categories this module knows how to enrich, and which field it fills.
 */
export const ENRICHABLE_CATEGORIES = ['books', 'movies', 'series', 'games', 'comics'] as const

export function isEnrichmentConfigured() {
  return Boolean(TMDB_API_KEY || RAWG_API_KEY)
}

async function fetchBookAuthor(title: string): Promise<string | undefined> {
  const url = `${OPEN_LIBRARY_BASE}/search.json?title=${encodeURIComponent(title)}&limit=1&fields=author_name`
  const res = await fetch(url)
  if (!res.ok) return undefined
  const data = await res.json()
  const authorName = data?.docs?.[0]?.author_name?.[0]
  return typeof authorName === 'string' ? authorName : undefined
}

async function fetchMovieDirector(title: string): Promise<string | undefined> {
  if (!TMDB_API_KEY) return undefined
  const searchRes = await fetch(
    `${TMDB_BASE}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}&language=es`
  )
  if (!searchRes.ok) return undefined
  const searchData = await searchRes.json()
  const movieId = searchData?.results?.[0]?.id
  if (!movieId) return undefined

  const creditsRes = await fetch(
    `${TMDB_BASE}/movie/${movieId}/credits?api_key=${TMDB_API_KEY}`
  )
  if (!creditsRes.ok) return undefined
  const creditsData = await creditsRes.json()
  const director = creditsData?.crew?.find(
    (person: { job?: string; name?: string }) => person.job === 'Director'
  )
  return director?.name
}

async function fetchSeriesCreator(title: string): Promise<string | undefined> {
  if (!TMDB_API_KEY) return undefined
  const searchRes = await fetch(
    `${TMDB_BASE}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}&language=es`
  )
  if (!searchRes.ok) return undefined
  const searchData = await searchRes.json()
  const showId = searchData?.results?.[0]?.id
  if (!showId) return undefined

  const detailsRes = await fetch(
    `${TMDB_BASE}/tv/${showId}?api_key=${TMDB_API_KEY}`
  )
  if (!detailsRes.ok) return undefined
  const detailsData = await detailsRes.json()
  const creator = detailsData?.created_by?.[0]?.name
  return typeof creator === 'string' ? creator : undefined
}

async function fetchGameDeveloper(title: string): Promise<string | undefined> {
  if (!RAWG_API_KEY) return undefined
  const searchRes = await fetch(
    `${RAWG_BASE}/games?key=${RAWG_API_KEY}&search=${encodeURIComponent(title)}&page_size=1`
  )
  if (!searchRes.ok) return undefined
  const searchData = await searchRes.json()
  const slug = searchData?.results?.[0]?.slug
  if (!slug) return undefined

  const detailsRes = await fetch(`${RAWG_BASE}/games/${slug}?key=${RAWG_API_KEY}`)
  if (!detailsRes.ok) return undefined
  const detailsData = await detailsRes.json()
  const developer = detailsData?.developers?.[0]?.name
  return typeof developer === 'string' ? developer : undefined
}

async function fetchComicAuthor(title: string): Promise<string | undefined> {
  try {
    const res = await fetch(`/api/comic-lookup?title=${encodeURIComponent(title)}`)
    if (!res.ok) return undefined
    const data = await res.json()
    return typeof data?.author === 'string' ? data.author : undefined
  } catch {
    return undefined
  }
}

/**
 * Looks up the missing creator-like field (author/director/creator) for a
 * single item. Returns undefined if nothing was found or the category isn't
 * supported, without throwing (network/API errors are swallowed so a sync
 * over many items can't be aborted by a single failed lookup).
 */
export async function fetchCreatorFor(
  item: TrackedItem
): Promise<string | undefined> {
  try {
    switch (item.category) {
      case 'books':
        return await fetchBookAuthor(item.title)
      case 'movies':
        return await fetchMovieDirector(item.title)
      case 'series':
        return await fetchSeriesCreator(item.title)
      case 'games':
        return await fetchGameDeveloper(item.title)
      case 'comics':
        return await fetchComicAuthor(item.title)
      default:
        return undefined
    }
  } catch {
    return undefined
  }
}

export interface SyncResult {
  updated: number
  skipped: number
  notFound: number
}

/**
 * Fills in the missing creator-like field (author/developer/director/creator)
 * for every item that doesn't already have one set, using external metadata
 * APIs. Items that already have a value are left untouched.
 */
export async function syncMissingCreators(
  items: TrackedItem[],
  upsertItem: (item: TrackedItem) => Promise<void>
): Promise<SyncResult> {
  const result: SyncResult = { updated: 0, skipped: 0, notFound: 0 }

  const candidates = items.filter((item) => {
    if (!ENRICHABLE_CATEGORIES.includes(item.category as (typeof ENRICHABLE_CATEGORIES)[number])) {
      return false
    }
    const field = CATEGORY_CREATOR_FIELD[item.category]
    const value = (item as unknown as Record<string, string | undefined>)[field]
    return !value || value.trim() === ''
  })

  for (const item of candidates) {
    const creator = await fetchCreatorFor(item)
    if (!creator) {
      result.notFound += 1
      continue
    }

    const field = CATEGORY_CREATOR_FIELD[item.category]

    await upsertItem({
      ...item,
      [field]: creator,
      updatedAt: Date.now(),
    } as TrackedItem)
    result.updated += 1
  }

  result.skipped = items.length - candidates.length
  return result
}
