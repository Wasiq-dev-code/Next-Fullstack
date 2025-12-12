"use client"
import { IVideo } from "@/model/Video.model"
import VideoComponent from "./videoComponent"
import { useEffect, useRef } from "react";
import { useNotification } from "./notification";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";


export default function VideoFeed(){
  const {showNotification} = useNotification()
  const hasShownNotification = useRef(false)

  const { data, isLoading } = useQuery<IVideo[]>({
  queryKey: ["videos"],
  queryFn: async (): Promise<IVideo[]> => {
    const res = await apiClient.getVideos(); 
    return res as IVideo[];
  },
});

  useEffect(() => {
    if(!data) return

    if (data.length === 0 && !hasShownNotification.current) {
      showNotification("No videos available at the moment", "info");
      hasShownNotification.current = true
    }

    if(data.length > 0) {
      hasShownNotification.current = false
    }
  }, [data,showNotification]);

  if(isLoading) return <p className="text-center py-10">Loading videos...</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {data?.map((video) => (
        <VideoComponent key={video._id?.toString()} video={video}/>
      ))}

      {data?.length === 0 && (
        <div className="col-span-full text-center py-12">
          <p className="text-base-content/70">No videos found</p>
        </div>
      )}
    </div>
  )
}