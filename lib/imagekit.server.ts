import ImageKit from 'imagekit';

let imagekitInstance: ImageKit | null = null;

export function getImageKit() {
  if (!imagekitInstance) {
    const privateKey = process.env.IMAGE_PRIVATE_KEY;
    const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_KEY;
    const urlEndpoint = process.env.NEXT_PUBLIC_URL_ENDPOINT;

    if (!privateKey || !publicKey || !urlEndpoint) {
      throw new Error('ImageKit environment variables are not configured');
    }

    imagekitInstance = new ImageKit({
      publicKey,
      privateKey,
      urlEndpoint,
    });
  }

  return imagekitInstance;
}
