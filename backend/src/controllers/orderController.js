import createHttpError from 'http-errors'

import pool from '../../config/db.js'
import { successResponse } from './responseController.js'

export const handleCreateOrder = async (req, res, next) => {
  // ১. ট্রানজেকশনের জন্য কানেকশন পুল থেকে ক্লায়েন্ট নেওয়া
  const client = await pool.connect()

  try {
    const {
      customer_name,
      customer_email,
      customer_phone,
      shipping_address_line1,
      shipping_address_line2,
      shipping_city,
      shipping_state,
      shipping_postal_code,
      shipping_country,
      payment_method,
      total,
      shipping_charge,
      items, // array of products: [{product_id, variant_id, price, quantity}]
    } = req.body

    // ২. ভ্যালিডেশন
    if (
      !customer_name ||
      !customer_email ||
      !customer_phone ||
      !shipping_address_line1 ||
      !shipping_city ||
      !items ||
      items.length === 0
    ) {
      throw createHttpError(
        400,
        'Customer details and order items are required',
      )
    }

    // ৩. ট্রানজেকশন শুরু
    await client.query('BEGIN')

    // ৪. ORDERS টেবিলে মূল অর্ডারটি সেভ করা
    const orderQuery = `
        INSERT INTO orders (
            customer_name, customer_email, customer_phone, 
            shipping_address_line1, shipping_address_line2, 
            shipping_city, shipping_state, shipping_postal_code, 
            shipping_country, payment_method, total, shipping_charge
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
        RETURNING id, customer_name, customer_email,
        customer_phone, payment_method, total, created_at
    `

    const orderValues = [
      customer_name,
      customer_email,
      customer_phone,
      shipping_address_line1,
      shipping_address_line2,
      shipping_city,
      shipping_state,
      shipping_postal_code,
      shipping_country,
      payment_method,
      total,
      shipping_charge,
    ]

    const orderResult = await client.query(orderQuery, orderValues)
    const orderId = orderResult.rows[0].id

    // ৫. Promise.all ব্যবহার করে ORDER_ITEMS ইনসার্ট করা (প্যারালাল এক্সিকিউশন)
    const itemQuery = `
        INSERT INTO order_items (
            order_id, product_id, product_variant_id, price, quantity
        ) 
        VALUES ($1, $2, $3, $4, $5)
    `

    // items ম্যাপ করে একগুচ্ছ প্রমিজ তৈরি করা এবং Promise.all দিয়ে একবারে রান করা
    await Promise.all(
      items.map((item) => {
        const itemValues = [
          orderId,
          item.product_id,
          item.product_variant_id || null,
          item.price,
          item.quantity,
        ]
        return client.query(itemQuery, itemValues)
      }),
    )

    // ৬. সব সফল হলে COMMIT করা
    await client.query('COMMIT')

    const fullOrderQuery = `
        SELECT 
            oi.id as item_id,
            p.id as product_id,
            p.title as product_name,
            pv.sku as final_sku,
            COALESCE(
              (
                SELECT json_agg(
                json_build_object(
                    'option_name', vo.option_name,
                    'option_value', vo.option_value
                )
                ORDER BY vo.option_name ASC
                )
                FROM variant_options vo
                WHERE vo.product_variant_id = pv.id
              ),
              '[]'::json
            ) AS variant_options,
            oi.price,
            oi.quantity,
            (oi.price * oi.quantity) as subtotal
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        LEFT JOIN product_variants pv ON oi.product_variant_id = pv.id
        WHERE oi.order_id = $1
    `

    // --- এখান থেকে ডাটা তুলে আনা ---
    const fullOrderItems = await client.query(fullOrderQuery, [orderId])

    // --- [ঐচ্ছিক] এখানে Nodemailer কল করবেন ---
    // await sendOrderEmail(customer_email, orderResult.rows[0], fullOrderItems.rows);

    // ৭. সাকসেস রেসপন্স
    successResponse(res, {
      statusCode: 201,
      message: 'Order placed successfully',
      payload: {
        order: orderResult.rows[0], // Main order info (Total, Address)
        items: fullOrderItems.rows, // All products with SKU and Names
      },
    })
  } catch (error) {
    // ৮. কোনো ভুল হলে ROLLBACK করে সব অপারেশন বাতিল করা
    if (client) await client.query('ROLLBACK')

    // DB Constraint এরর হ্যান্ডেলিং
    if (error.code === '23514') {
      return next(
        createHttpError(
          400,
          'Validation Error: Check product quantities or payment method.',
        ),
      )
    }

    next(error)
  } finally {
    // ৯. কানেকশন রিলিজ করা (ম্যান্ডেটরি)
    client.release()
  }
}

