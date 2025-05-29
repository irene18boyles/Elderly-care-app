// // config/multer.js (or wherever you like)
// import multer from 'multer'; // Ffor file uploads
// import path from 'path';  // for managing file/directory
// import { fileURLToPath } from 'url'; // to get the actual path of the file
// import { dirname } from 'path'; // to get the directory name

// //  
// const __filename = fileURLToPath(import.meta.url); // full path
// const __dirname = dirname(__filename); // foldr path

// // multer srtorage configuration local storage
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
//   filename: (req, file, cb) =>
//     cb(null, Date.now() + '-' + file.originalname),
// });

// const upload = multer({ storage });

// export default upload;
