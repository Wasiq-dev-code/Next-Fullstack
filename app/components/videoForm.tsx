'use client';
import { apiClient } from "@/lib/api-client";
import { useState } from "react";
import UploadExample from "./fileUploads";

const VideoForm = () => {
  const [title, setTitle] = useState("")
  const [desc, setDesc] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [thumbnailUrl, setThumbnailUrl] = useState("")

  const handleSubmit = async (e:React.FormEvent) => {
    e.preventDefault()

     try {
      const data = await apiClient.createVideo({
        title,
        description: desc,
        videoUrl,
        thumbnailUrl
      });

      console.log("Video Created:", data);
    } catch (error) {
      console.error("Error While Creating Video:", error);
    }
  };
  return (
    <form
    onSubmit={handleSubmit}>

      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />

      <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description"/>

        <UploadExample FileType="video" onSuccess={(res) => setVideoUrl(res.url)}/>

        <UploadExample FileType="image" onSuccess={(res) => setThumbnailUrl(res.url)}/>
    </form>
  );
};

export default VideoForm;