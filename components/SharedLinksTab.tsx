"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { formatDistanceToNow, format } from "date-fns";
import { Clipboard, Clock, Eye, Calendar, ExternalLink, Info, Mail, Shield } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { type ShareableLink } from "@/lib/generated/prisma";

// Define the shape of the data we expect from the API
interface ShareableLinkWithTitle extends ShareableLink {
  videoTitle: string;
  url: string; // URL is always present as we construct it in the API
}

// Fetch shareable links function
const fetchShareableLinks = async (): Promise<ShareableLinkWithTitle[]> => {
  const response = await axios.get('/api/shareable-links');
  return response.data;
};

export default function SharedLinksTab() {
  // Use Tanstack Query to fetch shareable links
  const { data: sharedLinks = [], isLoading, error } = useQuery({
    queryKey: ['shareable-links'],
    queryFn: fetchShareableLinks,
  });

  if (isLoading) {
    return <div className="flex justify-center py-10">Loading your shared links...</div>;
  }

  if (error) {
    return <div className="text-red-500 py-10">Failed to load shared links. Please try again later.</div>;
  }

  if (sharedLinks.length === 0) {
    return <div className="text-center py-10">You haven't shared any videos yet.</div>;
  }

  return (
    <Card>
      <CardContent className="p-6">
        <ul className="space-y-6">
          {sharedLinks.map((link) => (
            <li key={link.id} className="border border-border rounded-lg overflow-hidden">
              <div className="bg-muted px-4 py-3 border-b flex justify-between items-center">
                <h3 className="font-medium">{link.videoTitle}</h3>
                <Badge variant={link.public ? "default" : "secondary"}>
                  {link.public ? 'Public' : 'Private'}
                </Badge>
              </div>
              
              <div className="p-4">
                <div className="flex items-center mb-4">
                  <div className="flex-1 truncate text-sm text-muted-foreground">
                    {link.url}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="ml-2"
                    onClick={() => {
                      if (link.url) {
                        navigator.clipboard.writeText(link.url);
                      }
                    }}
                  >
                    <Clipboard className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="ml-1"
                    onClick={() => {
                      if (link.url) {
                        window.open(link.url, '_blank');
                      }
                    }}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    <span>{link.clickCount} views</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Created {formatDistanceToNow(new Date(link.createdAt), { addSuffix: true })}</span>
                  </div>
                  
                  {link.lastAccessedAt && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Last viewed {formatDistanceToNow(new Date(link.lastAccessedAt), { addSuffix: true })}</span>
                    </div>
                  )}
                  
                  {link.expiresAt && (
                    <div className="flex items-center gap-1">
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-5 p-0 text-xs flex items-center gap-1 text-amber-600">
                            <Info className="h-3.5 w-3.5" />
                            Expires
                          </Button>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-auto p-2">
                          <p className="text-xs">
                            Expires on {format(new Date(link.expiresAt), 'PPP')}
                          </p>
                        </HoverCardContent>
                      </HoverCard>
                    </div>
                  )}
                </div>
                
                {!link.public && link.accessEmails.length > 0 && (
                  <Accordion type="single" collapsible className="mt-4 w-full">
                    <AccordionItem value="access-list" className="border-0">
                      <AccordionTrigger className="py-2 px-3 bg-muted rounded-md flex justify-between items-center text-sm font-medium hover:no-underline">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-blue-500" />
                          Access permissions ({link.accessEmails.length})
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-4">
                        <div className="space-y-2">
                          {link.accessEmails.map((email, i) => (
                            <div key={i} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                              <Avatar className="h-7 w-7">
                                <div className="bg-blue-100 text-blue-700 h-full w-full flex items-center justify-center text-xs">
                                  {email.charAt(0).toUpperCase()}
                                </div>
                              </Avatar>
                              <div className="flex-1 truncate">
                                <span className="text-sm">{email}</span>
                              </div>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 flex justify-end">
                          <Button variant="outline" size="sm" className="text-xs">
                            Manage Access
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
} 