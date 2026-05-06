import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-sanity-webhook-secret');

  if (secret !== process.env.SANITY_WEBHOOK_SECRET) {
    return NextResponse.json({ message: 'Invalid secret' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const type = body._type;

    switch (type) {
      case 'article':
        revalidatePath('/content');
        break;
      case 'areaGuide':
        revalidatePath('/areas');
        if (body.prefectureSlug) {
          revalidatePath(`/areas/${body.prefectureSlug}`);
        }
        break;
      case 'page':
        if (body.slug?.current) {
          revalidatePath(`/${body.slug.current}`);
        }
        break;
      default:
        revalidatePath('/');
    }

    return NextResponse.json({ revalidated: true });
  } catch {
    return NextResponse.json({ message: 'Error revalidating' }, { status: 500 });
  }
}
