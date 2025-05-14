"use client";

import { useState, useCallback } from "react";
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import axios from "axios";
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useQueryClient } from "@tanstack/react-query";

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UploadDialog({ open, onOpenChange }: UploadDialogProps) {
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const queryClient = useQueryClient();

  // Get upload authentication parameters
  const getAuthParams = async () => {
    try {
      const response = await axios.get("/api/upload-auth");
      if (response.status !== 200) {
        throw new Error(`Authentication failed: ${response.status}`);
      }
      return response.data;
    } catch (error) {
      console.error("Authentication error:", error);
      throw new Error("Failed to get upload authentication");
    }
  };

  // Save video to database
  const saveVideoToDatabase = async (videoData: any) => {
    try {
      const response = await axios.post("/api/videos/save", {
        name: videoData.name,
        url: videoData.url,
        thumbnailUrl: videoData.thumbnailUrl,
        size: videoData.size,
      });

      if (response.status !== 200) {
        throw new Error(`Failed to save video: ${response.status}`);
      }
      
      return response.data;
    } catch (error: any) {
      console.error("Error saving video to database:", error);
      throw error;
    }
  };

  // Handle upload
  const handleUpload = async () => {
    if (files.length === 0) {
      setError("Please select a file first");
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      setUploadProgress(0);
      
      const file = files[0];
      const authData = await getAuthParams();

      // Create form data
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", file.name);
      formData.append("useUniqueFileName", "true");
      formData.append("folder", "/videos");
      formData.append("publicKey", authData.publicKey);
      formData.append("signature", authData.signature);
      formData.append("expire", authData.expire.toString());
      formData.append("token", authData.token);

      // Upload to ImageKit with progress tracking
      const result = await axios.post(
        "https://upload.imagekit.io/api/v1/files/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(percentCompleted);
            }
          }
        }
      );

      // Create thumbnail URL
      const thumbnailUrl = `${result.data.url}/ik-thumbnail.jpg`;
      
      // Save to database
      await saveVideoToDatabase({
        name: file.name,
        url: result.data.url,
        thumbnailUrl: thumbnailUrl,
        size: file.size,
      });

      setUploadSuccess(true);
      setIsUploading(false);
      setFiles([]);
      
      // Close dialog after successful upload with a delay
      setTimeout(() => {
        onOpenChange(false);
        setUploadSuccess(false);
      }, 1500);

      // invalidate the videos query
      await queryClient.invalidateQueries({ queryKey: ['videos'] });
      
    } catch (error: any) {
      setIsUploading(false);
      setError(error.message || "Upload failed. Please try again.");
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': []
    },
    maxFiles: 1,
    multiple: false
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Video</DialogTitle>
          <DialogDescription>
            Upload your video to share with others or save for yourself.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div 
            {...getRootProps()} 
            className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer min-h-[200px] flex flex-col items-center justify-center
              ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300'}`}
          >
            <input {...getInputProps()} />
            {files.length > 0 ? (
              <div className="space-y-2 w-full">
                <p className="text-sm font-medium">{files[0].name}</p>
                <p className="text-xs text-gray-500">{(files[0].size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            ) : (
              <div>
                {isDragActive ? (
                  <p className="text-primary">Drop the video here...</p>
                ) : (
                  <p className="text-gray-500">Drag a video file or click to browse</p>
                )}
              </div>
            )}
          </div>
          
          {isUploading && (
            <div className="mt-4 space-y-2">
              <Progress value={uploadProgress} className="h-2 w-full" />
              <p className="text-xs text-center text-gray-500">{uploadProgress}% uploaded</p>
            </div>
          )}
          
          {!isUploading && files.length > 0 && (
            <div className="mt-4 flex justify-end">
              <Button onClick={handleUpload}>Upload Video</Button>
            </div>
          )}
          
          {error && (
            <div className="mt-4 p-4 border border-destructive/20 rounded-md bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}
          
          {uploadSuccess && (
            <div className="mt-4 p-4 border border-green-500/20 rounded-md bg-green-500/10 text-green-600 text-sm">
              Video uploaded successfully!
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 