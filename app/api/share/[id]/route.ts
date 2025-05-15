import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await currentUser();

    if (!id) {
      return NextResponse.json({ error: "Missing link ID" }, { status: 400 });
    }

    // Find the shareable link
    const shareableLink = await db.shareableLink.findUnique({
      where: {
        id
      },
      include: {
        video: true
      }
    });

    if (!shareableLink) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    // Check if the link has expired
    if (shareableLink.expiresAt && new Date(shareableLink.expiresAt) < new Date()) {
      return NextResponse.json({ error: "Link has expired" }, { status: 403 });
    }

    // Check access permissions for private videos
    if (!shareableLink.public) {
      // Get user email for permission check
      let userEmail = null;
      
      if (user) {
        userEmail = user.emailAddresses[0]?.emailAddress;
      }
      
      // If no user is logged in or user's email is not in the access list
      if (!userEmail || !shareableLink.accessEmails.includes(userEmail)) {
        return NextResponse.json(
          { 
            error: "Access denied", 
            requiresAuth: !userEmail,
            videoId: shareableLink.videoId 
          }, 
          { status: 403 }
        );
      }
    }

    // Update click count and last accessed time
    await db.shareableLink.update({
      where: {
        id
      },
      data: {
        clickCount: { increment: 1 },
        lastAccessedAt: new Date()
      }
    });

    // Return the video information
    return NextResponse.json({
      id: shareableLink.id,
      videoId: shareableLink.videoId,
      fileName: shareableLink.video.fileName,
      fileUrl: shareableLink.video.fileUrl,
      thumbnailUrl: shareableLink.video.thumbnailUrl,
      public: shareableLink.public
    });
  } catch (error) {
    console.error("[SHARE_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
} 