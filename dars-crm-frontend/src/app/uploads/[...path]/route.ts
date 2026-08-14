import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path ? params.path.join('/') : '';
  const rawApiUrl = process.env.BACKEND_API_URL || 'http://172.17.0.1:8001';
  const backendBase = rawApiUrl.split('/api')[0].replace(/\/+$/, '');
  const targetUrl = `${backendBase}/uploads/${path}`;

  try {
    const res = await fetch(targetUrl);

    if (!res.ok) {
      return new NextResponse('File Not Found', { status: res.status });
    }

    const contentType = res.headers.get('content-type') || 'application/octet-stream';
    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error proxying upload file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
