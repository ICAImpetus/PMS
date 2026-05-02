import multer from "multer";
import fs from "fs";
import path from "path";
import cloudinary from "./cloudinary.js";

export let CLOUDINARY = null;
const upload = multer({
  storage: multer.memoryStorage(), //  important
  limits: { fileSize: 5 * 1024 * 1024 },
});



export const uploadDoctorAssets = (req, res, next) => {
  upload.fields([
    { name: "csv", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ])(req, res, async function (err) {
    try {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            message: "File too large. Max 5MB allowed",
          });
        }

        return res.status(400).json({
          success: false,
          message: err.message || "Upload error",
        });
      }

      // 🔹 Handle CSV (save locally)
      console.log("req.files", req.files);

      if (req.files?.csv?.[0]) {
        const csvFile = req.files.csv[0];

        const filePath = path.join(
          "uploads",
          `${Date.now()}-${csvFile.originalname}`
        );

        fs.writeFileSync(filePath, csvFile.buffer);

        req.csvFilePath = filePath; //  pass to controller
      }

      // 🔹 Handle Image (upload to cloudinary)
      if (req.files?.image?.[0]) {
        const imageFile = req.files.image[0];

        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                folder: "doctor-images",
                resource_type: "image",
              },
              (error, result) => {
                if (error) return reject(error);
                resolve(result);
              }
            )
            .end(imageFile.buffer);
        });


        req.imageUrl = result.secure_url;
        req.publicId = result.public_id;

      }

      next();

    } catch (error) {
      console.error("Upload Error:", error);

      return res.status(500).json({
        success: false,
        message: "File processing failed",
      });
    }
  });
};