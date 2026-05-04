import express from 'express'

import {
  handleCreateCategory,
  handleGetCategories,
} from '../controllers/categoryController.js'

const router = express.Router()

router.get('/', handleGetCategories)
router.post('/', handleCreateCategory)

export default router
