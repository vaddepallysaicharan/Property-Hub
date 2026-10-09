import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import { getPropertyById, updateProperty } from '@/lib/properties';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB per file

const ALLOWED_MIME_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    if (!id || typeof id !== 'string' || !id.trim()) {
      return NextResponse.json(
        { success: false, error: 'Property ID is required.' },
        { status: 400 }
      );
    }

    const trimmedId = id.trim();

    // 1. Verify property exists in Turso database
    const property = await getPropertyById(trimmedId);
    if (!property) {
      return NextResponse.json(
        { success: false, error: `Property with ID "${trimmedId}" not found.` },
        { status: 404 }
      );
    }

    // 2. Parse multipart/form-data
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid form data or request body.' },
        { status: 400 }
      );
    }

    // Collect all File objects
    const files: File[] = [];
    for (const [, value] of formData.entries()) {
      if (value instanceof File && value.size > 0) {
        files.push(value);
      }
    }

    if (files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No image files provided for upload.' },
        { status: 400 }
      );
    }

    // 3. Validate each file (MIME type, extension, size limit)
    for (const file of files) {
      const mimeType = file.type.toLowerCase();
      const rawExt = path.extname(file.name).toLowerCase();

      if (!ALLOWED_MIME_TYPES[mimeType] || !ALLOWED_EXTENSIONS.has(rawExt)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid file type for "${file.name}". Only JPEG, PNG, and WebP images are allowed.`,
          },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            success: false,
            error: `File "${file.name}" exceeds the 10 MB maximum size limit.`,
          },
          { status: 400 }
        );
      }
    }

    // 4. Save files securely to public/uploads/properties/
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'properties');
    await fs.mkdir(uploadsDir, { recursive: true });

    const newPhotoUrls: string[] = [];

    for (const file of files) {
      const mimeType = file.type.toLowerCase();
      const ext = ALLOWED_MIME_TYPES[mimeType] || 'jpg';
      const uniqueName = `prop-${trimmedId}-${crypto.randomUUID()}.${ext}`;
      const safeFilePath = path.join(uploadsDir, uniqueName);

      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(safeFilePath, buffer);

      newPhotoUrls.push(`/uploads/properties/${uniqueName}`);
    }

    // 5. Update Turso properties.photos
    const currentPhotos = Array.isArray(property.photos) ? property.photos : [];
    // Filter out dummy default image if previously set as only photo
    const cleanedPhotos = currentPhotos.filter(
      (p) => !p.includes('images.unsplash.com/photo-1545324418-cc1a3fa10c00') || currentPhotos.length > 1
    );

    const updatedPhotos = [...cleanedPhotos, ...newPhotoUrls];

    const updated = await updateProperty(trimmedId, {
      photos: updatedPhotos,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Failed to update property photo references in database.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Photos uploaded successfully',
      uploadedCount: newPhotoUrls.length,
      photos: updatedPhotos,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[API POST /api/properties/[id]/photos error]:', errorMsg);

    return NextResponse.json(
      { success: false, error: 'Internal server error while uploading photos.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    if (!id || typeof id !== 'string' || !id.trim()) {
      return NextResponse.json(
        { success: false, error: 'Property ID is required.' },
        { status: 400 }
      );
    }

    const trimmedId = id.trim();

    // 1. Verify property exists
    const property = await getPropertyById(trimmedId);
    if (!property) {
      return NextResponse.json(
        { success: false, error: `Property with ID "${trimmedId}" not found.` },
        { status: 404 }
      );
    }

    // 2. Parse photoUrl from body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON request body.' },
        { status: 400 }
      );
    }

    const { photoUrl } = body || {};

    if (!photoUrl || typeof photoUrl !== 'string' || !photoUrl.trim()) {
      return NextResponse.json(
        { success: false, error: 'Photo URL is required for deletion.' },
        { status: 400 }
      );
    }

    const trimmedPhotoUrl = photoUrl.trim();
    const currentPhotos = Array.isArray(property.photos) ? property.photos : [];

    // 3. Verify photo belongs to this property
    if (!currentPhotos.includes(trimmedPhotoUrl)) {
      return NextResponse.json(
        { success: false, error: 'Photo does not belong to this property.' },
        { status: 400 }
      );
    }

    // 4. Update database reference
    const remainingPhotos = currentPhotos.filter((p) => p !== trimmedPhotoUrl);
    const updated = await updateProperty(trimmedId, {
      photos: remainingPhotos,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Failed to remove photo reference from database.' },
        { status: 500 }
      );
    }

    // 5. If it's a local file stored under /uploads/properties/, remove it securely
    if (trimmedPhotoUrl.startsWith('/uploads/properties/')) {
      const filename = path.basename(trimmedPhotoUrl);
      const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads', 'properties');
      const targetFilePath = path.resolve(uploadsDir, filename);

      // Path traversal check
      if (targetFilePath.startsWith(uploadsDir)) {
        try {
          await fs.unlink(targetFilePath);
        } catch (unlinkError) {
          console.warn('[Photo Delete] File unlink warning:', unlinkError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Photo deleted successfully.',
      photos: remainingPhotos,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[API DELETE /api/properties/[id]/photos error]:', errorMsg);

    return NextResponse.json(
      { success: false, error: 'Internal server error while deleting photo.' },
      { status: 500 }
    );
  }
}
