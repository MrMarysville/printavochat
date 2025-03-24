import React, { JSX, useRef, useState } from 'react';
import Image from 'next/image';
import { Progress } from './ui/progress'; // Corrected import for named export
import { Button } from './ui/button';
import { Paperclip } from 'lucide-react';

interface FileUploadProps {
  files: File[];
  uploadProgress: Record<string, number>;
  uploading: boolean;
}

interface FileUploaderProps {
  onFileUpload: (files: File[]) => Promise<void>;
  _parentType?: string;
  _parentId?: string;
}

// Utility function to get a preview URL for a file
function getPreviewUrl(file: File): string | undefined {
  if (file.type.startsWith('image/')) {
    return URL.createObjectURL(file);
  }
  return undefined;
}

// Utility function to get a file icon based on file type
function getFileIcon(_: File): JSX.Element {
  // Placeholder logic for file icon
  return <span className="icon-file" />;
}

export default function FileUploadComponent({ files, uploadProgress, uploading }: FileUploadProps) {
  return (
    <div className="space-y-2">
      {files.map((file, index) => {
        const previewUrl = getPreviewUrl(file);
        const progress = uploadProgress[file.name] || 0;
        
        return (
          <div key={index} className="flex items-center p-2 bg-gray-50 rounded-md">
            <div className="mr-3">
              {previewUrl ? (
                <Image src={previewUrl} alt={`Preview of ${file.name}`} width={40} height={40} className="object-cover rounded" />
              ) : (
                getFileIcon(file)
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-gray-500">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
              {uploading && (
                <Progress value={progress} />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function FileUpload({ onFileUpload, _parentType, _parentId }: FileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      onFileUpload(fileArray);
      // Reset the input value so the same file can be uploaded again if needed
      e.target.value = '';
    }
  };
  
  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        multiple
        aria-label="Upload files"
      />
      <Button
        variant="outline"
        size="sm"
        type="button"
        onClick={handleClick}
        className="flex items-center"
      >
        <Paperclip className="h-4 w-4 mr-2" />
        Attach files
      </Button>
    </div>
  );
}