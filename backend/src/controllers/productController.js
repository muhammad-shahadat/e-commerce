import createHttpError from 'http-errors'
import slugify from 'slugify'

import pool from '../../config/db.js'
import {
  cloudinaryFileDelete,
  cloudinaryFileUpload,
} from '../helper/cloudinaryHelper.js'
import { successResponse } from './responseController.js'

const generateUniqueSlug = (title) => {
  return `${slugify(title, { lower: true })}-${Date.now().toString().slice(-5)}`
}

const generateUniqueSku = (catCode, productId) => {
  const prefix = catCode ? catCode.toUpperCase() : 'GEN'
  const randomStr = Math.random().toString(36).substring(2, 5).toUpperCase()
  const shortId = productId.toString().slice(-3)

  return `${prefix}-${randomStr}-${shortId}`
}

export const handleCreateProduct = async (req, res, next) => {
  const client = await pool.connect() // postgreSQL connection
  let uploadedImages = [] //cloudinary Public IDs will be saved here for Rollback

  try {
    await client.query('BEGIN') // transaction starts
    const {
      title,
      description,
      base_price,
      discount_percent,
      category_id,
      total_quantity,
    } = req.body

    // convert json string to js object.
    const variants = req.body.variants ? JSON.parse(req.body.variants) : []

    if (!title || !description || !base_price) {
      await client.query('ROLLBACK')
      return next(createHttpError(422, 'Fill in the required fields!'))
    }

    if (!category_id) {
      await client.query('ROLLBACK')
      return next(createHttpError(422, 'Select at least one category'))
    }

    const catResult = await client.query(
      'SELECT category_code, name FROM categories WHERE id = $1',
      [category_id],
    )
    if (catResult.rowCount === 0) {
      throw createHttpError(404, 'Category not found')
    }

    const catCode =
      catResult.rows[0].category_code || catResult.rows[0].name.substring(0, 3)

    const slug = generateUniqueSlug(title)

    /** form data always send data into json string format. so need to parse */
    // 1. product table insert
    const productRes = await client.query(
      `INSERT INTO products (title, slug, description, base_price, discount_percent, category_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [
        title,
        slug,
        description,
        parseFloat(base_price),
        parseFloat(discount_percent) || 0,
        category_id,
      ],
    )

    const productId = productRes.rows[0].id
    const productSku = generateUniqueSku(catCode, productId)

    await client.query(`UPDATE products SET sku = $1 WHERE id = $2`, [
      productSku,
      productId,
    ])

    // 2. variants table insert
    let finalVariants = variants
    if (finalVariants.length === 0 && !total_quantity) {
      throw createHttpError(422, 'enter product quantity')
    }

    if (finalVariants.length === 0) {
      finalVariants = [
        {
          price_modifier: 0,
          quantity: total_quantity || 0,
          options: [],
        },
      ]
    }

    // product_variants, variant_options, and inventory table insertion inside this for of loop
    for (const variant of finalVariants) {
      //for generating variant sku like: TSH-A97B-001-RED-XL
      let variantSku = productSku
      if (variant.options && variant.options.length > 0) {
        const optSuffix = variant.options
          .map((o) => o.option_value.substring(0, 3).toUpperCase())
          .join('-')
        variantSku = `${productSku}-${optSuffix}`
      }

      // 3. product_variants table insertion
      const productVariantRes = await client.query(
        `INSERT INTO product_variants (product_id, price_modifier, sku) VALUES ($1, $2, $3) RETURNING id`,
        [productId, parseFloat(variant.price_modifier) || 0, variantSku],
      )

      const variantId = productVariantRes.rows[0].id

      // 4. variant_options table insertion
      if (variant.options && variant.options.length > 0) {
        for (const option of variant.options) {
          if (option.option_value) {
            await client.query(
              `INSERT INTO variant_options (product_variant_id, option_name, option_value) VALUES ($1, $2, $3)`,
              [variantId, option.option_name, option.option_value],
            )
          }
        }
      }

      // 5. inventory table insertion
      await client.query(
        `INSERT INTO inventory (product_variant_id, quantity) VALUES ($1, $2)`,
        [variantId, parseInt(variant.quantity) || 0],
      )
    }

    // image handling (main and sub image)
    // here req.files is a js object not array
    const allFilesToUpload = []
    if (req.files) {
      //main image process
      if (req.files.mainImage) {
        allFilesToUpload.push({
          file: req.files.mainImage[0],
          isMain: true,
        })
      }

      //sub images process
      if (req.files.subImages) {
        req.files.subImages.forEach((file) => {
          allFilesToUpload.push({
            file: file,
            isMain: false,
          })
        })
      }
    }

    //cloudinary upload
    //Promise.allSettled([promise1, promise2, ..]), it takes array of pending promises
    //returns array of object (i.e uploadRes = [])
    const uploadRes = await Promise.allSettled(
      allFilesToUpload.map((item) => cloudinaryFileUpload(item.file)),
    )

    //pg library not support multiple row. pg-format library support it
    //for, for of, while loop supports async await.
    for (let i = 0; i < uploadRes.length; i++) {
      const result = uploadRes[i]
      if (result.status === 'fulfilled') {
        const { secure_url, public_id } = result.value
        uploadedImages.push(public_id)

        //product_images table insert
        await client.query(
          `INSERT INTO product_images (product_id, image_url, public_id, is_main) 
                    VALUES ($1, $2, $3, $4)`,
          [productId, secure_url, public_id, allFilesToUpload[i].isMain],
        )
      } else {
        // in case of reject: result.status === 'rejected'
        console.error(
          `${i} index image upload failed: ${result.reason.message}`,
        )
        //throw error for rollback
        throw createHttpError(500, `Image upload failed: ${result.reason}`)
      }
    }

    await client.query('COMMIT')

    successResponse(res, {
      statusCode: 201,
      message: 'The product is successfully added',
      payload: {
        productId,
        title,
        productSku,
      },
    })
  } catch (error) {
    console.error('failed to create product:', error)
    if (client) {
      await client.query('ROLLBACK')
    }

    if (uploadedImages.length > 0) {
      console.warn(
        `Transaction failed. Attempting to clean up ${uploadedImages.length} images from Cloudinary.`,
      )
      await Promise.all(
        uploadedImages.map((id) =>
          cloudinaryFileDelete(id).catch((error) => {
            console.error(
              `Failed to cleanup Cloudinary public ID ${id}: ${error.message}`,
            )
          }),
        ),
      )
    }
    next(error)
  } finally {
    if (client) {
      client.release()
    }
  }
}

export const handleGetProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      sort = '',
      category = '',
    } = req.query

    const pageNumber = Number(page)
    const limitNumber = Number(limit)
    const offset = (pageNumber - 1) * limitNumber

    // 🔥 dynamic filter
    let whereClauses = ['p.is_active = TRUE']
    let values = []
    let index = 1

    // Improved Multi-word Search Logic
    if (search) {
      // ইউজার যা সার্চ করেছে তাকে স্পেস দিয়ে ভাগ করে আলাদা শব্দ বের করা
      const searchWords = search.trim().split(/\s+/)

      const searchTerms = searchWords.map((word) => {
        values.push(`%${word}%`)
        const currentIndex = index
        index++
        return `p.title ILIKE $${currentIndex}`
      })

      // টাইটেলের মধ্যে সবগুলো শব্দ থাকতে হবে এমন শর্ত (AND লজিক)
      whereClauses.push(`(${searchTerms.join(' AND ')})`)
    }

    // category filter (RECURSIVE logic)
    if (category) {
      whereClauses.push(`p.category_id IN (
        WITH RECURSIVE category_tree AS (
            
            SELECT id FROM categories WHERE slug = $${index}
            UNION ALL
            
            SELECT c.id FROM categories c
            INNER JOIN category_tree ct ON c.parent_id = ct.id
        )
        SELECT id FROM category_tree
      )`)
      values.push(category)
      index++
    }

    const whereQuery = whereClauses.length
      ? `WHERE ${whereClauses.join(' AND ')}`
      : ''

    // 🔥 sorting
    let orderBy = 'ORDER BY p.created_at DESC' // default = new

    if (sort === 'popular') {
      orderBy = 'ORDER BY p.view_count DESC'
    }

    if (sort === 'bestseller') {
      orderBy = 'ORDER BY p.sold_count DESC'
    }

    if (sort === 'new') {
      orderBy = 'ORDER BY p.created_at DESC'
    }

    // 🔥 total count query
    const countQuery = `
      SELECT COUNT(*) 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereQuery}
    `

    const countResult = await pool.query(countQuery, values)
    const totalProducts = Number(countResult.rows[0].count)
    const totalPages = Math.ceil(totalProducts / limitNumber)

    // 🔥 main query
    const productQuery = `
      SELECT 
        p.id,
        p.title,
        p.slug,
        p.base_price,
        p.discount_percent,
        p.sold_count,
        p.view_count,
        p.created_at,
        c.name AS category_name,
        c.slug AS category_slug,

        (
          SELECT pi.image_url 
          FROM product_images pi
          WHERE pi.product_id = p.id AND pi.is_main = TRUE
          LIMIT 1
        ) AS main_image,

        (
          SELECT MIN(pv.price_modifier)
          FROM product_variants pv
          WHERE pv.product_id = p.id
        ) AS min_price_modifier

      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereQuery}
      ${orderBy}
      LIMIT $${index} OFFSET $${index + 1}
    `

    const finalValues = [...values, limitNumber, offset]

    const result = await pool.query(productQuery, finalValues)

    return successResponse(res, {
      statusCode: 200,
      message: 'Products fetched successfully',
      payload: {
        pagination: {
          totalProducts,
          totalPages,
          currentPage: pageNumber,
          previousPage: pageNumber > 1 ? pageNumber - 1 : null,
          nextPage: pageNumber < totalPages ? pageNumber + 1 : null,
        },
        productData: result.rows,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const handleGetProduct = async (req, res, next) => {
  try {
    const { slug } = req.params

    // 🔥 1. view count (fire & forget)
    pool
      .query(
        `UPDATE products SET view_count = view_count + 1 WHERE slug = $1`,
        [slug],
      )
      .catch(() => {}) // ignore error silently

    // 🔥 2. get product
    const productRes = await pool.query(
      `SELECT * FROM products WHERE slug = $1 LIMIT 1`,
      [slug],
    )

    if (productRes.rows.length === 0) {
      throw createHttpError(404, 'Product not found')
    }

    const product = productRes.rows[0]
    const productId = product.id
    const categoryId = product.category_id

    // 🔥 3. parallel queries
    const [imageRes, variantRes, categoryRes] = await Promise.all([
      // ✅ images
      pool.query(
        `
        SELECT image_url, is_main
        FROM product_images
        WHERE product_id = $1
        ORDER BY is_main DESC
        `,
        [productId],
      ),

      // ✅ variants (JSON aggregated)
      pool.query(
        `
        SELECT 
          pv.id AS product_variant_id,
          pv.price_modifier,
          pv.sku AS final_sku,
          i.quantity AS stock_quantity,

          COALESCE(
            json_agg(
              json_build_object(
                'option_name', vo.option_name,
                'option_value', vo.option_value
              )
            ) FILTER (WHERE vo.id IS NOT NULL),
            '[]'
          ) AS options

        FROM product_variants pv
        LEFT JOIN inventory i ON pv.id = i.product_variant_id
        LEFT JOIN variant_options vo ON pv.id = vo.product_variant_id

        WHERE pv.product_id = $1

        GROUP BY 
          pv.id, pv.price_modifier, pv.sku, i.quantity

        ORDER BY pv.id
        `,
        [productId],
      ),

      // ✅ category tree (breadcrumb)
      pool.query(
        `
        WITH RECURSIVE category_path AS (
          SELECT id, name, slug, parent_id
          FROM categories
          WHERE id = $1

          UNION ALL

          SELECT c.id, c.name, c.slug, c.parent_id
          FROM categories c
          JOIN category_path cp ON c.id = cp.parent_id
        )
        SELECT id, parent_id, name, slug FROM category_path
        `,
        [categoryId],
      ),
    ])

    // 🔥 4. response
    return successResponse(res, {
      statusCode: 200,
      message: 'Product data fetched successfully',
      payload: {
        product,
        images: imageRes.rows,
        variants: variantRes.rows,
        categoryTree: categoryRes.rows.reverse(),
      },
    })
  } catch (error) {
    next(error)
  }
}

export const handleGetRelatedProducts = async (req, res, next) => {
  try {
    const { categoryId } = req.params

    const { exclude } = req.query // current product id that will be excluded

    const limit = Number(req.query.limit) || 8

    if (!categoryId) {
      throw createHttpError(400, 'Category ID is required')
    }

    const relatedProductsQuery = `
      SELECT 
        p.id,
        p.title,
        p.slug,
        p.base_price,
        p.discount_percent,
        p.sold_count,
        p.view_count,
        p.created_at,
        c.name AS category_name,
        c.slug AS category_slug,

        (
          SELECT image_url
          FROM product_images
          WHERE product_id = p.id
          AND is_main = TRUE
          LIMIT 1
        ) AS main_image,

        (
          SELECT MIN(price_modifier)
          FROM product_variants
          WHERE product_id = p.id
        ) AS min_price_modifier

      FROM products p

      LEFT JOIN categories c
      ON p.category_id = c.id

      WHERE p.category_id = $1
      AND p.id != $2
      AND p.is_active = TRUE

      ORDER BY
        p.sold_count DESC,
        p.view_count DESC

      LIMIT $3
    `

    const result = await pool.query(relatedProductsQuery, [
      categoryId,
      exclude || '00000000-0000-0000-0000-000000000000',
      limit,
    ])

    return successResponse(res, {
      statusCode: 200,
      message: 'Related products fetched successfully',
      payload: result.rows,
    })
  } catch (error) {
    next(error)
  }
}

export const handleDeleteProduct = async (req, res, next) => {
  const client = await pool.connect()

  try {
    const { id } = req.params

    // =========================
    // 1. Validate Input
    // =========================
    if (!id) {
      throw createHttpError(400, 'Product ID is required')
    }

    // =========================
    // 2. Check Product Exists
    // =========================
    const existingProductResult = await client.query(
      `
      SELECT
        id,
        title,
        slug,
        sku,
        created_at
      FROM products
      WHERE id = $1
      LIMIT 1
      `,
      [id],
    )

    if (existingProductResult.rows.length === 0) {
      throw createHttpError(404, 'Product not found')
    }

    const existingProduct = existingProductResult.rows[0]

    // =========================
    // 3. Check Whether Product Has Any Orders
    // =========================
    // If this product appears in any order_items row,
    // product deletion is blocked.
    //
    // This is the safest business rule because:
    // - Order history must remain intact
    // - Financial records must remain consistent
    // - Customer invoices must continue to reference products
    const orderUsageResult = await client.query(
      `
      SELECT
        COUNT(*)::INTEGER AS total_order_references
      FROM order_items
      WHERE product_id = $1
      `,
      [id],
    )

    const totalOrderReferences = orderUsageResult.rows[0].total_order_references

    if (totalOrderReferences > 0) {
      throw createHttpError(
        400,
        'This product cannot be deleted because it is used in existing orders',
      )
    }

    // =========================
    // 4. Begin Transaction
    // =========================
    await client.query('BEGIN')

    // =========================
    // 5. Delete Product
    // =========================
    // Related records will be deleted automatically because of:
    // - product_variants.product_id ON DELETE CASCADE
    // - product_images.product_id ON DELETE CASCADE
    // - inventory -> cascades through product_variants
    // - variant_options -> cascades through product_variants
    const deleteResult = await client.query(
      `
      DELETE FROM products
      WHERE id = $1
      RETURNING
        id,
        title,
        slug,
        sku,
        created_at
      `,
      [id],
    )

    // Safety check
    if (deleteResult.rows.length === 0) {
      throw createHttpError(404, 'Product not found')
    }

    // =========================
    // 6. Commit Transaction
    // =========================
    await client.query('COMMIT')

    // =========================
    // 7. Success Response
    // =========================
    return successResponse(res, {
      statusCode: 200,
      message: 'Product deleted successfully',
      payload: {
        deletedProduct: deleteResult.rows[0],
      },
    })
  } catch (error) {
    await client.query('ROLLBACK')
    next(error)
  } finally {
    client.release()
  }
}

export const handleUpdateProduct = async (req, res, next) => {
  const client = await pool.connect()

  const { slug: paramSlug } = req.params

  let newlyUploadedImages = []
  let oldImagesToDelete = []

  try {
    await client.query('BEGIN')

    // ================================
    // 1. EXISTING PRODUCT
    // ================================
    const existingProductResult = await client.query(
      `
      SELECT
        id,
        sku,
        title,
        slug,
        category_id,
        base_price,
        discount_percent,
        description,
        is_active
      FROM products
      WHERE slug = $1
      LIMIT 1
      `,
      [paramSlug],
    )

    if (existingProductResult.rowCount === 0) {
      throw createHttpError(404, 'Product not found')
    }

    const existingProduct = existingProductResult.rows[0]

    const productId = existingProduct.id
    const productSku = existingProduct.sku

    // ================================
    // 2. BODY DATA
    // ================================
    const {
      title,
      description,
      base_price,
      discount_percent,
      category_id,
      total_quantity,
      is_active,
    } = req.body

    const parsedVariants = req.body.variants
      ? JSON.parse(req.body.variants)
      : null

    // ================================
    // 3. VALIDATION
    // ================================
    if (!title || !description || !base_price || !category_id) {
      throw createHttpError(422, 'Required fields are missing')
    }

    // category validation
    const categoryResult = await client.query(
      `
      SELECT id
      FROM categories
      WHERE id = $1
      LIMIT 1
      `,
      [category_id],
    )

    if (categoryResult.rowCount === 0) {
      throw createHttpError(404, 'Category not found')
    }

    // ================================
    // 4. UPDATE PRODUCTS TABLE
    // ONLY UPDATE IF VALUE CHANGED
    // ================================
    const finalSlug =
      title !== existingProduct.title
        ? generateUniqueSlug(title)
        : existingProduct.slug

    await client.query(
      `
      UPDATE products
      SET
        title = $1,
        slug = $2,
        description = $3,
        base_price = $4,
        discount_percent = $5,
        category_id = $6,
        is_active = $7,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      `,
      [
        title,
        finalSlug,
        description,
        Number(base_price),
        Number(discount_percent) || 0,
        category_id,
        is_active === 'false' ? false : true,
        productId,
      ],
    )

    // ==================================================
    // 5. VARIANTS UPDATE
    // ONLY TOUCH VARIANTS IF variants EXISTS IN REQUEST
    // ==================================================
    if (parsedVariants !== null) {
      // delete old variants
      await client.query(
        `
        DELETE FROM product_variants
        WHERE product_id = $1
        `,
        [productId],
      )

      let finalVariants = parsedVariants

      // single product fallback
      if (finalVariants.length === 0) {
        finalVariants = [
          {
            price_modifier: 0,
            quantity: total_quantity || 0,
            options: [],
          },
        ]
      }

      // insert fresh variants
      for (const variant of finalVariants) {
        let variantSku = productSku

        if (variant.options?.length > 0) {
          const optionSuffix = variant.options
            .map((option) => option.option_value.substring(0, 3).toUpperCase())
            .join('-')

          variantSku = `${productSku}-${optionSuffix}`
        }

        const variantResult = await client.query(
          `
          INSERT INTO product_variants (
            product_id,
            price_modifier,
            sku
          )
          VALUES ($1, $2, $3)
          RETURNING id
          `,
          [productId, Number(variant.price_modifier) || 0, variantSku],
        )

        const variantId = variantResult.rows[0].id

        // variant options
        if (variant.options?.length > 0) {
          for (const option of variant.options) {
            if (!option.option_value) continue

            await client.query(
              `
              INSERT INTO variant_options (
                product_variant_id,
                option_name,
                option_value
              )
              VALUES ($1, $2, $3)
              `,
              [variantId, option.option_name, option.option_value],
            )
          }
        }

        // inventory
        await client.query(
          `
          INSERT INTO inventory (
            product_variant_id,
            quantity
          )
          VALUES ($1, $2)
          `,
          [variantId, Number(variant.quantity) || 0],
        )
      }
    }

    // ==================================================
    // 6. IMAGE UPDATE
    // ONLY TOUCH IMAGES IF NEW FILES PROVIDED
    // ==================================================
    const hasMainImage = req.files?.mainImage?.length > 0
    const hasSubImages = req.files?.subImages?.length > 0

    if (hasMainImage || hasSubImages) {
      const allFilesToUpload = []

      // main image
      if (hasMainImage) {
        allFilesToUpload.push({
          file: req.files.mainImage[0],
          isMain: true,
        })
      }

      // sub images
      if (hasSubImages) {
        req.files.subImages.forEach((file) => {
          allFilesToUpload.push({
            file,
            isMain: false,
          })
        })
      }

      // old image select
      const oldImagesResult = await client.query(
        `
        SELECT public_id, is_main
        FROM product_images
        WHERE product_id = $1
        AND (
          (is_main = true AND $2 = true)
          OR
          (is_main = false AND $3 = true)
        )
        `,
        [productId, hasMainImage, hasSubImages],
      )

      // save for cloudinary delete
      oldImagesResult.rows.forEach((img) => {
        if (img.public_id) {
          oldImagesToDelete.push(img.public_id)
        }
      })

      // delete old DB rows
      await client.query(
        `
        DELETE FROM product_images
        WHERE product_id = $1
        AND (
          (is_main = true AND $2 = true)
          OR
          (is_main = false AND $3 = true)
        )
        `,
        [productId, hasMainImage, hasSubImages],
      )

      // upload new images
      const uploadResults = await Promise.allSettled(
        allFilesToUpload.map((item) => cloudinaryFileUpload(item.file)),
      )

      for (let i = 0; i < uploadResults.length; i++) {
        const result = uploadResults[i]

        if (result.status === 'rejected') {
          throw createHttpError(500, 'Image upload failed')
        }

        const { secure_url, public_id } = result.value

        newlyUploadedImages.push(public_id)

        await client.query(
          `
          INSERT INTO product_images (
            product_id,
            image_url,
            public_id,
            is_main
          )
          VALUES ($1, $2, $3, $4)
          `,
          [productId, secure_url, public_id, allFilesToUpload[i].isMain],
        )
      }
    }

    // ================================
    // 7. COMMIT
    // ================================
    await client.query('COMMIT')

    // ================================
    // 8. BACKGROUND CLOUDINARY CLEANUP
    // ================================
    if (oldImagesToDelete.length > 0) {
      Promise.all(
        oldImagesToDelete.map((publicId) => cloudinaryFileDelete(publicId)),
      ).catch((err) => {
        console.error('Cloudinary cleanup failed:', err.message)
      })
    }

    // ================================
    // 9. SUCCESS RESPONSE
    // ================================
    return successResponse(res, {
      statusCode: 200,
      message: 'Product updated successfully',
      payload: {
        productId,
        slug: finalSlug,
      },
    })
  } catch (error) {
    await client.query('ROLLBACK')

    // rollback uploaded images
    if (newlyUploadedImages.length > 0) {
      await Promise.all(
        newlyUploadedImages.map((publicId) =>
          cloudinaryFileDelete(publicId).catch(() => {}),
        ),
      )
    }

    next(error)
  } finally {
    client.release()
  }
}

// =============================================
// PRODUCT BASIC INFO UPDATE
// PATCH /api/products/:slug/basic-info
// =============================================

export const handleUpdateProductBasicInfo = async (req, res, next) => {
  const client = await pool.connect()

  try {
    const { slug: paramSlug } = req.params

    const {
      title,
      description,
      base_price,
      discount_percent,
      category_id,
      is_active,
    } = req.body

    await client.query('BEGIN')

    // =================================
    // EXISTING PRODUCT
    // =================================
    const existingProductResult = await client.query(
      `
      SELECT
        id,
        title,
        slug
      FROM products
      WHERE slug = $1
      LIMIT 1
      `,
      [paramSlug],
    )

    if (existingProductResult.rowCount === 0) {
      throw createHttpError(404, 'Product not found')
    }

    const existingProduct = existingProductResult.rows[0]

    // =================================
    // CATEGORY VALIDATION
    // =================================
    if (category_id) {
      const categoryResult = await client.query(
        `
        SELECT id
        FROM categories
        WHERE id = $1
        LIMIT 1
        `,
        [category_id],
      )

      if (categoryResult.rowCount === 0) {
        throw createHttpError(404, 'Category not found')
      }
    }

    // =================================
    // DYNAMIC UPDATE
    // ONLY CHANGED FIELDS
    // =================================
    const fields = []
    const values = []

    let index = 1

    if (title !== undefined) {
      fields.push(`title = $${index}`)
      values.push(title)
      index++

      const finalSlug =
        title !== existingProduct.title
          ? generateUniqueSlug(title)
          : existingProduct.slug

      fields.push(`slug = $${index}`)
      values.push(finalSlug)
      index++
    }

    if (description !== undefined) {
      fields.push(`description = $${index}`)
      values.push(description)
      index++
    }

    if (base_price !== undefined) {
      fields.push(`base_price = $${index}`)
      values.push(Number(base_price))
      index++
    }

    if (discount_percent !== undefined) {
      fields.push(`discount_percent = $${index}`)
      values.push(Number(discount_percent))
      index++
    }

    if (category_id !== undefined) {
      fields.push(`category_id = $${index}`)
      values.push(category_id)
      index++
    }

    if (is_active !== undefined) {
      fields.push(`is_active = $${index}`)
      values.push(is_active)
      index++
    }

    if (fields.length === 0) {
      throw createHttpError(400, 'No fields provided for update')
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`)

    values.push(existingProduct.id)

    const updateQuery = `
      UPDATE products
      SET ${fields.join(', ')}
      WHERE id = $${index}
      RETURNING *
    `

    const updatedResult = await client.query(updateQuery, values)

    await client.query('COMMIT')

    return successResponse(res, {
      statusCode: 200,
      message: 'Product basic info updated successfully',
      payload: {
        product: updatedResult.rows[0],
      },
    })
  } catch (error) {
    await client.query('ROLLBACK')
    next(error)
  } finally {
    client.release()
  }
}
