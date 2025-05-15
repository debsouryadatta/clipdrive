import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { videoId, isPublic, accessEmails, expiryDate } = body;

    if (!videoId) {
      return NextResponse.json(
        { error: "Missing required fields" }, 
        { status: 400 }
      );
    }

    // Verify the video belongs to the user
    const video = await db.video.findFirst({
      where: {
        id: videoId,
        userId: user.id
      }
    });

    if (!video) {
      return NextResponse.json(
        { error: "Video not found or access denied" }, 
        { status: 404 }
      );
    }

    // Create the shareable link
    const shareableLink = await db.shareableLink.create({
      data: {
        videoId,
        userId: user.id,
        public: isPublic,
        accessEmails: isPublic ? [] : accessEmails || [],
        expiresAt: expiryDate ? new Date(expiryDate) : null
      }
    });

    // Return the shareable link with a constructed URL
    return NextResponse.json({
      ...shareableLink,
      url: `${process.env.NEXT_PUBLIC_APP_URL || ''}/share/${shareableLink.id}`
    });
  } catch (error) {
    console.error("[SHAREABLE_LINKS_CREATE]", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
} 