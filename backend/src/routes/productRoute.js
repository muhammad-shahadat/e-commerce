import express from 'express'
import {
  handleCreateProduct,
  handleDeleteProduct,
  handleGetProduct,
  handleGetProducts,
  handleGetRelatedProducts,
  handleUpdateProduct,
  handleUpdateProductBasicInfo,
} from '../controllers/productController.js'
import imageUpload from '../middleware/uploadFile.js'

const router = express.Router()

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

// CREATE product → POST /api/products
router.post(
  '/',
  imageUpload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'subImages', maxCount: 3 },
  ]),
  handleCreateProduct,
)

// GET all products → GET /api/products
// SEARCH products → GET /api/products?search=iphone
// (no separate route or controller needed)
router.get('/', handleGetProducts)

// GET single product + view count update (fire & forget) → GET /api/products/:slug
router.get('/:slug', handleGetProduct)

router.get('/related/:categoryId', handleGetRelatedProducts)

// DELETE product → DELETE /api/products/:id
router.delete('/:id', handleDeleteProduct)

// UPDATE product → PUT /api/products/:id
router.put(
  '/:id',
  imageUpload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'subImages', maxCount: 3 },
  ]),
  handleUpdateProduct,
)

router.patch('/:slug/basic-info', handleUpdateProductBasicInfo)

export default router
