import { NextResponse } from 'next/server';
import { saveBase64Image } from '@/lib/file-storage';

export async function POST(request: Request) {
  try {
    const { image, subDir } = await request.json();

    if (!image || !subDir) {
      return NextResponse.json(
        { error: 'Image data and subdirectory are required.' },
        { status: 400 }
      );
    }

    if (!['facial-data', 'snapshots', 'students'].includes(subDir)) {
      return NextResponse.json(
        { error: 'Invalid subdirectory.' },
        { status: 400 }
      );
    }

    const imageUrl = await saveBase64Image(image, subDir);

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Failed to save image.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ imageUrl }, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'An error occurred during upload.' },
      { status: 500 }
    );
  }
}
