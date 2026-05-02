import "dotenv/config";
import app from "./src/app.js";
import pool from "./config/db.js";




const port = process.env.PORT || 4000;

(async () =>{
    try {

        await pool.query("SELECT NOW()");
        console.log("Neon Database connected successfully");

        app.listen(port, () =>{
            
            console.log(`server is running at http://localhost:${port}`);
        })

    } catch (error) {
        console.error("Failed to connect to database:", error.message);
        process.exit(1);
        
    }
})();


