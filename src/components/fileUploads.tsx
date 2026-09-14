'use client';

import { upload } from '@imagekit/next';
import { useState } from 'react';

interface FileUploadProps {
  onSuccess: (res: any) => void;
  onProgress?: (progress: number) => void;
  FileType: 'image' | 'video';
  visibility: 'public' | 'private';
}

const UploadExample = ({
  onSuccess,
  onProgress,
  FileType,
  visibility,
}: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  const fileValidation = (file: File) => {
    setError(null);

    if (FileType === 'video' && !file.type.startsWith('video/')) {
      setError('Please upload a valid video file');
      return false;
    }

    if (FileType === 'image' && !file.type.startsWith('image/')) {
      setError('Please upload a valid image file');
      return false;
    }

    if (file.size > 100 * 1024 * 1024) {
      setError('File size must be less than 100MB');
      return false;
    }

    return true;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !fileValidation(file)) return;

    setUploading(true);
    setError(null);

    try {
     const validPath =
  visibility === 'public'
    ? '/api/auth/imageKit/public'
    : '/api/auth/imageKit/private';

const authRes = await fetch(validPath);
if (!authRes.ok) throw new Error('Auth request failed');

const auth = await authRes.json();

const res = await upload({
  file,
  fileName: file.name,
  publicKey: auth.publicKey,
  token: auth.token,
  signature: auth.signature,
  expire: auth.expire,
} as any);

      onSuccess(res);
    } catch (err: any) {
      console.error('Upload Failed:', err);
      setError(err?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept={FileType === 'video' ? 'video/*' : 'image/*'}
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 cursor-pointer"
      />

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

      {uploading && (
        <div className="space-y-1 mt-2">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="text-green-400 text-xs">{progress}%</span>
        </div>
      )}
    </div>
  );
};

export default UploadExample;