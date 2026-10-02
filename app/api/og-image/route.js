// app/api/og-image/route.js
import sharp from 'sharp'

export const runtime = 'nodejs'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const src = searchParams.get('src')
  if (!src) return new Response('Missing src', { status: 400 })

  const res = await fetch(src)
  if (!res.ok) return new Response('Fetch failed', { status: 502 })

  const input = Buffer.from(await res.arrayBuffer())

  const output = await sharp(input)
    .resize(1200, 630, { fit: 'cover', position: 'center' })
    .jpeg({ quality: 78, mozjpeg: true })
    .toBuffer()

  return new Response(output, {
    headers: {
      'Content-Type': 'image/jpeg',
      'Content-Length': String(output.length),
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}