"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import VideosTab from "@/components/VideosTab";
import SharedLinksTab from "@/components/SharedLinksTab";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { ModeToggle } from "@/components/ModeToggle";
import UploadDialog from "@/components/UploadDialog";
import { Upload } from "lucide-react";

export default function DashboardPage() {
  const { isSignedIn, isLoaded } = useUser();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/");
    }
  }, [isLoaded, isSignedIn, router]);

  // Don't render anything until we know the authentication state
  if (!isLoaded) {
    return null;
  }

  // If not signed in, we'll redirect in the useEffect
  if (!isSignedIn) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-3">
          <ModeToggle />
          <SignedIn>
            <UserButton 
              appearance={{
                elements: {
                  userButtonAvatarBox: {
                    width: '40px',
                    height: '40px'
                  },
                  userButtonBox: {
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                  }
                }
              }}
            />
          </SignedIn>
        </div>
      </div>
      
      <Tabs defaultValue="videos" className="w-full">
        <div className="flex justify-between items-center mb-6">
          <TabsList>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="shared-links">Shared Links</TabsTrigger>
          </TabsList>
          
          <Button onClick={() => setIsUploadDialogOpen(true)}>
            <Upload className="h-4 w-4" /> Upload
          </Button>
        </div>
        
        <TabsContent value="videos" className="mt-4">
          <VideosTab />
        </TabsContent>
        
        <TabsContent value="shared-links" className="mt-4">
          <SharedLinksTab />
        </TabsContent>
      </Tabs>

      <UploadDialog 
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
      />
    </div>
  );
}
