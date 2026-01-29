'use client';
import UploadExample from '@/components/fileUploads';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import useEditVideo from '@/hooks/video/editVideo';
import Image from 'next/image';

export default function ChangeVideoFields({ videoId }: { videoId: string }) {
  const {
    description,
    errors,
    handleSubmit,
    loading,
    setDescription,
    setErrors,
    setThumbnail,
    setTitle,
    thumbnail,
    title,
  } = useEditVideo({ videoId });

  return (
    <div className="max-w-xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Edit Video</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
                placeholder="Enter video title"
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                placeholder="Enter description"
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
            </div>

            {/* Thumbnail */}
            <div className="space-y-2">
              <Label>Thumbnail</Label>

              {thumbnail?.url && (
                <Image
                  src={thumbnail.url}
                  alt="Thumbnail"
                  width={128}
                  height={128}
                  className="rounded-md object-cover border"
                />
              )}

              <UploadExample
                FileType="image"
                visibility="public"
                onSuccess={(res) => {
                  setThumbnail({ url: res.url, fileId: res.fileId });
                  setErrors((p) => ({ ...p, thumbnail: undefined }));
                }}
              />

              {errors.thumbnail && (
                <p className="text-sm text-destructive">{errors.thumbnail}</p>
              )}
            </div>

            {/* Form error */}
            {errors._form && (
              <p className="text-sm text-destructive">{errors._form}</p>
            )}

            {/* Submit */}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Updating…' : 'Update Video'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
