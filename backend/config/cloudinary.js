import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("Cloudinary config:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET ? "exists" : "MISSING"
});

const postStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "socialapp/posts",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "socialapp/profiles",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

export const uploadPostImage = multer({ storage: postStorage });
export const uploadProfileImage = multer({ storage: profileStorage });