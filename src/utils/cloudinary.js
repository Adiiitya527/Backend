import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const absolutePath = path.resolve(localFilePath);

    console.log("Uploading to Cloudinary:", absolutePath);

    const response = await cloudinary.uploader.upload(absolutePath, {
      resource_type: "image",
      folder: "avatars",
    });

    fs.unlinkSync(absolutePath);
    return response;

  } catch (error) {
    console.error("❌ CLOUDINARY REAL ERROR ↓↓↓");
    console.error(error);

    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    return null;
  }
};

export { uploadOnCloudinary };
