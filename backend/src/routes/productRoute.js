import express from "express";
import { handleCreateProduct } from "../controllers/productController.js";
import imageUpload from "../middleware/uploadFile.js";


const router = express.Router();

/* imageUpload.fields([]) works as follow
req.files = {
    mainImage: [
        { 
            fieldname: 'mainImage',
            originalname: 'my-cover.jpg',
            buffer: <Buffer ...>,
            size: 50000
        }
    ],
    subImages: [ 
        { originalname: 'img1.jpg', buffer: <Buffer ...>, ... },
        { originalname: 'img2.jpg', buffer: <Buffer ...>, ... }
    ]
}
*/
router.post("/",
    imageUpload.fields([
        {name: "mainImage", maxCount: 1},
        {name: "subImages", maxCount: 4},
    ]),
    handleCreateProduct
)




export default router;
