// import { v2 as cloudinary } from "cloudinary";
// import fs from "fs"

// const uploadOnCloudinary =async(file) => {
//   cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key:process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET,
//   });

//   try {

//     const result=await cloudinary.uploader.upload(file)
//      fs.unlinkSync(file)
//      return result.secure_url
//   } catch (error) {
//     fs.unlinkSync(file)
//     console.log(error)
//   }
// };


// export default uploadOnCloudinary



import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const result = await cloudinary.uploader.upload(localFilePath, {
      folder: "properties",
    });

    // cleanup local file
    fs.unlinkSync(localFilePath);

    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload failed:", error);

    // cleanup only if file exists
    if (localFilePath && fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return null;
  }
};

export default uploadOnCloudinary;