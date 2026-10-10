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

// Configurable maximum upload size (50 MB by default)
const MAX_FILE_SIZE = process.env.MAX_VIDEO_UPLOAD_BYTES
  ? parseInt(process.env.MAX_VIDEO_UPLOAD_BYTES, 10)
  : 50 * 1024 * 1024;

// Allowed MIME types mapped to normalized file extensions
const ALLOWED_MIME_TYPES: Record<string, string> = {
  'video/webm': 'webm',
  'video/mp4': 'mp4',
  'video/ogg': 'ogv',
  'video/quicktime': 'mov',
};

const ALLOWED_EXTENSIONS = new Set(['.webm', '.mp4', '.ogv', '.ogg', '.mov']);

/**
 * POST /api/properties/[id]/video
 * Securely handles multipart/form-data video upload, stores the file,
 * and updates property.video_url in Turso.
 *
 * NOTE ON AUTHORIZATION:
 * Authentication is not currently implemented in PropertyHub.
 * Owner-only upload authorization should be integrated here (e.g., session/JWT verification)
 * once an auth provider is added.
 */
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

    // Retrieve video file (accept either 'video' field or first File encountered)
    let videoFile: File | null = null;
    const directFile = formData.get('video');
    if (directFile instanceof File && directFile.size > 0) {
      videoFile = directFile;
    } else {
      for (const [, value] of formData.entries()) {
        if (value instanceof File && value.size > 0) {
          videoFile = value;
          break;
        }
      }
    }

    if (!videoFile) {
      return NextResponse.json(
        { success: false, error: 'No video file provided for upload.' },
        { status: 400 }
      );
    }

    // 3. Validate MIME type (handling possible codec qualifiers like 'video/webm;codecs=vp9')
    const rawMime = videoFile.type.toLowerCase();
    const baseMime = rawMime.split(';')[0].trim();
    const rawExt = path.extname(videoFile.name || '').toLowerCase();

    if (!ALLOWED_MIME_TYPES[baseMime]) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid video format "${rawMime}". Allowed formats: WebM, MP4, OGG, QuickTime.`,
        },
        { status: 400 }
      );
    }

    if (rawExt && !ALLOWED_EXTENSIONS.has(rawExt)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid file extension "${rawExt}". Allowed extensions: .webm, .mp4, .ogg, .mov.`,
        },
        { status: 400 }
      );
    }

    // 4. Validate file size limit
    if (videoFile.size > MAX_FILE_SIZE) {
      const maxMb = Math.round(MAX_FILE_SIZE / (1024 * 1024));
      return NextResponse.json(
        {
          success: false,
          error: `Video file exceeds the maximum allowed size of ${maxMb} MB.`,
        },
        { status: 400 }
      );
    }

    // 5. Store file in persistent storage (public/uploads/videos)
    const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads', 'videos');
    await fs.mkdir(uploadsDir, { recursive: true });

    // Generate unique, unpredictable server-side filename (never trust client name)
    const ext = ALLOWED_MIME_TYPES[baseMime] || 'webm';
    const uniqueFileName = `prop-${trimmedId}-${crypto.randomUUID()}.${ext}`;
    const safeFilePath = path.resolve(uploadsDir, uniqueFileName);

    // Path traversal defense
    if (!safeFilePath.startsWith(uploadsDir)) {
      return NextResponse.json(
        { success: false, error: 'Invalid destination path for upload.' },
        { status: 400 }
      );
    }

    const fileBuffer = Buffer.from(await videoFile.arrayBuffer());
    await fs.writeFile(safeFilePath, fileBuffer);

    const newVideoUrl = `/uploads/videos/${uniqueFileName}`;
    const previousVideoUrl = property.video_url;

    // 6. Update database record only after file has been successfully written
    let updated = false;
    try {
      updated = await updateProperty(trimmedId, {
        video_url: newVideoUrl,
      });
    } catch (dbError) {
      // Clean up newly written file if DB operation throws
      await fs.unlink(safeFilePath).catch(() => {});
      const msg = dbError instanceof Error ? dbError.message : 'Database error';
      console.error('[POST /api/properties/[id]/video DB error]:', msg);
      return NextResponse.json(
        { success: false, error: 'Failed to record video URL in database.' },
        { status: 500 }
      );
    }

    if (!updated) {
      // Clean up newly written file if DB update didn't affect any rows
      await fs.unlink(safeFilePath).catch(() => {});
      return NextResponse.json(
        { success: false, error: 'Failed to update property video in database.' },
        { status: 500 }
      );
    }

    // 7. Cleanup previous local video file if this was a replacement
    if (
      previousVideoUrl &&
      previousVideoUrl !== newVideoUrl &&
      previousVideoUrl.startsWith('/uploads/videos/')
    ) {
      const oldFilename = path.basename(previousVideoUrl);
      const oldFilePath = path.resolve(uploadsDir, oldFilename);
      if (oldFilePath.startsWith(uploadsDir) && oldFilePath !== safeFilePath) {
        try {
          await fs.unlink(oldFilePath);
        } catch (unlinkErr) {
          console.warn('[Video Replacement - Old File Cleanup Warning]:', unlinkErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Showcase video saved to property successfully.',
      video_url: newVideoUrl,
      propertyId: trimmedId,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[API POST /api/properties/[id]/video error]:', errorMsg);

    return NextResponse.json(
      { success: false, error: 'Internal server error while saving video.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/properties/[id]/video
 * Returns the saved video URL for the property.
 */
export async function GET(
  _request: NextRequest,
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
    const property = await getPropertyById(trimmedId);

    if (!property) {
      return NextResponse.json(
        { success: false, error: `Property with ID "${trimmedId}" not found.` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      propertyId: trimmedId,
      video_url: property.video_url || null,
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[API GET /api/properties/[id]/video error]:', errorMsg);

    return NextResponse.json(
      { success: false, error: 'Internal server error while fetching video.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/properties/[id]/video
 * Clears the video_url reference from the property and removes the local file.
 */
export async function DELETE(
  _request: NextRequest,
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
    const property = await getPropertyById(trimmedId);

    if (!property) {
      return NextResponse.json(
        { success: false, error: `Property with ID "${trimmedId}" not found.` },
        { status: 404 }
      );
    }

    const currentVideoUrl = property.video_url;
    if (!currentVideoUrl) {
      return NextResponse.json({
        success: true,
        message: 'No video showcase was associated with this property.',
      });
    }

    const updated = await updateProperty(trimmedId, {
      video_url: null,
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Failed to remove video from database.' },
        { status: 500 }
      );
    }

    // Clean up local file if stored in /uploads/videos/
    if (currentVideoUrl.startsWith('/uploads/videos/')) {
      const filename = path.basename(currentVideoUrl);
      const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads', 'videos');
      const targetFilePath = path.resolve(uploadsDir, filename);

      if (targetFilePath.startsWith(uploadsDir)) {
        try {
          await fs.unlink(targetFilePath);
        } catch (unlinkErr) {
          console.warn('[Video Delete - Unlink Warning]:', unlinkErr);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Showcase video removed successfully.',
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[API DELETE /api/properties/[id]/video error]:', errorMsg);

    return NextResponse.json(
      { success: false, error: 'Internal server error while removing video.' },
      { status: 500 }
    );
  }
}
