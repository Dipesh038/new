import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const imdbId = searchParams.get('imdbId');
  const type = searchParams.get('type') || 'movie'; // Default to movie

  if (!imdbId) {
    return NextResponse.json({ error: 'IMDB ID is required' }, { status: 400 });
  }

  const url = `https://vidsrc.xyz/embed/${type}/${imdbId}`;

  try {
    // We use a HEAD request because we only need to check for existence (status code),
    // not download the whole page. This is much faster.
    const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });

    // vidsrc.xyz returns 200 OK if the movie/show exists.
    const isAvailable = response.ok;

    return NextResponse.json({ isAvailable });
  } catch (error) {
    console.error(`Error checking availability for ${imdbId}:`, error);
    // If there's a network error or any other issue, assume it's not available.
    return NextResponse.json({ isAvailable: false }, { status: 500 });
  }
} 