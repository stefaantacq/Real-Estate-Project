const { pool } = require("./config/db");

async function rename() {
    try {
        console.log("Renaming standard CIB template...");
        
        // Find the template by its current name and source
        const [rows] = await pool.query("SELECT template_id FROM Template WHERE naam = '106VN_20260101_CIB_NL_133 (16)' AND source = 'CIB'");
        
        if (rows.length === 0) {
            console.log("Template not found with the specified name.");
            process.exit(1);
        }
        
        const templateId = rows[0].template_id;
        
        // Update the name
        await pool.query(
            "UPDATE Template SET naam = 'CIB template 1', titel = 'CIB template 1' WHERE template_id = ?",
            [templateId]
        );
        
        console.log(`Template ID ${templateId} successfully renamed to 'CIB template 1'!`);
        process.exit(0);
    } catch (err) {
        console.error("Operation failed:", err);
        process.exit(1);
    }
}

rename();
