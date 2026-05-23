import express from 'express'
import {
  handleGetDashboardStats,
  handleGetDashboardCharts,
} from '../controllers/dashboardController.js'

const router = express.Router()

// GET /api/admin/dashboard/stats
router.get('/stats', handleGetDashboardStats)

// GET /api/admin/dashboard/charts
router.get('/charts', handleGetDashboardCharts)

export default router
