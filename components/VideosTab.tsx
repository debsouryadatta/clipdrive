"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { formatDistanceToNow } from "date-fns";
import { FileIcon, Clock, Share2, Info } from "lucide-react";
import ShareDialog from "@/components/ShareDialog";
import axios from "axios";
import { type Video } from "@/lib/generated/prisma";
import { useQuery } from "@tanstack/react-query";

// Helper function to format file size
const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
};

// Helper function to format duration
const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Fetch videos function
const fetchVideos = async (): Promise<Video[]> => {
  const response = await axios.get('/api/videos');
  return response.data;
};

export default function VideosTab() {
  const [selectedVideo, setSelectedVideo] = useState<{ id: string; title: string } | null>(null);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);

  // Use Tanstack Query to fetch videos
  const { data: videos = [], isLoading, error } = useQuery({
    queryKey: ['videos'],
    queryFn: fetchVideos,
  });

  const handleShare = (video: { id: string; title: string }) => {
    setSelectedVideo(video);
    setIsShareDialogOpen(true);
  };

  if (isLoading) {
    return <div className="flex justify-center py-10">Loading your videos...</div>;
  }

  if (error) {
    return <div className="text-red-500 py-10">Failed to load videos. Please try again later.</div>;
  }

  if (videos.length === 0) {
    return <div className="text-center py-10">You haven't uploaded any videos yet.</div>;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <Card key={video.id} className="overflow-hidden flex flex-col">
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              {video.thumbnailUrl ? (
                <img
                  src={video.thumbnailUrl}
                  alt={video.fileName}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 w-full h-full bg-slate-200 flex items-center justify-center">
                  <FileIcon className="h-12 w-12 text-slate-400" />
                </div>
              )}
              {video.duration && (
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDuration(video.duration)}
                </div>
              )}
            </div>
            
            <CardContent className="p-4 flex-grow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-lg">{video.fileName}</h3>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Info className="h-4 w-4" />
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <p className="text-sm"><span className="font-medium">File name:</span> {video.fileName}</p>
                      <p className="text-sm"><span className="font-medium">Size:</span> {formatFileSize(video.fileSize)}</p>
                      {video.duration && (
                        <p className="text-sm"><span className="font-medium">Duration:</span> {formatDuration(video.duration)}</p>
                      )}
                      <p className="text-sm">
                        <span className="font-medium">Uploaded:</span> {formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
              <div className="flex items-center text-xs text-muted-foreground gap-3">
                <div className="flex items-center gap-1">
                  <FileIcon className="h-3 w-3" />
                  {formatFileSize(video.fileSize)}
                </div>
                <div>
                  {formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="px-4 py-3 bg-muted border-t">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => handleShare({ id: video.id, title: video.fileName })}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {selectedVideo && (
        <ShareDialog
          open={isShareDialogOpen}
          onOpenChange={setIsShareDialogOpen}
          video={selectedVideo}
        />
      )}
    </>
  );
} 