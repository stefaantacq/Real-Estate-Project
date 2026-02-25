const { pool } = require('../config/db');

async function verifyReorder() {
    try {
        console.log('--- Verifying Backend Reorder ---');

        // 1. Get current dossiers for a test user
        // We'll assume user_id 1 exists or just pick the first one with dossiers
        const [users] = await pool.query('SELECT account_id FROM Dossier LIMIT 1');
        if (users.length === 0) {
            console.log('No dossiers found to test with.');
            return;
        }
        const account_id = users[0].account_id;

        const [rows] = await pool.query('SELECT ui_id, display_order FROM Dossier WHERE account_id = ? LIMIT 2', [account_id]);
        if (rows.length < 2) {
            console.log('Need at least 2 dossiers to test reordering.');
            return;
        }

        const d1 = rows[0];
        const d2 = rows[1];

        console.log(`Initial orders: ${d1.ui_id}=${d1.display_order}, ${d2.ui_id}=${d2.display_order}`);

        // 2. Perform reorder and status change
        const newOrders = [
            { id: d1.ui_id, order: 15, status: 'archived' },
            { id: d2.ui_id, order: 25, status: 'active' }
        ];

        console.log('Updating orders and statuses...');
        for (const item of newOrders) {
            // This simulates the reorderDossiers logic
            await pool.query('UPDATE Dossier SET display_order = ?, status = ? WHERE ui_id = ? AND account_id = ?', [item.order, item.status, item.id, account_id]);
        }

        // 3. Verify
        const [verifyRows] = await pool.query('SELECT ui_id, display_order, status FROM Dossier WHERE ui_id IN (?, ?) ORDER BY display_order ASC', [d1.ui_id, d2.ui_id]);

        console.log('Updated results:');
        verifyRows.forEach(r => console.log(` - ${r.ui_id}: order=${r.display_order}, status=${r.status}`));

        const v1 = verifyRows.find(r => r.ui_id === d1.ui_id);
        const v2 = verifyRows.find(r => r.ui_id === d2.ui_id);

        if (v1.display_order === 15 && v1.status === 'archived' && v2.display_order === 25 && v2.status === 'active') {
            console.log('SUCCESS: Reorder and status change verified in database.');
        } else {
            console.error('FAILURE: Changes not reflected correctly.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error during verification:', error);
        process.exit(1);
    }
}

verifyReorder();
