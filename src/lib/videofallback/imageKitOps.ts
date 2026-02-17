import { getImageKit } from '@/lib/videofallback/imagekit.server';

export async function deleteFileFromImageKit(fileId: string): Promise<boolean> {
  try {
    const imagekit = getImageKit();
    await imagekit.deleteFile(fileId);
    return true;
  } catch (err) {
    console.error('ImageKit delete failed', err);
    return false;
  }
}

export async function getImageKitFileOwner(
  fileId: string,
): Promise<string | null> {
  try {
    const imagekit = getImageKit();
    const file = await imagekit.getFileDetails(fileId);
    const owner = file?.customMetadata?.owner;

    if (typeof owner === 'string') {
      return owner;
    }
    return null;
  } catch (err) {
    console.error('Failed to fetch ImageKit file details', err);
    return null;
  }
}
