import { v2 as cloudinary } from "cloudinary";
import { env } from "./env";

const isConfigured =
  !!env.CLOUDINARY_CLOUD_NAME &&
  !!env.CLOUDINARY_API_KEY &&
  !!env.CLOUDINARY_API_SECRET;

if (isConfigured) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
}

export { cloudinary, isConfigured };

export async function uploadImage(
  buffer: Buffer,
  folder: string,
): Promise<{ url: string; publicId: string }> {
  if (!isConfigured) {
    throw new Error("Cloudinary no está configurado");
  }

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          resource_type: "image",
          transformation: [
            { width: 1600, crop: "limit", quality: "auto", fetch_format: "auto" },
          ],
        },
        (err, result) => {
          if (err || !result) return reject(err ?? new Error("Upload failed"));
          resolve({ url: result.secure_url, publicId: result.public_id });
        },
      )
      .end(buffer);
  });
}

export async function deleteImage(publicId: string): Promise<void> {
  if (!isConfigured) return;
  await cloudinary.uploader.destroy(publicId);
}