export const handleGetOrders = async (req, res, next) => {
  try {
    // =========================
    // Query Parameters
    // =========================
    const page = Math.max(Number(req.query.page) || 1, 1)
    const limit = Math.max(Number(req.query.limit) || 10, 1)
    const offset = (page - 1) * limit

    const status = req.query.status?.trim() || ''
    const paymentMethod = req.query.payment_method?.trim() || ''
    const search = req.query.search?.trim() || ''

    // sort=new        -> newest first
    // sort=old        -> oldest first
    // default         -> newest first
    const sort = req.query.sort?.trim() || 'new'

    // =========================
    // Dynamic WHERE Clause
    // =========================
    const whereConditions = []
    const queryParams = []
    let paramIndex = 1

    // Filter by status
    if (status) {
      whereConditions.push(`o.status = $${paramIndex}`)
      queryParams.push(status)
      paramIndex++
    }

    // Filter by payment method
    if (paymentMethod) {
      whereConditions.push(`o.payment_method = $${paramIndex}`)
      queryParams.push(paymentMethod)
      paramIndex++
    }

    // Search by:
    // - customer_name
    // - customer_email
    // - customer_phone
    // - order id (UUID as text)
    if (search) {
      whereConditions.push(`
        (
          o.customer_name ILIKE $${paramIndex}
          OR o.customer_email ILIKE $${paramIndex}
          OR o.customer_phone ILIKE $${paramIndex}
          OR CAST(o.id AS TEXT) ILIKE $${paramIndex}
        )
      `)
      queryParams.push(`%${search}%`)
      paramIndex++
    }

    const whereClause =
      whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''

    // =========================
    // Sorting
    // =========================
    const orderByClause =
      sort === 'old'
        ? 'ORDER BY o.created_at ASC'
        : 'ORDER BY o.created_at DESC'

    // =========================
    // Total Orders Count
    // =========================
    const countQuery = `
      SELECT COUNT(*)::INTEGER AS total_orders
      FROM orders o
      ${whereClause}
    `

    const countResult = await pool.query(countQuery, queryParams)

    const totalOrders = countResult.rows[0].total_orders
    const totalPages = Math.ceil(totalOrders / limit)

    // যদি requested page totalPages এর বেশি হয়
    if (totalPages > 0 && page > totalPages) {
      throw createHttpError(
        404,
        `Page ${page} not found. Total pages: ${totalPages}`,
      )
    }

    // =========================
    // Main Query
    // =========================
    const ordersQuery = `
    SELECT
        o.id,
        o.customer_name,
        o.customer_email,
        o.customer_phone,
        o.status,
        o.payment_method,
        o.total,
        o.shipping_charge,
        o.created_at,

        -- Total distinct products (ভুল ছিল, ঠিক করলাম)
        (
        SELECT COUNT(DISTINCT oi.product_id)
        FROM order_items oi
        WHERE oi.order_id = o.id
        )::INTEGER AS total_items,

        -- Total quantity
        (
        SELECT COALESCE(SUM(oi.quantity), 0)
        FROM order_items oi
        WHERE oi.order_id = o.id
        )::INTEGER AS total_quantity,

        -- Main image of the first product in the order (Super Optimized)
        (
        SELECT pi.image_url
        FROM product_images pi
        WHERE pi.product_id = (
            SELECT oi.product_id 
            FROM order_items oi 
            WHERE oi.order_id = o.id 
            ORDER BY oi.id ASC 
            LIMIT 1
        )
        AND pi.is_main = TRUE
        LIMIT 1
        ) AS preview_image

    FROM orders o
    ${whereClause}
    ${orderByClause}
    LIMIT $${paramIndex}
    OFFSET $${paramIndex + 1}
    `

    const ordersParams = [...queryParams, limit, offset]

    const ordersResult = await pool.query(ordersQuery, ordersParams)

    // =========================
    // Success Response
    // =========================
    return successResponse(res, {
      statusCode: 200,
      message: 'Orders fetched successfully',
      payload: {
        pagination: {
          totalOrders,
          totalPages,
          currentPage: page,
          previousPage: page > 1 ? page - 1 : null,
          nextPage: page < totalPages ? page + 1 : null,
          limit,
        },

        filters: {
          status: status || null,
          payment_method: paymentMethod || null,
          search: search || null,
          sort,
        },

        orders: ordersResult.rows,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const handleGetOrder = async (req, res, next) => {
  try {
    const { id } = req.params // id-> order_id

    // =========================
    // 1. Get Main Order Information
    // =========================
    const orderQuery = `
      SELECT
        o.id,
        o.user_id,
        o.shipping_address_id,

        o.customer_name,
        o.customer_email,
        o.customer_phone,

        o.shipping_address_line1,
        o.shipping_address_line2,
        o.shipping_city,
        o.shipping_state,
        o.shipping_postal_code,
        o.shipping_country,

        o.status,
        o.payment_method,
        o.total,
        o.shipping_charge,
        o.created_at,
        o.updated_at,

        (
          SELECT COUNT(DISTINCT oi.product_id)
          FROM order_items oi
          WHERE oi.order_id = o.id
        )::INTEGER AS total_items,

        (
          SELECT COALESCE(SUM(oi.quantity), 0)
          FROM order_items oi
          WHERE oi.order_id = o.id
        )::INTEGER AS total_quantity

      FROM orders o
      WHERE o.id = $1
      LIMIT 1
    `

    const orderResult = await pool.query(orderQuery, [id])

    if (orderResult.rows.length === 0) {
      throw createHttpError(404, 'Order not found')
    }

    const order = orderResult.rows[0]

    // =========================
    // 2. Get All Order Items
    // =========================
    const itemsQuery = `
      SELECT
        oi.id AS item_id,
        oi.product_id,
        oi.product_variant_id,
        oi.price,
        oi.quantity,
        (oi.price * oi.quantity) AS subtotal,

        p.title AS product_title,
        p.slug AS product_slug,
        p.sku AS product_sku,

        pv.sku AS final_sku,
        pv.price_modifier,

        (
          SELECT pi.image_url
          FROM product_images pi
          WHERE pi.product_id = p.id
            AND pi.is_main = TRUE
          LIMIT 1
        ) AS main_image,

        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'option_name', vo.option_name,
                'option_value', vo.option_value
              )
              ORDER BY vo.option_name ASC
            )
            FROM variant_options vo
            WHERE vo.product_variant_id = pv.id
          ),
          '[]'::json
        ) AS variant_options

      FROM order_items oi
      JOIN products p
        ON oi.product_id = p.id
      LEFT JOIN product_variants pv
        ON oi.product_variant_id = pv.id

      WHERE oi.order_id = $1
      ORDER BY oi.id ASC
    `

    const itemsResult = await pool.query(itemsQuery, [id])

    // =========================
    // 3. Success Response
    // =========================
    return successResponse(res, {
      statusCode: 200,
      message: 'Order fetched successfully',
      payload: {
        order,
        items: itemsResult.rows,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const handleUpdateOrder = async (req, res, next) => {
  const client = await pool.connect()

  try {
    const { id } = req.params
    const { status } = req.body

    const allowedStatuses = [
      'pending',
      'paid',
      'shipped',
      'completed',
      'cancelled',
    ]

    if (!status) {
      throw createHttpError(400, 'Status is required')
    }

    if (!allowedStatuses.includes(status)) {
      throw createHttpError(
        400,
        `Invalid status. Allowed values: ${allowedStatuses.join(', ')}`,
      )
    }

    await client.query('BEGIN')

    // 1. Get current order
    const existingOrderResult = await client.query(
      `
      SELECT id, status
      FROM orders
      WHERE id = $1
      LIMIT 1
      `,
      [id],
    )

    if (existingOrderResult.rows.length === 0) {
      throw createHttpError(404, 'Order not found')
    }

    const existingOrder = existingOrderResult.rows[0]

    // 2. Prevent duplicate completion
    if (existingOrder.status === 'completed' && status === 'completed') {
      throw createHttpError(400, 'This order has already been completed')
    }

    // 3. Update order status
    const updateResult = await client.query(
      `
      UPDATE orders
      SET status = $1
      WHERE id = $2
      RETURNING
        id,
        customer_name,
        customer_email,
        customer_phone,
        status,
        payment_method,
        total,
        shipping_charge,
        created_at,
        updated_at
      `,
      [status, id],
    )

    // ৪. If transitioning to completed, deduct stock and increase sold_count
    if (existingOrder.status !== 'completed' && status === 'completed') {
      // ১. অর্ডারের আইটেমগুলো লোড করা হচ্ছে
      const orderItemsResult = await client.query(
        `
        SELECT oi.product_id, oi.product_variant_id, oi.quantity
        FROM order_items oi
        WHERE oi.order_id = $1
        `,
        [id],
      )

      // ২. লুপের ভেতর কোনো await ছাড়া, সব কুয়েরি একসাথে ফায়ার করার জন্য প্রমিজ অ্যারে বানাচ্ছি
      const updatePromises = orderItemsResult.rows.map((item) => {
        return client.query(
          `
            UPDATE inventory
            SET quantity = quantity - $1
            WHERE product_variant_id = $2 AND quantity >= $1 -- এখানেই আসল চেক! স্টক কম থাকলে আপডেট হবে না
            RETURNING product_variant_id, quantity;
            `,
          [item.quantity, item.product_variant_id],
        )
      })

      // ৩. Promise.all দিয়ে সব আইটেমের স্টক একসাথে প্যারালালি আপডেট করা হচ্ছে
      const updateResults = await Promise.all(updatePromises)

      // ৪. আপনার আগের 'if কন্ডিশনগুলোর' আসল রিপ্লেসমেন্ট এখানে:
      updateResults.forEach((result, index) => {
        // যদি rowCount === 0 হয়, তার মানে ডাটাবেজে ওই ভেরিয়েন্ট নাই অথবা স্টক কম ছিল, তাই আপডেট হয়নি
        if (result.rowCount === 0) {
          const failedItem = orderItemsResult.rows[index]

          // আপনার সেই পরিচিত এরর থ্রো—স্টক না থাকলে বা ইনভেন্টরি না মিললে এটা এক্সিকিউট হবে
          throw createHttpError(
            400,
            `Insufficient stock or inventory missing for variant id ${failedItem.product_variant_id}. Order cannot be completed.`,
          )
        }
      })

      // ৫. স্টক পারফেক্টলি কমলে, এবার সব প্রোডাক্টের sold_count একসাথে বাড়ানোর প্রমিজ অ্যারে
      const soldCountPromises = orderItemsResult.rows.map((item) => {
        return client.query(
          `
            UPDATE products
            SET sold_count = sold_count + $1
            WHERE id = $2
            `,
          [item.quantity, item.product_id],
        )
      })

      // ৬. সব sold_count একসাথে প্যারালালি আপডেট হবে
      await Promise.all(soldCountPromises)
    }

    await client.query('COMMIT')

    return successResponse(res, {
      statusCode: 200,
      message: 'Order updated successfully',
      payload: {
        order: updateResult.rows[0],
      },
    })
  } catch (error) {
    await client.query('ROLLBACK')
    next(error)
  } finally {
    client.release()
  }
}
