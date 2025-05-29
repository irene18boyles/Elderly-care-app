import { v2 as cloudinary } from 'cloudinary'; // cloudinary library
import { CloudinaryStorage } from 'multer-storage-cloudinary'; // cloudinary storage
import multer from 'multer'; // multer for handling multipart/form-data
import dotenv from 'dotenv'; // for environment variables

dotenv.config(); // load environment variables from .env


///////////////////////////
// cloudinary configuration
///////////////////////////

cloudinary.config({ // config for cloudinary
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


/////////////////////////////
// storage set up 
// what folder name, extension
/////////////////////////////

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    const ext = file.mimetype.split('/')[1]; // extract file extension images/jpeg => jpeg

    //file extension
    const imageFormats = ['jpg', 'jpeg', 'png', 'gif'];
    const docFormats = ['pdf', 'docx', 'pptx'];

    const baseName = file.originalname ? file.originalname.replace(/\.[^/.]+$/, "") : 'file'; // for public id
    req.originalFileName = file.originalname;

    if(imageFormats.includes(ext)) {
        return {
            folder: 'images',
            allowed_formats: imageFormats,
            resource_type: 'image',
            public_id: baseName, // set filename
            use_filename: true, // tells cloudinary to use your public_id
            unique_filename: false, // disables random suffixes
            transformation: [{width: 500, height: 500, crop: 'limit' }]
        }
    } else if(docFormats.includes(ext)){
        return {
            folder: 'documents', // folder name in cloudinary
            allowed_formats: docFormats,
            resource_type: 'raw', // automatic detects the file type.
            format: ext,
            public_id: baseName, // set filename
            use_filename: true, // tells cloudinary to use your public_id
            unique_filename: false, // disables random suffixes
        } 
    } else {
            throw new Error('Unsupported file format');

    }
  }
});

const upload = multer({ storage }); // multer middleware for handling multipart/form-data

export default upload;
