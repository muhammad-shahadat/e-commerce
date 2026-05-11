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
            (
                SELECT COALESCE(
                    json_agg(
                        json_build_object(
                            'option_name', vo.option_name, 
                            'option_value', vo.option_value
                        )
                    ) FILTER (WHERE vo.id IS NOT NULL), 
                    '[]'
                )
                FROM variant_options vo
                WHERE vo.product_variant_id = pv.id
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
