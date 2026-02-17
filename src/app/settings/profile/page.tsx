'use client';

import UploadExample from '@/components/fileUploads';
import { useNotification } from '@/components/providers/notification';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/Api-client/api-client';
import { UploadedFile } from '@/types/file';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function ProfileChanges() {
  const { data: session } = useSession();
  const { showNotification } = useNotification();

  const [username, setUsername] = useState('');
  const [usernameLoading, setUsernameLoading] = useState(false);

  const [profilePhoto, setProfilePhoto] = useState<UploadedFile | null>(null);
  const [photoLoading, setPhotoLoading] = useState(false);

  // hydrate username once
  useEffect(() => {
    if (session?.user?.name) {
      setUsername(session.user.name);
    }
  }, [session]);

  async function updateUsername() {
    try {
      setUsernameLoading(true);

      const res = await apiClient.changeFields({ username });
      showNotification(res.message, 'success');
    } catch (err: any) {
      showNotification(
        err?.response?.data?.error || 'Failed to update username',
        'error',
      );
    } finally {
      setUsernameLoading(false);
    }
  }

  async function updateProfilePhoto() {
    if (!profilePhoto) return;

    try {
      setPhotoLoading(true);

      const res = await apiClient.changeFields({
        profilePhoto: {
          url: profilePhoto.url,
          fileId: profilePhoto.fileId,
        },
      });

      showNotification(res.message, 'success');
      setProfilePhoto(null);
    } catch (err: any) {
      showNotification(
        err?.response?.data?.error || 'Failed to update profile photo',
        'error',
      );
    } finally {
      setPhotoLoading(false);
    }
  }

  return (
    <div className="space-y-10">
      {/* Username */}
      <section className="space-y-3">
        <h2 className="font-medium">Username</h2>
        <input
          className="border px-3 py-2 rounded w-full"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Button
          onClick={updateUsername}
          disabled={usernameLoading || !username.trim()}
        >
          Save Username
        </Button>
      </section>

      {/* Profile Photo */}
      <section className="space-y-3">
        <h2 className="font-medium">Profile Photo</h2>

        <div className="flex items-center gap-4">
          {session?.user?.image && !profilePhoto && (
            <Avatar className="h-16 w-15">
              <AvatarImage src={session.user?.image ?? ''} />
              <AvatarFallback>{session.user.name?.[0] ?? 'U'}</AvatarFallback>
            </Avatar>
          )}

          {}

          {profilePhoto && (
            <Avatar className="h-16 w-15">
              <AvatarImage src={session?.user?.image ?? ''} />
              <AvatarFallback>{session?.user.name?.[0] ?? 'U'}</AvatarFallback>
            </Avatar>
          )}
        </div>

        <UploadExample
          FileType="image"
          visibility="public"
          onSuccess={(res) => setProfilePhoto(res)}
        />

        <Button
          onClick={updateProfilePhoto}
          disabled={photoLoading || !profilePhoto}
        >
          Update Photo
        </Button>
      </section>
    </div>
  );
}
