"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Play, AlertCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { SignInButton } from "@clerk/nextjs";

interface SharedVideo {
  id: string;
  videoId: string;
  fileName: string;
  fileUrl: string;
  thumbnailUrl: string | null;
  public: boolean;
}

export default function SharePage() {
  const { id } = useParams();
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const [video, setVideo] = useState<SharedVideo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await axios.get(`/api/share/${id}`);
        setVideo(response.data);
      } catch (err: any) {
        console.error("Error fetching shared video:", err);

        // Handle access denied error from backend
        if (err.response?.status === 403) {
          setAccessDenied(true);
        } else {
          setError(err.response?.data?.error || "Failed to load video");
        }
      } finally {
        setLoading(false);
      }
    };

    if (id && isLoaded) {
      fetchVideo();
    }
  }, [id, isLoaded]);

  if (isLoaded && !isSignedIn) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-4">
          <p className="text-muted-foreground">
            You need to sign in to access this video.
          </p>
          <SignInButton mode="modal">
            <Button size="lg">Sign In</Button>
          </SignInButton>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <p>Loading video...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-4">
          <div className="flex justify-center">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold">Error</h1>
          <p className="text-muted-foreground">{error}</p>
          <Button asChild>
            <a href="/">Return to Home</a>
          </Button>
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-4">
          <div className="flex justify-center">
            <Lock className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Access Restricted</h1>
            <>
              <p className="text-muted-foreground">
                You don't have permission to view this video.
              </p>
              <p className="text-sm text-muted-foreground">
                This video is private and only available to specific users.
              </p>
              <Button onClick={() => router.push("/")}>Return to Home</Button>
            </>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <p>Video not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex gap-2 items-center text-xl font-bold">
            <Play className="h-6 w-6 text-primary" />
            <span>ClipDrive</span>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">{video.fileName}</h1>

        <div className="aspect-video w-full max-w-4xl mx-auto bg-black rounded-lg overflow-hidden">
          <video
            src={video.fileUrl}
            poster={video.thumbnailUrl || undefined}
            controls
            className="w-full h-full object-contain"
          />
        </div>
      </main>
    </div>
  );
}
