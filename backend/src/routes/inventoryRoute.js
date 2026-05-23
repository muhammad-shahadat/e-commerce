import express from 'express'
import { handleGetLowStockProducts } from '../controllers/inventoryController.js'

const router = express.Router()

//GET /api/admin/inventory/low-stock
router.get('/low-stock', handleGetLowStockProducts)

export default router
