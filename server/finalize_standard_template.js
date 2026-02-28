const { pool } = require("./config/db");

async function finalize() {
    try {
        console.log("Promoting template to standard CIB template...");
        
        // Find the template by name
        const [rows] = await pool.query("SELECT template_id FROM Template WHERE naam = '106VN_20260101_CIB_NL_133 (16)'");
        
        if (rows.length === 0) {
            console.log("Template not found. Please make sure the name is exact.");
            process.exit(1);
        }
        
        const templateId = rows[0].template_id;
        
        // Update to make it a standard CIB template
        await pool.query(
            "UPDATE Template SET account_id = NULL, source = 'CIB' WHERE template_id = ?",
            [templateId]
        );
        
        console.log(`Template ID ${templateId} successfully promoted to standard CIB template!`);
        process.exit(0);
    } catch (err) {
        console.error("Operation failed:", err);
        process.exit(1);
    }
}

finalize();
