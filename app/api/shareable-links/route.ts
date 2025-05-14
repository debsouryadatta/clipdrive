import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const shareableLinks = await db.shareableLink.findMany({
      where: {
        userId: user.id
      },
      include: {
        video: {
          select: {
            fileName: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    // Transform the data to include videoTitle from the video's fileName
    const transformedLinks = shareableLinks.map(link => ({
      ...link,
      videoTitle: link.video.fileName,
      // Construct a URL for the shareable link
      url: `${process.env.NEXT_PUBLIC_APP_URL || ''}/share/${link.id}`
    }));

    return NextResponse.json(transformedLinks);
  } catch (error) {
    console.error("[SHAREABLE_LINKS_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 