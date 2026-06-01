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
        SELECT id, public_id, image_url, is_main
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

// =============================================
// PRODUCT IMAGE UPDATE
// PATCH /api/products/:slug/images
// =============================================

export const handleUpdateProductImages = async (req, res, next) => {
  const client = await pool.connect()

  let newlyUploadedImages = []
  let oldImagesToDelete = []

  try {
    const { slug } = req.params

    // ফ্রন্টএন্ড থেকে পাঠানো ডিলিট করার পাবলিক আইডিগুলো পার্স করা
    let deletedSubPublicIds = []
    if (req.body.deletedSubPublicIds) {
      try {
        deletedSubPublicIds = JSON.parse(req.body.deletedSubPublicIds)
      } catch (e) {
        deletedSubPublicIds = []
      }
    }

    const hasMainImage = req.files?.mainImage?.length > 0
    const hasSubImages = req.files?.subImages?.length > 0

    // গার্ডিং কন্ডিশন: কোনো চেঞ্জ না থাকলে রিকোয়েস্ট আটকে দেওয়া
    if (!hasMainImage && !hasSubImages && deletedSubPublicIds.length === 0) {
      throw createHttpError(400, 'No image changes or deletions detected.')
    }

    await client.query('BEGIN')

    // =================================
    // PRODUCT CHECK
    // =================================
    const productResult = await client.query(
      `
      SELECT id
      FROM products
      WHERE slug = $1
      LIMIT 1
      `,
      [slug],
    )

    if (productResult.rowCount === 0) {
      throw createHttpError(404, 'Product not found')
    }

    const productId = productResult.rows[0].id

    // =================================
    // DELETE OLD MAIN IMAGE (If changed)
    // =================================
    if (hasMainImage) {
      const oldMainResult = await client.query(
        `
        SELECT public_id
        FROM product_images
        WHERE product_id = $1
        AND is_main = true
        `,
        [productId],
      )

      oldMainResult.rows.forEach((img) => {
        if (img.public_id) {
          oldImagesToDelete.push(img.public_id)
        }
      })

      await client.query(
        `
        DELETE FROM product_images
        WHERE product_id = $1
        AND is_main = true
        `,
        [productId],
      )
    }

    // =================================
    // DELETE SPECIFIC OLD SUB IMAGES (Only deleted ones)
    // =================================
    if (deletedSubPublicIds.length > 0) {
      const oldSubResult = await client.query(
        `
        SELECT public_id
        FROM product_images
        WHERE product_id = $1
        AND is_main = false
        AND public_id = ANY($2::text[])
        `,
        [productId, deletedSubPublicIds],
      )

      oldSubResult.rows.forEach((img) => {
        if (img.public_id) {
          oldImagesToDelete.push(img.public_id)
        }
      })

      await client.query(
        `
        DELETE FROM product_images
        WHERE product_id = $1
        AND is_main = false
        AND public_id = ANY($2::text[])
        `,
        [productId, deletedSubPublicIds],
      )
    }

    // =================================
    // MAIN IMAGE UPLOAD
    // =================================
    if (hasMainImage) {
      const uploaded = await cloudinaryFileUpload(req.files.mainImage[0])
      newlyUploadedImages.push(uploaded.public_id)

      await client.query(
        `
        INSERT INTO product_images (
          product_id,
          image_url,
          public_id,
          is_main
        )
        VALUES ($1, $2, $3, true)
        `,
        [productId, uploaded.secure_url, uploaded.public_id],
      )
    }

    // =================================
    // NEW SUB IMAGES UPLOAD
    // =================================
    if (hasSubImages) {
      for (const file of req.files.subImages) {
        const uploaded = await cloudinaryFileUpload(file)
        newlyUploadedImages.push(uploaded.public_id)

        await client.query(
          `
          INSERT INTO product_images (
            product_id,
            image_url,
            public_id,
            is_main
          )
          VALUES ($1, $2, $3, false)
          `,
          [productId, uploaded.secure_url, uploaded.public_id],
        )
      }
    }

    await client.query('COMMIT')

    // Background Cleanup (Cloudinary)
    if (oldImagesToDelete.length > 0) {
      Promise.all(
        oldImagesToDelete.map((publicId) => cloudinaryFileDelete(publicId)),
      ).catch(() => {})
    }

    return successResponse(res, {
      statusCode: 200,
      message: 'Images updated successfully',
    })
  } catch (error) {
    await client.query('ROLLBACK')

    // Rollback uploaded files if DB query fails
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
// VARIANT SYNC (PRODUCTION LEVEL)
// PATCH /api/products/:slug/variants
// =============================================

export const handleSyncProductVariants = async (req, res, next) => {
  const client = await pool.connect()
  try {
    const { slug } = req.params
    // 💡 বডি থেকে এখন variants এর পাশাপাশি total_quantity ও রিসিভ করছি
    const { variants, total_quantity } = req.body

    if (!Array.isArray(variants)) {
      throw createHttpError(400, 'variants must be an array')
    }

    await client.query('BEGIN')

    // ১. প্রোডাক্টের মূল তথ্য (id, sku) তুলে আনা
    const productResult = await client.query(
      `SELECT id, sku FROM products WHERE slug = $1 LIMIT 1`,
      [slug],
    )
    if (productResult.rowCount === 0) {
      throw createHttpError(404, 'Product not found')
    }

    const product = productResult.rows[0]

    // ২. ডাটাবেজে বর্তমানে থাকা এই প্রোডাক্টের সব ভ্যারিয়েন্ট আইডি বের করা
    const currentVariantsResult = await client.query(
      `SELECT id FROM product_variants WHERE product_id = $1`,
      [product.id],
    )
    const dbVariantIds = currentVariantsResult.rows.map((row) => row.id)

    // ============================================================
    // 💡 ৩. আর্কিটেকচারাল গার্ড: ইউজার যদি সিঙ্গেল প্রোডাক্ট বানাতে চায় (variants.length === 0)
    // ============================================================
    let finalVariants = variants

    if (finalVariants.length === 0) {
      // ৩.১ কোয়ান্টিটি চেক ভ্যালিডেশন
      if (
        total_quantity === undefined ||
        total_quantity === null ||
        total_quantity === ''
      ) {
        throw createHttpError(
          422,
          'Enter product quantity to convert into a single-item product.',
        )
      }

      // ৩.২ অর্ডার গার্ড চেক: এক্সিস্টিং ভ্যারিয়েন্টগুলোর সাথে কোনো অর্ডার আছে কিনা
      if (dbVariantIds.length > 0) {
        const orderCheckResult = await client.query(
          `SELECT DISTINCT product_variant_id FROM order_items WHERE product_variant_id = ANY($1::uuid[])`,
          [dbVariantIds],
        )

        if (orderCheckResult.rowCount > 0) {
          throw createHttpError(
            409,
            'Cannot convert to single product because current variants are tied to customer orders.',
          )
        }

        // ৩.৩ কোনো অর্ডার না থাকলে পুরানো সব ভ্যারিয়েন্ট একবারে ডিলিট করে ক্লিন করো
        await client.query(
          `DELETE FROM product_variants WHERE product_id = $1`,
          [product.id],
        )
      }

      // ৩.৪ ব্যাকগ্রাউন্ডে ইনসার্ট করার জন্য ডিফল্ট সিঙ্গেল ভ্যারিয়েন্ট স্ট্রাকচার তৈরি
      finalVariants = [
        {
          product_variant_id: null,
          price_modifier: 0,
          quantity: Number(total_quantity) || 0,
          options: [], // সিঙ্গেল প্রোডাক্টের কোনো কালার/সাইজ অপশন থাকবে না
        },
      ]
    }

    // ৪. ফ্রন্টএন্ড থেকে আসা এক্সিস্টিং আইডি ফিল্টার করা (যখন variants.length > 0 থাকে)
    const incomingVariantIds = finalVariants
      .map((v) => v.product_variant_id)
      .filter((id) => id != null)

    // ৫. যে আইডিগুলো ডাটাবেজে আছে কিন্তু ইনকামিং লিস্টে নাই, সেগুলো ইউজার সিঙ্গেল ডিলিট করেছে
    const idsToDelete = dbVariantIds.filter(
      (id) => !incomingVariantIds.includes(id),
    )

    // ৬. পার্টশিয়াল ডিলিট এবং অর্ডার গার্ড চেক
    if (idsToDelete.length > 0) {
      const orderCheckResult = await client.query(
        `SELECT DISTINCT product_variant_id FROM order_items WHERE product_variant_id = ANY($1::uuid[])`,
        [idsToDelete],
      )

      if (orderCheckResult.rowCount > 0) {
        throw createHttpError(
          409,
          'Cannot delete variant(s) because they are associated with existing customer orders.',
        )
      }

      await client.query(
        `DELETE FROM product_variants WHERE id = ANY($1::uuid[])`,
        [idsToDelete],
      )
    }

    // ৭. লুপ চালিয়ে ডাইনামিক INSERT অথবা UPDATE (UPSERT) করা
    for (const variant of finalVariants) {
      const variantId = variant.product_variant_id

      // SKU জেনারেশন লজিক
      let variantSku = product.sku
      if (variant.options && variant.options.length > 0) {
        const suffix = variant.options
          .map((op) => op.option_value.substring(0, 3).toUpperCase())
          .join('-')
        variantSku = `${product.sku}-${suffix}`
      }

      let currentVariantId = variantId

      if (variantId) {
        // --- ক) এক্সিস্টিং ভ্যারিয়েন্ট আপডেট লজিক ---
        await client.query(
          `UPDATE product_variants
           SET price_modifier = $1, sku = $2, updated_at = CURRENT_TIMESTAMP
           WHERE id = $3 AND product_id = $4`,
          [
            Number(variant.price_modifier) || 0,
            variantSku,
            variantId,
            product.id,
          ],
        )

        // অপশন টেবিল রিসেট ও নতুন করে ইনসার্ট
        await client.query(
          `DELETE FROM variant_options WHERE product_variant_id = $1`,
          [variantId],
        )

        if (variant.options && variant.options.length > 0) {
          for (const option of variant.options) {
            if (option.option_value) {
              await client.query(
                `INSERT INTO variant_options (product_variant_id, option_name, option_value) 
                 VALUES ($1, $2, $3)`,
                [variantId, option.option_name, option.option_value],
              )
            }
          }
        }

        // ইনভেন্টরি স্টক আপডেট
        await client.query(
          `UPDATE inventory
           SET quantity = $1, updated_at = CURRENT_TIMESTAMP
           WHERE product_variant_id = $2`,
          [Number(variant.quantity) || 0, variantId],
        )
      } else {
        // --- খ) একদম নতুন বা ডিফল্ট সিঙ্গেল ভ্যারিয়েন্ট ইনসার্ট লজিক ---
        const variantResult = await client.query(
          `INSERT INTO product_variants (product_id, price_modifier, sku)
           VALUES ($1, $2, $3)
           RETURNING id`,
          [product.id, Number(variant.price_modifier) || 0, variantSku],
        )

        currentVariantId = variantResult.rows[0].id

        // অপশনস ইনসার্ট (যদি থাকে)
        if (variant.options && variant.options.length > 0) {
          for (const option of variant.options) {
            if (option.option_value) {
              await client.query(
                `INSERT INTO variant_options (product_variant_id, option_name, option_value) 
                 VALUES ($1, $2, $3)`,
                [currentVariantId, option.option_name, option.option_value],
              )
            }
          }
        }

        // ইনভেন্টরি স্টক ইনসার্ট
        await client.query(
          `INSERT INTO inventory (product_variant_id, quantity) VALUES ($1, $2)`,
          [currentVariantId, Number(variant.quantity) || 0],
        )
      }
    }

    await client.query('COMMIT')

    // রেসপন্স মেসেজ ডাইনামিক করা হলো UI-তে প্রপার ফিডব্যাক দেওয়ার জন্য
    const isSingleProduct = variants.length === 0
    return successResponse(res, {
      statusCode: 200,
      message: isSingleProduct
        ? 'Product successfully converted to single product with base stock.'
        : 'Product variants synced successfully.',
    })
  } catch (error) {
    await client.query('ROLLBACK')
    next(error)
  } finally {
    client.release()
  }
}

// =============================================
// INVENTORY UPDATE
// PATCH /api/products/:slug/inventory
// =============================================

export const handleUpdateInventory = async (req, res, next) => {
  try {
    const { slug } = req.params
    const { product_variant_id, stock_quantity } = req.body

    // ১. আর্লি ভ্যালিডেশন (ডেটাবেজে যাওয়ার আগেই আটকে দেওয়া)
    if (!product_variant_id) {
      throw createHttpError(400, 'Variant id is required')
    }
    if (stock_quantity < 0) {
      throw createHttpError(400, 'Quantity cannot be negative')
    }

    // ২. সরাসরি pool.query ব্যবহার (no transaction need so, no client or release)
    const updatedResult = await pool.query(
      `
      UPDATE inventory i
      SET 
        quantity = $1,
        updated_at = CURRENT_TIMESTAMP
      FROM product_variants pv
      JOIN products p ON p.id = pv.product_id
      WHERE i.product_variant_id = $2 
        AND pv.id = $2
        AND p.slug = $3
      RETURNING i.*
      `,
      [stock_quantity, product_variant_id, slug],
    )

    // ৩. আইডি বা স্ল্যাগ ম্যাচ না করলে rowCount ০ হবে
    if (updatedResult.rowCount === 0) {
      throw createHttpError(404, 'Inventory not found or route mismatch!')
    }

    return successResponse(res, {
      statusCode: 200,
      message: 'Inventory updated successfully',
      payload: {
        inventory: updatedResult.rows[0],
      },
    })
  } catch (error) {
    next(error) // এখানে কোনো rollback বা release নাই, কারণ pool নিজেই সব হ্যান্ডেল করছে
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
