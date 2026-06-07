import crypto from 'crypto' // node.js built in module
import createHttpError from 'http-errors'
import slugify from 'slugify'

import { successResponse } from './responseController.js'
import pool from '../../config/db.js'

export const handleGetCategories = async (req, res, next) => {
  try {
    const result = await pool.query(`
            SELECT id, name, slug, parent_id FROM categories
            ORDER BY created_at DESC;

        `)

    successResponse(res, {
      statusCode: 200,
      message: result.rows.length
        ? 'Categories were fetched successfully.'
        : 'category not found',
      payload: result.rows,
    })
  } catch (error) {
    next(error)
  }
}

export const handleCreateCategory = async (req, res, next) => {
  try {
    const { categoryName, categoryCode, parentId } = req.body

    if (!categoryName) {
      return next(createHttpError(400, 'Category name is required'))
    }

    const categorySlug = slugify(categoryName, { lower: true, strict: true })

    let finalCategoryCode = categoryCode
    if (!finalCategoryCode) {
      const cleanName = categoryName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
      const baseCode = cleanName.substring(0, 3) // যেমন: HOM
      // ২ অক্ষরের একটা ছোট র্যান্ডম স্ট্রিং (যেমন: A1, 9X) যোগ করব যেন কখনো ডুপ্লিকেট না হয়
      const randomSuffix = crypto.randomBytes(1).toString('hex').toUpperCase()
      finalCategoryCode = `${baseCode}${randomSuffix}` // আউটপুট হবে: HOM8F, HOM2A etc.
    } else {
      finalCategoryCode = finalCategoryCode.toUpperCase()
    }

    const finalParentId = parentId || null

    const query = `
            INSERT INTO categories (name, slug, category_code, parent_id) 
            VALUES ($1, $2, $3, $4) 
            RETURNING id, name, slug, category_code, parent_id, created_at
        `

    const { rows } = await pool.query(query, [
      categoryName,
      categorySlug,
      finalCategoryCode,
      finalParentId,
    ])

    if (rows.length === 0) {
      throw createHttpError(500, 'Category could not be created')
    }

    successResponse(res, {
      statusCode: 201,
      message: finalParentId
        ? 'Subcategory created successfully'
        : 'Main Category created successfully',
      payload: rows[0],
    })
  } catch (error) {
    if (error.code === '23505') {
      return next(
        createHttpError(
          409,
          'A category with this name, slug or code already exists.',
        ),
      )
    }
    next(error)
  }
}
