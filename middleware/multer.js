// import multer from "multer"


// const storage=multer.diskStorage({
//     destination:(req,file,cb)=>{
//           cb(null,"./public")         
//     },
//     filename:(req,file,cb)=>{
//         cb(null,file.originalname)
//     }
// })

// export const upload=multer({storage})



import multer from "multer";
import path from "path";

// Configure disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public"); // ensure this folder exists
  },
  filename: (req, file, cb) => {
    // prepend timestamp to avoid collisions
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

// File filter (optional, restrict to images)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
};

export const upload = multer({ storage, fileFilter });