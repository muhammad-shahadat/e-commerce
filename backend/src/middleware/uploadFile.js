import createHttpError from "http-errors";
import multer from "multer";
import path from "path";

import { MAX_FILE_SIZE, ALLOWED_IMAGE_FILE_TYPES } from "../../config/fileFilterConfig.js";


// Multer Storage Configuration (For Cloudinary)
// [CHANGE: instead diskStorage use memoryStorage]

const storage = multer.memoryStorage();


const imageFileFilter = (req, file, cb) =>{
    const fileExtname = path.extname(file.originalname).toLowerCase().substring(1);

    if(!ALLOWED_IMAGE_FILE_TYPES.includes(fileExtname)){
        return cb(createHttpError(400, `Only ${ALLOWED_IMAGE_FILE_TYPES.join(', ')} files are allowed`));
    }

    // MIME type check (extra security)
    if (!file.mimetype.startsWith('image/')) {
        return cb(createHttpError(400, "Invalid image file – MIME type not allowed"));
    }

    cb(null, true);

}



const imageUpload = multer({
    storage: storage,
    limits: {
        fileSize: MAX_FILE_SIZE,
    },
    fileFilter: imageFileFilter,

});



export default imageUpload;