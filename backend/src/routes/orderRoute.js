import express from 'express'

import {
  handleCreateOrder,
  handleGetOrder,
  handleGetOrders,
  handleUpdateOrder,
} from '../controllers/orderController.js'

const router = express.Router()

router.post('/', handleCreateOrder)
router.get('/', handleGetOrders)
router.get('/:id', handleGetOrder) //id -> order_id
router.patch('/:id', handleUpdateOrder) //id -> order_id

export default router
