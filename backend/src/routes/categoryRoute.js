import express from 'express';

import { handleGetCategories } from '../controllers/categoryController.js';


const router = express.Router();


router.get('/',
    handleGetCategories,
)



export default router;