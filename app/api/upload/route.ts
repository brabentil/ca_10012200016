import { NextRequest } from 'next/server';
import { uploadToS3, validateFileType, validateFileSize } from '@/lib/aws/s3';
import {
  successResponse,
  validationErrorResponse,
  forbiddenErrorResponse,
  internalServerErrorResponse,
} from '@/lib/response';

/**
 * POST /api/upload - Upload file to S3
 * General upload endpoint for images
 */
export async function POST(request: NextRequest) {
  try {
    const userRole = request.headers.get('x-user-role');

    if (userRole !== 'ADMIN') {
      return forbiddenErrorResponse('Admin access required');
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'general';

    if (!file) {
      return validationErrorResponse('File is required', [
        { field: 'file', message: 'File is required' },
      ]);
    }

    // Validate file type
    if (!validateFileType(file.type)) {
      return validationErrorResponse('Invalid file type', [
        {
          field: 'file',
          message: 'Only JPG, PNG, and WebP images are allowed',
        },
      ]);
    }

    // Validate file size (max 5MB)
    if (!validateFileSize(file.size)) {
      return validationErrorResponse('File too large', [
        { field: 'file', message: 'File size must be less than 5MB' },
      ]);
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Generate filename with folder
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${folder}/${timestamp}-${sanitizedName}`;

    // Upload to S3
    const imageUrl = await uploadToS3(buffer, filename, file.type);

    return successResponse(
      {
        url: imageUrl,
        filename: sanitizedName,
        folder,
      },
      'File uploaded successfully',
      201
    );
  } catch (error) {
    console.error('Upload file error:', error);
    return internalServerErrorResponse('Failed to upload file');
  }
}
