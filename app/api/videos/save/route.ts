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
    const { fileId, name, url, thumbnailUrl, filePath, size, fileType } = body;

    if (!url) {
      return NextResponse.json(
        { error: "Missing required fields" }, 
        { status: 400 }
      );
    }

    const video = await db.video.create({
      data: {
        fileName: name || "Untitled Video",
        fileUrl: url,
        fileSize: size || 0,
        thumbnailUrl: thumbnailUrl || null,
        userId: user.id,
      }
    });

    return NextResponse.json(video);
  } catch (error) {
    console.error("[VIDEOS_SAVE]", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
} 