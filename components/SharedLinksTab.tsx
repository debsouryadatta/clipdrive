"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow, format } from "date-fns";
import { Link2, Copy, Check, ExternalLink, Users, Globe, Clock } from "lucide-react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { type ShareableLink } from "@/lib/generated/prisma";

// Define the shape of the data we expect from the API
interface ShareableLinkWithDetails extends ShareableLink {
  videoTitle: string;
  url: string;
}

// Fetch shared links function
const fetchSharedLinks = async (): Promise<ShareableLinkWithDetails[]> => {
  const response = await axios.get('/api/shareable-links');
  return response.data;
};

export default function SharedLinksTab() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Use Tanstack Query to fetch shared links
  const { data: sharedLinks = [], isLoading, error } = useQuery({
    queryKey: ['sharedLinks'],
    queryFn: fetchSharedLinks,
  });

  const copyToClipboard = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("Link copied to clipboard");
  };

  if (isLoading) {
    return <div className="flex justify-center py-10">Loading your shared links...</div>;
  }

  if (error) {
    return <div className="text-red-500 py-10">Failed to load shared links. Please try again later.</div>;
  }

  if (sharedLinks.length === 0) {
    return <div className="text-center py-10">You haven't created any shared links yet.</div>;
  }

  return (
    <div className="space-y-4">
      {sharedLinks.map((link) => (
        <Card key={link.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-lg">{link.videoTitle}</h3>
                  {link.public ? (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      Public
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      Private
                    </Badge>
                  )}
                </div>
                <div className="flex items-center text-xs text-muted-foreground gap-3">
                  <div>
                    Created {formatDistanceToNow(new Date(link.createdAt), { addSuffix: true })}
                  </div>
                  {link.expiresAt && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Expires {format(new Date(link.expiresAt), 'MMM d, yyyy')}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="relative flex-1 min-w-[200px]">
                  <input
                    type="text"
                    value={link.url}
                    readOnly
                    className="w-full h-9 px-3 py-1 rounded-md border bg-muted text-sm"
                  />
                </div>
                <Button 
                  size="icon" 
                  variant="outline"
                  onClick={() => copyToClipboard(link.id, link.url)}
                  className="cursor-pointer"
                >
                  {copiedId === link.id ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button 
                  size="icon" 
                  variant="outline"
                  asChild
                >
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
            
            {!link.public && link.accessEmails.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-muted-foreground mb-1">Shared with:</p>
                <div className="flex flex-wrap gap-2">
                  {link.accessEmails.map((email) => (
                    <Badge key={email} variant="secondary" className="text-xs">
                      {email}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 