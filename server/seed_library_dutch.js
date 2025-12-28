const { pool } = require('./config/db');

async function seed() {
    const dutchTags = [
        { sleutel: 'naam_verkoper', type: 'text', beschrijving: 'Naam van de verkoper(s)' },
        { sleutel: 'adres_verkoper', type: 'address', beschrijving: 'Adres van de verkoper(s)' },
        { sleutel: 'naam_koper', type: 'text', beschrijving: 'Naam van de koper(s)' },
        { sleutel: 'adres_koper', type: 'address', beschrijving: 'Adres van de koper(s)' },
        { sleutel: 'adres_eigendom', type: 'address', beschrijving: 'Adres van het verkochte onroerend goed' },
        { sleutel: 'kadastrale_gegevens', type: 'text', beschrijving: 'Afdeling, sectie en nummer van het perceel' },
        { sleutel: 'koopprijs', type: 'number', beschrijving: 'De overeengekomen verkoopprijs' },
        { sleutel: 'voorschot_bedrag', type: 'number', beschrijving: 'Bedrag van het betaalde voorschot' },
        { sleutel: 'datum_ondertekening', type: 'date', beschrijving: 'Datum waarop het compromis is getekend' },
        { sleutel: 'opschortende_voorwaarde_lening', type: 'text', beschrijving: 'Details over het verkrijgen van een lening' },
        { sleutel: 'epc_waarde', type: 'number', beschrijving: 'Energieprestatiecertificaat score' },
        { sleutel: 'keuring_elektriciteit_datum', type: 'date', beschrijving: 'Datum van het elektriciteitsattest' }
    ];

    try {
        console.log('Seeding Dutch tags into PlaceholderLibrary...');
        for (const tag of dutchTags) {
            await pool.query(`
                INSERT INTO PlaceholderLibrary (sleutel, type, beschrijving) 
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE type = VALUES(type), beschrijving = VALUES(beschrijving)
            `, [tag.sleutel, tag.type, tag.beschrijving]);
            console.log(`- Seeded: ${tag.sleutel}`);
        }
        console.log('Done.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seed();
