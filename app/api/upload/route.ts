import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/lib/logger';

// Define allowed file types
const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/svg+xml',
  'application/pdf',
  'image/vnd.adobe.photoshop',
  'application/postscript',
  'application/illustrator'
];

// Define max file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const parentId = formData.get('parentId') as string || 'chat';
    const parentType = formData.get('parentType') as string || 'chat';
    
    // Validate input
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files uploaded' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', parentType, parentId);
    
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const uploadedFiles = [];

    // Process each file
    for (const file of files) {
      // Validate file type
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `File type ${file.type} not allowed` },
          { status: 400 }
        );
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File size exceeds limit (10MB)` },
          { status: 400 }
        );
      }

      try {
        // Generate unique filename
        const fileName = `${uuidv4()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const filePath = join(uploadsDir, fileName);
        
        // Write file to disk
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        await writeFile(filePath, fileBuffer);
        
        // Construct URL path to the file
        const fileUrl = `/uploads/${parentType}/${parentId}/${fileName}`;
        
        uploadedFiles.push({
          originalName: file.name,
          fileName,
          path: filePath,
          url: fileUrl,
          type: file.type,
          size: file.size,
        });
      } catch (e) {
        logger.error('Error saving file:', e);
        return NextResponse.json(
          { error: 'Error saving file' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      message: `${uploadedFiles.length} files uploaded successfully`,
      files: uploadedFiles
    });
  } catch (error) {
    logger.error('Upload route error:', error);
    return NextResponse.json(
      { error: 'Internal server error during upload' },
      { status: 500 }
    );
  }
} 