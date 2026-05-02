import createHttpError from "http-errors";
import slugify from "slugify";

import pool from "../../config/db.js";
import { cloudinaryFileDelete, cloudinaryFileUpload } from "../helper/cloudinaryHelper.js";
import { successResponse } from "./responseController.js";


const generateUniqueSlug = (title) => {
    return `${slugify(title, {lower: true})}-${Date.now().toString().slice(-5)}`;

};

const generateUniqueSku = (catCode, productId) => {
    const prefix = catCode ? catCode.toUpperCase() : "GEN";
    const randomStr = Math.random().toString(36).substring(2, 5).toUpperCase();
    const shortId = productId.toString().slice(-3);

    return `${prefix}-${randomStr}-${shortId}`;
}



export const handleCreateProduct = async (req, res, next) => {
    const client = await pool.connect(); // postgreSQL connection
    let uploadedImages = []; //cloudinary Public IDs will be saved here for Rollback

    try {

        await client.query("BEGIN"); // transaction starts
        const { title, description, base_price, discount_percent, category_id, total_quantity } = req.body;

        // convert json string to js object.
        const variants = req.body.variants ? JSON.parse(req.body.variants) : [];

        if(!title || !description || !base_price) {
            await client.query("ROLLBACK");
            return next(createHttpError(422, "Fill in the required fields!"));
        }

        if(!category_id) {
            await client.query("ROLLBACK");
            return next(createHttpError(422, "Select at least one category"));
        }

        const catResult = await client.query("SELECT category_code, name FROM categories WHERE id = $1", [category_id]);
        if(catResult.rowCount === 0) {
            throw createHttpError(404, "Category not found");
        }

        const catCode = catResult.rows[0].category_code || catResult.rows[0].name.substring(0, 3);

        const slug = generateUniqueSlug(title);

        /** form data always send data into json string format. so need to parse */
        // 1. product table insert
        const productRes = await client.query(
            `INSERT INTO products (title, slug, description, base_price, discount_percent, category_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
            [title, slug, description, parseFloat(base_price), parseFloat(discount_percent) || 0, category_id]
        );

        const productId = productRes.rows[0].id;
        const productSku = generateUniqueSku(catCode, productId);

        await client.query(`UPDATE products SET sku = $1 WHERE id = $2`, [productSku, productId]);

        // 2. variants table insert
        let finalVariants = variants;
        if(finalVariants.length === 0 && !total_quantity) {
            throw createHttpError(422, "enter product quantity");
        }

        if(finalVariants.length === 0)  {
            finalVariants = [{
                price_modifier: 0,
                quantity: total_quantity || 0,
                options: []
            }]
        }

        // product_variants, variant_options, and inventory table insertion inside this for of loop
        for (const variant of finalVariants) {
            //for generating variant sku like: TSH-A97B-001-RED-XL
            let variantSku = productSku;
            if(variant.options && variant.options.length >0) {
                const optSuffix = variant.options.map((o) => o.option_value.substring(0, 3).toUpperCase()).join("-");
                variantSku = `${productSku}-${optSuffix}`;
            }

            // 3. product_variants table insertion
            const productVariantRes = await client.query(`INSERT INTO product_variants (product_id, price_modifier, sku) VALUES ($1, $2, $3) RETURNING id`,
                [productId, parseFloat(variant.price_modifier) || 0, variantSku]
            );

            const variantId = productVariantRes.rows[0].id;

            // 4. variant_options table insertion
            if(variant.options && variant.options.length > 0){
                for (const option of variant.options) {
                    if(option.option_value){
                        await client.query(
                            `INSERT INTO variant_options (product_variant_id, option_name, option_value) VALUES ($1, $2, $3)`,
                            [variantId, option.option_name, option.option_value]
                        );
                    }
                    
                }
            }

            // 5. inventory table insertion
            await client.query(`INSERT INTO inventory (product_variant_id, quantity) VALUES ($1, $2)`,
                [variantId, parseInt(variant.quantity) || 0]
            );
 
        }

        // image handling (main and sub image)
        // here req.files is a js object not array
        const allFilesToUpload = [];
        if(req.files) {
            //main image process
            if(req.files.mainImage) {
                allFilesToUpload.push({
                    file: req.files.mainImage[0],
                    isMain: true,
                });
            }
            
            //sub images process
            if(req.files.subImages) {
                req.files.subImages.forEach((file) => {
                    allFilesToUpload.push({
                        file: file,
                        isMain: false,
                    });
                });
            }

        }

        //cloudinary upload
        //Promise.allSettled([promise1, promise2, ..]), it takes array of pending promises
        //returns array of object (i.e uploadRes = [])
        const uploadRes = await Promise.allSettled(
            allFilesToUpload.map((item) => cloudinaryFileUpload(item.file))
        );

        //pg library not support multiple row. pg-format library support it
        //for, for of, while loop supports async await. 
        for(let i = 0; i < uploadRes.length; i++) {

            const result = uploadRes[i];
            if(result.status === "fulfilled") {

                const {secure_url, public_id} = result.value;
                uploadedImages.push(public_id);

                //product_images table insert
                await client.query(
                    `INSERT INTO product_images (product_id, image_url, public_id, is_main) 
                    VALUES ($1, $2, $3, $4)`,
                    [productId, secure_url, public_id, allFilesToUpload[i].isMain]
                );
                

            }
            else {
                // in case of reject: result.status === 'rejected'
                console.error(`${i} index image upload failed: ${result.reason.message}`);
                //throw error for rollback
                throw createHttpError(500, `Image upload failed: ${result.reason}`);
            }

        }
        

        await client.query('COMMIT');

        successResponse(res, {
            statusCode: 201,
            message: "The product is successfully added",
            payload: {
                productId,
                title,
                productSku,

            }
        });


 
    } catch (error) {
        console.error("failed to create product:", error);
        if(client) {
            await client.query("ROLLBACK");
        }

        if(uploadedImages.length > 0) {
            console.warn(`Transaction failed. Attempting to clean up ${uploadedImages.length} images from Cloudinary.`);
            await Promise.all(
                uploadedImages.map((id) => cloudinaryFileDelete(id).catch((error) => {
                    console.error(`Failed to cleanup Cloudinary public ID ${id}: ${error.message}`)
                }))
            );
        }
        next(error);

        
    }
    finally {
        if(client) {
            client.release();
        }

    }


}