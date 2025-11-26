import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Video, { IVideo } from "@/model/Video.model";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDatabase()
    const videos = await Video.find({}).sort({createdAt: -1}).lean()

    if(!videos || videos.length === 0 ){
      return NextResponse.json(
        [], 
        {status:201}
      )
    }

    return NextResponse.json(videos)

  } catch (error) {
    return NextResponse.json(
      {
        error:"Fetching videos failed"
      }, 
      {status:500}
    )
  }
}

export async function POST(request: NextRequest) {
  try {
   const session = await getServerSession(authOptions)

   if(!session) 
   {
     return NextResponse.json(
      {error:"Unauthorized Request"}, 
      {status:400}
    )
   }

   await connectToDatabase()

   const body: IVideo = await request.json()

   if(
    !body.title ||
    !body.description ||
    !body.thumbnailUrl ||
    !body.videoUrl 
   ) {
  return NextResponse.json(
      {error:"Required fields missing"}, 
      {status:400}
    )
   }

   const videoData = {
    ...body,
    controls: body?.controls ?? true,
    transformation: {
      height: 1920,
     width: 1080,
     quality: body.transformation?.quality ?? 100,
    }
   }

   const newVideo = await Video.create(videoData)

   return NextResponse.json(
    {
      message: "Successfully created a video",
      newVideo
    },
    {status: 200} 
    )

  } catch (error) {
    return NextResponse.json(
      {
        error:"Failed to create Video",
      }, 
      {status:500}
    )
  }
}