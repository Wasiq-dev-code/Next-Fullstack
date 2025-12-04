"use client" // This component must be a client component

import {
    upload,
} from "@imagekit/next";
import { useState } from "react";

interface FileUploadProps {
    onSuccess: (res:any) => void
    onProgress?: (progress:number) => void
    FileType: "image" | "video"
}


const UploadExample = ({
    onSuccess,
    onProgress,
    FileType
}: FileUploadProps) => {
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fileValidation = (file:File) => {
        setError(null);

    if (FileType === "video") {
        if (!file.type.startsWith("video/")) {
            setError("Please upload a valid video file");
            return false;
        }
    }

    if (FileType === "image") {
        if (!file.type.startsWith("image/")) {
            setError("Please upload a valid image file");
            return false;
        }
    }

    if (file.size > 100 * 1024 * 1024) {
        setError("File size must be less than 100MB");
        return false;
    }
    
        return true
    }

    const handleFileChange = async (e:React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]

        if(!file || !fileValidation(file)) return 

        setUploading(true)
        setError(null)

        try {
            const authRes = await fetch("/api/auth/imageKit-auth")
            const auth = await authRes.json()

           const res = await upload({
                // Authentication parameters
                file,
                fileName: file.name,
                publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_KEY!,
                signature:auth.signature,
                expire:auth.expire,
                token:auth.token,
                onProgress: (event) => {
                    if(event.lengthComputable && onProgress) {
                        const percent = (event.loaded / event.total) * 100;
                        onProgress(Math.round(percent))
                    }
                },
            })
            onSuccess(res)
        } catch (error) {
            console.error("Upload Failed", error)  
        } finally {
            setUploading(false)
        }
    }
    return (
        <>
            <input type="file" accept={FileType === "video"? "video/*": "image/*"}
            onChange={handleFileChange}
            />
            {uploading && (
                <span>Loading...</span>
            )}
            
        </>
    );
};

export default UploadExample;