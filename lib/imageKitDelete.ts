import imagekit from './imagekit.server';

export async function deleteFileFromImageKit(fileId: string): Promise<boolean> {
  try {
    await imagekit.deleteFile(fileId);
    return true;
  } catch (err) {
    console.error('ImageKit delete failed', err);
    return false;
  }
}
