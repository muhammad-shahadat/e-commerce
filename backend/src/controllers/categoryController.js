import { successResponse } from "./responseController.js";
import pool from "../../config/db.js";

export const handleGetCategories = async (req, res, next) => {
    try {

        const result = await pool.query(`
            SELECT id, name, slug, parent_id FROM categories
            ORDER BY created_at DESC;

        `);


        successResponse(res, {
            statusCode: 200,
            message: result.rows.length ? "Categories were fetched successfully." : "category not found",
            payload: result.rows,
        })
        
    } catch (error) {
        next(error)
        
    }

}