const { pool } = require('../config/db');

async function restoreTags() {
    try {
        console.log('--- Starting Tag Restoration ---');

        // Fetch all customized sections that might be missing tags
        const [aangepasteSecties] = await pool.query(`
            SELECT asub.aangepaste_sectie_id, asub.tekst_inhoud, s.tekst_content as original_content, s.titel
            FROM AangepasteSectie asub
            JOIN Sectie s ON asub.sectie_id = s.sectie_id
        `);

        for (const asub of aangepasteSecties) {
            const currentContent = asub.tekst_inhoud || '';
            const originalContent = asub.original_content || '';

            // Simple heuristic: if original has placeholders and current doesn't, 
            // and the text is semi-similar, we might have lost them.
            // But a safer way for this specific corruption is to check if [placeholder:...] 
            // strings in original are missing in current.

            const placeholderRegex = /\[placeholder:[a-z0-9_]+\]/g;
            const originalPlaceholders = originalContent.match(placeholderRegex) || [];
            const currentPlaceholders = currentContent.match(placeholderRegex) || [];

            if (originalPlaceholders.length > currentPlaceholders.length) {
                console.log(`Potential corruption in section "${asub.titel}" (ID: ${asub.aangepaste_sectie_id})`);

                // For Dossier 7, we know they are missing.
                // We can try to reconstruct by looking at the original structure.
                // If the text has been edited, a simple replacement might fail.
                // However, the user said they "disappeared", implying the rest of the text might be there.

                // Let's try a very basic restoration: if the text around the placeholder is the same, inject it back.
                // Or better: if the customize content is EXACTLY the original content minus tags, restore it.

                const strippedOriginal = originalContent.replace(placeholderRegex, '');
                // Clean both for comparison (remove extra whitespaces/newlines)
                const cleanStripped = strippedOriginal.replace(/\s+/g, ' ').trim();
                const cleanCurrent = currentContent.replace(/\s+/g, ' ').trim();

                if (cleanStripped === cleanCurrent || currentContent === strippedOriginal) {
                    console.log(`Restoring tags for section "${asub.titel}"...`);
                    await pool.query(
                        'UPDATE AangepasteSectie SET tekst_inhoud = ? WHERE aangepaste_sectie_id = ?',
                        [originalContent, asub.aangepaste_sectie_id]
                    );
                } else {
                    console.warn(`Content mismatch for section "${asub.titel}". Cannot auto-restore safely.`);
                    // console.log('Original (stripped):', cleanStripped.substring(0, 50));
                    // console.log('Current:', cleanCurrent.substring(0, 50));
                }
            }
        }

        console.log('--- Restoration Complete ---');
        process.exit(0);
    } catch (error) {
        console.error('Restoration failed:', error);
        process.exit(1);
    }
}

restoreTags();
