import createHttpError from "http-errors";

import cloudinary from "../../config/cloudinary.js";




/**
 * upload image in Cloudinary
 * use buffer come from multer memory storage
 * @param {object} file - in Multer, req.file is an object that contain (file.buffer and file.mimetype )
 * @returns {object} - Cloudinary upload result (secure_url, public_id)
 */



//this is fast as compared data uri base 64. 
export const cloudinaryFileUpload = async (file) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: process.env.CLOUDINARY_FOLDER_NAME || "ecommerce-assets",
        resource_type: "auto",
        access_mode: "public",
        
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error);
          reject(createHttpError(400, "Failed to upload file to Cloudinary"));
        } else {
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
          });
        }
      }
    );

    // Buffer direct stream
    uploadStream.end(file.buffer);
  });
};


/**
 * delete image from Cloudinary
 * @param {string} publicId - public_id from cloudinary
 * @returns {object} - Cloudinary delete results
 */

export const cloudinaryFileDelete = async (publicId) => {
    
    if (!publicId) {
        throw createHttpError(400, "Public ID is required for deletion.");
    }

    try {

        const result = await cloudinary.uploader.destroy(publicId);
        console.info(`Successfully deleted old file from cloudinary ID: ${publicId}`)

        return result;
        
    } catch (error) {
        console.error("Cloudinary Delete Error:", error)
        throw createHttpError(400, "Failed to delete file from Cloudinary.");
        
    }

};


