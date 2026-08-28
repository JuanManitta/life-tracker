// Vercel Edge Function — proxies Comic Vine search so the API key never
// reaches the browser bundle, and the response is served same-origin
// (avoids Comic Vine's lack of CORS headers entirely).
export const config = { runtime: 'edge' }

const COMIC_VINE_BASE = 'https://comicvine.gamespot.com/api'

export default async function handler(req: Request): Promise<Response> {
  const apiKey = process.env.COMIC_VINE_API_KEY
  if (!apiKey) {
    return json({ error: 'Comic Vine API key not configured' }, 500)
  }

  const { searchParams } = new URL(req.url)
  const title = searchParams.get('title')?.trim()
  if (!title) {
    return json({ error: 'Missing "title" query param' }, 400)
  }

  const headers = { 'User-Agent': 'life-tracker-app (comic-lookup)' }

  const searchUrl = `${COMIC_VINE_BASE}/search/?api_key=${apiKey}&format=json&query=${encodeURIComponent(title)}&resources=volume&limit=1`
  const searchRes = await fetch(searchUrl, { headers })
  if (!searchRes.ok) return json({ author: null }, 200)
  const searchData = (await searchRes.json()) as {
    results?: Array<{ api_detail_url?: string }>
  }
  const volumeUrl = searchData?.results?.[0]?.api_detail_url
  if (!volumeUrl) return json({ author: null }, 200)

  const detailRes = await fetch(
    `${volumeUrl}?api_key=${apiKey}&format=json&field_list=people`,
    { headers }
  )
  if (!detailRes.ok) return json({ author: null }, 200)
  const detailData = (await detailRes.json()) as {
    results?: { people?: Array<{ name?: string }> }
  }
  const author = detailData?.results?.people?.[0]?.name ?? null

  return json({ author }, 200)
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}
