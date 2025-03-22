"use client";

import React, { useState, useRef } from 'react';
import { UploadCloud, X, FileText, Image, File } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { toast } from './ui/use-toast';

export interface FileUploadProps {
  onFileUpload: (files: File[]) => Promise<void>;
  allowedTypes?: string[];
  maxSize?: number; // in MB
  maxFiles?: number;
  parentId?: string;
  parentType?: 'quote' | 'order' | 'lineitem' | 'chat';
}

export function FileUpload({ 
  onFileUpload, 
  allowedTypes = ['image/*', 'application/pdf', '.ai', '.eps', '.psd'],
  maxSize = 10, // 10MB default
  maxFiles = 5,
  parentId,
  parentType = 'chat'
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFiles = (fileList: FileList) => {
    const newFiles: File[] = [];
    
    // Check if adding new files would exceed the max count
    if (files.length + fileList.length > maxFiles) {
      toast({
        title: 'Too many files',
        description: `You can only upload a maximum of ${maxFiles} files at once.`,
        variant: 'destructive'
      });
      return;
    }
    
    // Validate files
    Array.from(fileList).forEach(file => {
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: `File "${file.name}" exceeds the ${maxSize}MB limit.`,
          variant: 'destructive'
        });
        return;
      }
      
      // Check file type
      const fileType = file.type;
      const fileExtension = `.${file.name.split('.').pop()}`;
      const isTypeAllowed = allowedTypes.some(type => {
        if (type.includes('*')) {
          return fileType.startsWith(type.split('/')[0]);
        }
        return type === fileType || type === fileExtension;
      });
      
      if (!isTypeAllowed) {
        toast({
          title: 'File type not supported',
          description: `File "${file.name}" is not a supported file type.`,
          variant: 'destructive'
        });
        return;
      }
      
      newFiles.push(file);
    });
    
    setFiles(prevFiles => [...prevFiles, ...newFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    
    try {
      // Initialize progress for each file
      const initialProgress = files.reduce((acc, file) => {
        acc[file.name] = 0;
        return acc;
      }, {} as {[key: string]: number});
      
      setUploadProgress(initialProgress);
      
      // Upload files with simulated progress
      files.forEach(file => {
        // Simulate progress
        const interval = setInterval(() => {
          setUploadProgress(prev => {
            const current = prev[file.name] || 0;
            if (current >= 100) {
              clearInterval(interval);
              return prev;
            }
            return {
              ...prev,
              [file.name]: Math.min(current + 10, 95) // Hold at 95% until actual completion
            };
          });
        }, 200);
        
        // Simulate file type
        setTimeout(() => {
          clearInterval(interval);
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: 100
          }));
        }, 2000);
      });
      
      // Execute the actual upload function provided via props
      await onFileUpload(files);
      
      // Clear files after successful upload
      setTimeout(() => {
        setFiles([]);
        setUploadProgress({});
        setUploading(false);
        toast({
          title: 'Files uploaded successfully',
          description: `${files.length} file${files.length > 1 ? 's' : ''} uploaded.`
        });
      }, 500);
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploading(false);
      toast({
        title: 'Upload failed',
        description: 'There was an error uploading your files. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const removeFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  // Helper to get appropriate icon for file type
  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-6 w-6 text-blue-500" />;
    } else if (file.type === 'application/pdf') {
      return <FileText className="h-6 w-6 text-red-500" />;
    } else {
      return <File className="h-6 w-6 text-gray-500" />;
    }
  };

  // Generate preview URLs for images
  const getPreviewUrl = (file: File): string | null => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  return (
    <div className="w-full">
      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
          isDragging ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <UploadCloud className="h-10 w-10 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600 mb-1">
          Drag and drop files here, or click to select files
        </p>
        <p className="text-xs text-gray-500">
          Max {maxFiles} files, up to {maxSize}MB each
        </p>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          onChange={handleFileInputChange}
          accept={allowedTypes.join(',')}
        />
      </div>

      {/* File previews */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium">Selected Files:</p>
          <div className="space-y-2">
            {files.map((file, index) => {
              const previewUrl = getPreviewUrl(file);
              const progress = uploadProgress[file.name] || 0;
              
              return (
                <div key={index} className="flex items-center p-2 bg-gray-50 rounded-md">
                  <div className="mr-3">
                    {previewUrl ? (
                      <img src={previewUrl} alt={file.name} className="h-10 w-10 object-cover rounded" />
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
                      <Progress 
                        value={progress} 
                        className="h-1 mt-1" 
                        indicatorClassName={progress === 100 ? "bg-green-500" : undefined}
                      />
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="ml-2 text-gray-400 hover:text-red-500"
                    disabled={uploading}
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              );
            })}
          </div>
          <div className="flex justify-end mt-4">
            <Button 
              onClick={handleUpload} 
              disabled={uploading || files.length === 0}
              className="flex items-center gap-2"
            >
              <UploadCloud className="h-4 w-4" />
              {uploading ? 'Uploading...' : 'Upload Files'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 