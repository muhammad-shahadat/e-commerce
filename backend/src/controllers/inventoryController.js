import pool from '../../config/db.js'
import { successResponse } from '../controllers/responseController.js'

// ======================================================
// GET /api/admin/inventory/low-stock
// Query Params: ?page=1&limit=10&threshold=5&search=
// ======================================================
export const handleGetLowStockProducts = async (req, res, next) => {
  try {
    // ── ১. Query params parse & sanitize ──────────────────
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10))
    const threshold = Math.max(0, parseInt(req.query.threshold) || 5)
    const search = req.query.search?.trim() || ''
    const offset = (page - 1) * limit

    // ── ২. Dynamic search condition ───────────────────────
    const searchCondition = search
      ? `AND (p.title ILIKE $4 OR pv.sku ILIKE $4 OR p.sku ILIKE $4)`
      : ''
    const searchParam = search ? `%${search}%` : null

    // সার্চ কন্ডিশন অনুযায়ী প্যারামিটার সংখ্যা ব্যালেন্স করা হলো
    const queryParams = search
      ? [threshold, limit, offset, searchParam]
      : [threshold, limit, offset]

    // ── ৩. Main data query (Fixed Image Duplication Bug via Subquery) ──
    const { rows: products } = await pool.query(
      `
      SELECT
        -- Product info
        p.id                  AS product_id,
        p.title               AS product_title,
        p.sku                 AS product_sku,
        p.base_price,
        p.discount_percent,
        p.is_active,

        -- Category
        c.name                AS category_name,

        -- Variant info
        pv.id                 AS variant_id,
        pv.sku                AS variant_sku,
        pv.price_modifier,

        -- Stock
        i.quantity,

        -- Variant options (size, color etc.) as JSON array
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'option_name',  vo.option_name,
              'option_value', vo.option_value
            )
          ) FILTER (WHERE vo.id IS NOT NULL),
          '[]'
        ) AS variant_options,

        -- Main image (Subquery prevents JSON_AGG from duplicating data)
        (
          SELECT img.image_url 
          FROM product_images img 
          WHERE img.product_id = p.id AND img.is_main = TRUE 
          LIMIT 1
        ) AS main_image_url
        
      FROM inventory i

      JOIN product_variants pv
        ON pv.id = i.product_variant_id

      JOIN products p
        ON p.id = pv.product_id

      LEFT JOIN categories c
        ON c.id = p.category_id

      LEFT JOIN variant_options vo
        ON vo.product_variant_id = pv.id

      WHERE i.quantity <= $1
        ${searchCondition}

      GROUP BY
        p.id, p.title, p.sku, p.base_price, p.discount_percent, p.is_active,
        c.name,
        pv.id, pv.sku, pv.price_modifier,
        i.quantity

      ORDER BY i.quantity ASC, p.title ASC
      LIMIT $2 OFFSET $3
      `,
      queryParams,
    )

    // ── ৪. Total count query (Fixed Dynamically for Search) ─
    const countParams = search ? [threshold, searchParam] : [threshold]
    const { rows: countResult } = await pool.query(
      `
      SELECT COUNT(DISTINCT i.product_variant_id) AS total
      FROM inventory i
      JOIN product_variants pv ON pv.id = i.product_variant_id
      JOIN products p          ON p.id  = pv.product_id
      WHERE i.quantity <= $1
        ${search ? 'AND (p.title ILIKE $2 OR pv.sku ILIKE $2 OR p.sku ILIKE $2)' : ''}
      `,
      countParams,
    )

    // ── ৫. Pagination meta calculation ───────────────────
    const total = Number(countResult[0].total)
    const totalPages = Math.ceil(total / limit)
    const hasNext = page < totalPages
    const hasPrevious = page > 1

    // ── ৬. Response ──────────────────────────────────────
    return successResponse(res, {
      statusCode: 200,
      message: 'Low stock products fetched successfully',
      payload: {
        products,
        pagination: {
          total,
          totalPages,
          currentPage: page,
          limit,
          hasNext,
          hasPrevious,
          ...(hasNext && { nextPage: page + 1 }),
          ...(hasPrevious && { previousPage: page - 1 }),
        },
        filters: {
          threshold,
          search: search || null,
        },
      },
    })
  } catch (error) {
    next(error)
  }
}
