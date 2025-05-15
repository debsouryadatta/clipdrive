"use client";

import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { X, Link2, Copy, Check, Clock, AlertCircle } from "lucide-react";
import { format, addDays } from 'date-fns';
import { toast } from "sonner";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  video: {
    id: string;
    title: string;
  };
}

export default function ShareDialog({ open, onOpenChange, video }: ShareDialogProps) {
  const [isPublic, setIsPublic] = useState(true);
  const [accessEmails, setAccessEmails] = useState<string[]>([]);
  const [currentEmail, setCurrentEmail] = useState('');
  const [expiryDate, setExpiryDate] = useState<string | null>(null);
  const [linkGenerated, setLinkGenerated] = useState(false);
  const [shareableLink, setShareableLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Reset dialog state when video changes or dialog opens
  useEffect(() => {
    if (open) {
      resetDialogState();
    }
  }, [open, video.id]);

  const resetDialogState = () => {
    setIsPublic(true);
    setAccessEmails([]);
    setCurrentEmail('');
    setExpiryDate(null);
    setLinkGenerated(false);
    setShareableLink('');
    setCopied(false);
    setEmailError(null);
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleAddEmail = async () => {
    if (!currentEmail || !validateEmail(currentEmail)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    if (accessEmails.includes(currentEmail)) {
      setEmailError("This email has already been added");
      return;
    }

    setIsLoading(true);
    setEmailError(null);

    try {
      // Check if email exists in our database
      const response = await axios.post('/api/check-email', { email: currentEmail });
      
      if (!response.data.exists) {
        setEmailError("This email is not registered on our platform");
        setIsLoading(false);
        return;
      }

      setAccessEmails([...accessEmails, currentEmail]);
      setCurrentEmail('');
    } catch (error) {
      console.error("Error checking email:", error);
      setEmailError("Failed to verify email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveEmail = (email: string) => {
    setAccessEmails(accessEmails.filter(e => e !== email));
  };

  const handleSetExpiry = (days: number | null) => {
    if (days === null) {
      setExpiryDate(null);
    } else {
      setExpiryDate(format(addDays(new Date(), days), 'yyyy-MM-dd'));
    }
  };

  const isSelected = (days: number | null) => {
    if (days === null) {
      return expiryDate === null;
    }
    return expiryDate === format(addDays(new Date(), days), 'yyyy-MM-dd');
  };

  const generateLink = async () => {
    setIsLoading(true);
    
    try {
      // Create shareable link via API
      const response = await axios.post('/api/shareable-links/create', {
        videoId: video.id,
        isPublic,
        accessEmails: !isPublic ? accessEmails : [],
        expiryDate
      });
      
      setShareableLink(response.data.url);
      setLinkGenerated(true);
      
      // Invalidate the shared links query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['sharedLinks'] });
      
      toast.success("Shareable link created successfully");
    } catch (error) {
      console.error("Error generating link:", error);
      toast.error("Failed to generate shareable link");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareableLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Link copied to clipboard");
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share "{video.title}"</DialogTitle>
          <DialogDescription>
            {linkGenerated 
              ? "Your video is ready to share! Copy the link below." 
              : "Configure your sharing preferences for this video."}
          </DialogDescription>
        </DialogHeader>

        {linkGenerated ? (
          <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
              <div className="grid flex-1 gap-2">
                <Label htmlFor="link" className="sr-only">
                  Link
                </Label>
                <Input
                  id="link"
                  defaultValue={shareableLink}
                  readOnly
                  className="h-9"
                />
              </div>
              <Button size="sm" className="px-3" onClick={copyToClipboard}>
                <span className="sr-only">Copy</span>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              {isPublic 
                ? "Anyone with this link can view the video." 
                : "Only specified email addresses can access this video."}
              {expiryDate && ` This link will expire on ${expiryDate}.`}
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <Label htmlFor="public-toggle" className="font-medium">
                  Public link
                </Label>
                <span className="text-sm text-muted-foreground">
                  Anyone with the link can view this video
                </span>
              </div>
              <Switch 
                id="public-toggle" 
                checked={isPublic}
                onCheckedChange={setIsPublic}
                className="cursor-pointer"
              />
            </div>

            {!isPublic && (
              <div className="space-y-3">
                <Label className="font-medium">Who can access</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter email address"
                    value={currentEmail}
                    onChange={(e) => {
                      setCurrentEmail(e.target.value);
                      setEmailError(null);
                    }}
                    className="flex-1"
                  />
                  <Button onClick={handleAddEmail} disabled={isLoading} className="cursor-pointer">
                    {isLoading ? "Checking..." : "Add"}
                  </Button>
                </div>
                
                {emailError && (
                  <div className="text-sm text-destructive flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>{emailError}</span>
                  </div>
                )}
                
                {accessEmails.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {accessEmails.map((email) => (
                      <div 
                        key={email} 
                        className="flex items-center gap-1 bg-secondary rounded-full px-3 py-1"
                      >
                        <span className="text-xs">{email}</span>
                        <button 
                          onClick={() => handleRemoveEmail(email)}
                          className="hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3">
              <Label className="font-medium">Link expiration</Label>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant={isSelected(null) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSetExpiry(null)}
                  className={isSelected(null) ? "font-medium cursor-pointer" : "cursor-pointer"}
                >
                  {isSelected(null) && <Check className="h-3.5 w-3.5 mr-1" />}
                  Never
                </Button>
                <Button 
                  variant={isSelected(1) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSetExpiry(1)}
                  className={isSelected(1) ? "font-medium cursor-pointer" : "cursor-pointer"}
                >
                  {isSelected(1) && <Check className="h-3.5 w-3.5 mr-1" />}
                  1 day
                </Button>
                <Button 
                  variant={isSelected(7) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSetExpiry(7)}
                  className={isSelected(7) ? "font-medium cursor-pointer" : "cursor-pointer"}
                >
                  {isSelected(7) && <Check className="h-3.5 w-3.5 mr-1" />}
                  7 days
                </Button>
                <Button 
                  variant={isSelected(30) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleSetExpiry(30)}
                  className={isSelected(30) ? "font-medium cursor-pointer" : "cursor-pointer"}
                >
                  {isSelected(30) && <Check className="h-3.5 w-3.5 mr-1" />}
                  30 days
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <DialogFooter className="sm:justify-between">
          {!linkGenerated ? (
            <Button 
              onClick={generateLink} 
              className="w-full cursor-pointer"
              disabled={isLoading || (!isPublic && accessEmails.length === 0)}
            >
              {isLoading ? (
                "Generating..."
              ) : (
                <>
                  <Link2 className="mr-2 h-4 w-4" />
                  Generate link
                </>
              )}
            </Button>
          ) : (
            <Button onClick={() => onOpenChange(false)} className="w-full">
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 