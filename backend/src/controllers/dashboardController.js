import pool from '../../config/db.js'
import { successResponse } from '../controllers/responseController.js'

// ======================================================
// GET /api/admin/dashboard/stats
// ======================================================
export const handleGetDashboardStats = async (req, res, next) => {
  try {
    const [
      revenueResult,
      totalOrdersResult,
      totalProductsResult,
      totalCategoriesResult,
      pendingOrdersResult,
      completedOrdersResult,
      lowStockProductsResult,
    ] = await Promise.all([
      // Total Revenue from paid and completed orders
      pool.query(
        `
        SELECT COALESCE(SUM(total), 0) AS total_revenue
        FROM orders
        WHERE status IN ('paid', 'completed')
        `,
      ),

      // Total Orders
      pool.query(
        `
        SELECT COUNT(*) AS total_orders
        FROM orders
        `,
      ),

      // Total Products
      pool.query(
        `
        SELECT COUNT(*) AS total_products
        FROM products
        `,
      ),

      // Total Categories
      pool.query(
        `
        SELECT COUNT(*) AS total_categories
        FROM categories
        `,
      ),

      // Pending Orders
      pool.query(
        `
        SELECT COUNT(*) AS pending_orders
        FROM orders
        WHERE status = 'pending'
        `,
      ),

      // Completed Orders
      pool.query(
        `
        SELECT COUNT(*) AS completed_orders
        FROM orders
        WHERE status = 'completed'
        `,
      ),

      // Low Stock Items (Fixing the i.id bug by using product_variant_id)
      pool.query(
        `
        SELECT COUNT(product_variant_id) AS low_stock_items
        FROM inventory
        WHERE quantity <= 5
        `,
      ),
    ])

    return successResponse(res, {
      statusCode: 200,
      message: 'Dashboard statistics fetched successfully',
      payload: {
        totalRevenue: Number(revenueResult.rows[0].total_revenue),
        totalOrders: Number(totalOrdersResult.rows[0].total_orders),
        totalProducts: Number(totalProductsResult.rows[0].total_products),
        totalCategories: Number(totalCategoriesResult.rows[0].total_categories),
        pendingOrders: Number(pendingOrdersResult.rows[0].pending_orders),
        completedOrders: Number(completedOrdersResult.rows[0].completed_orders),
        lowStockProducts: Number(
          lowStockProductsResult.rows[0].low_stock_items, // Updated flag name to match
        ),
      },
    })
  } catch (error) {
    next(error)
  }
}

// ======================================================
// GET /api/admin/dashboard/charts
// ======================================================
export const handleGetDashboardCharts = async (req, res, next) => {
  try {
    const [
      salesTrendResult,
      orderStatusDistributionResult,
      topSellingProductsResult,
      categoryDistributionResult,
    ] = await Promise.all([
      // -----------------------------------------------------------------
      // Sales Trend: Last 7 Days (Fixed Syntax, Index-friendly & Timezone-aware)
      // -----------------------------------------------------------------
      pool.query(
        `
        SELECT
          TO_CHAR(d.day, 'YYYY-MM-DD') AS date,
          COALESCE(SUM(o.total), 0) AS total_sales,
          COUNT(o.id) AS total_orders
        FROM generate_series(
          (CURRENT_DATE AT TIME ZONE 'Asia/Dhaka') - INTERVAL '6 days',
          (CURRENT_DATE AT TIME ZONE 'Asia/Dhaka'),
          INTERVAL '1 day'
        ) AS d(day)
        LEFT JOIN orders o
          ON o.created_at >= d.day
         AND o.created_at < d.day + INTERVAL '1 day'
         AND o.status IN ('paid', 'completed')
        GROUP BY d.day
        ORDER BY d.day ASC
        `,
      ),

      // -----------------------------------------------------------------
      // Order Status Distribution (Perfect)
      // -----------------------------------------------------------------
      pool.query(
        `
        SELECT
          status,
          COUNT(*) AS total_orders
        FROM orders
        GROUP BY status
        ORDER BY status ASC
        `,
      ),

      // -----------------------------------------------------------------
      // Top Selling Products (Using order_items for real-time sales trend)
      // -----------------------------------------------------------------
      pool.query(
        `
        SELECT
          p.id,
          p.title,
          p.slug,
          SUM(oi.quantity)::int AS sold_count,
          (
            SELECT pi.image_url
            FROM product_images pi
            WHERE pi.product_id = p.id
              AND pi.is_main = TRUE
            LIMIT 1
          ) AS main_image
        FROM order_items oi
        JOIN products p ON p.id = oi.product_id
        JOIN orders o ON o.id = oi.order_id
        WHERE o.status IN ('paid', 'completed')
        GROUP BY p.id
        ORDER BY sold_count DESC
        LIMIT 5
        `,
      ),

      // -----------------------------------------------------------------
      // Products per Category (Perfect & Standard Grouping)
      // -----------------------------------------------------------------
      pool.query(
        `
        SELECT
          c.name AS category_name,
          COUNT(p.id) AS total_products
        FROM categories c
        LEFT JOIN products p
          ON p.category_id = c.id
        GROUP BY c.id, c.name
        HAVING COUNT(p.id) > 0
        ORDER BY total_products DESC
        LIMIT 10
        `,
      ),
    ])

    return successResponse(res, {
      statusCode: 200,
      message: 'Dashboard chart data fetched successfully',
      payload: {
        salesTrend: salesTrendResult.rows.map((row) => ({
          date: row.date,
          totalSales: Number(row.total_sales),
          totalOrders: Number(row.total_orders),
        })),

        orderStatusDistribution: orderStatusDistributionResult.rows.map(
          (row) => ({
            status: row.status,
            totalOrders: Number(row.total_orders),
          }),
        ),

        topSellingProducts: topSellingProductsResult.rows.map((row) => ({
          ...row,
          sold_count: Number(row.sold_count),
        })),

        categoryDistribution: categoryDistributionResult.rows.map((row) => ({
          categoryName: row.category_name,
          totalProducts: Number(row.total_products),
        })),
      },
    })
  } catch (error) {
    next(error)
  }
}
