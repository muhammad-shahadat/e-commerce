import express from 'express'

import { handleCreateOrder } from '../controllers/orderController.js'

const router = express.Router()

router.post('/', handleCreateOrder)

export default router
