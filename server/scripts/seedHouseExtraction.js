const { pool } = require('../config/db');

// Mock Sections (copied from constants.ts MOCK_SECTIONS)
const MOCK_SECTIONS = [
    {
        id: 'sec1',
        title: 'Partijen',
        content: 'DE ONDERGETEKENDEN:\n\n1. De heer [placeholder:seller_firstname] [placeholder:seller_lastname], geboren te [placeholder:seller_birthplace] op [placeholder:seller_birthdate], wonende te [placeholder:seller_address]. Hierna gezamenlijk genoemd "de verkoper".\n\n2. De heer [placeholder:buyer1_firstname] [placeholder:buyer1_lastname], geboren te [placeholder:buyer1_birthplace] op [placeholder:buyer1_birthdate], en zijn echtgenote mevrouw [placeholder:buyer2_firstname] [placeholder:buyer2_lastname], geboren te [placeholder:buyer2_birthplace] op [placeholder:buyer2_birthdate], samenwonende te [placeholder:buyers_address]. Gehuwd onder het beheer van de scheiding van goederen met beperkte gemeenschap. Hierna gezamenlijk genoemd "de koper".',
        isApproved: false,
        placeholders: [
            { id: 'seller_firstname', label: 'Voornaam verkoper', currentValue: 'Jeu Alfons', sourceDoc: 'huis.docx', sourcePage: 1, confidence: 'High', isApproved: false },
            { id: 'seller_lastname', label: 'Achternaam verkoper', currentValue: 'LENS', sourceDoc: 'huis.docx', sourcePage: 1, confidence: 'High', isApproved: false },
            { id: 'seller_birthplace', label: 'Geboorteplaats verkoper', currentValue: 'Onze-Lieve-Vrouw-Waver', sourceDoc: 'huis.docx', sourcePage: 1, confidence: 'High', isApproved: false },
            { id: 'seller_birthdate', label: 'Geboortedatum verkoper', currentValue: '17 juni 1931', sourceDoc: 'huis.docx', sourcePage: 1, confidence: 'High', isApproved: false },
            { id: 'seller_address', label: 'Adres verkoper', currentValue: 'Schaben, Wordenfreinstienen 4/2', sourceDoc: 'huis.docx', sourcePage: 1, confidence: 'High', isApproved: false },
            { id: 'buyer1_firstname', label: 'Voornaam koper 1', currentValue: 'Stéphane Joseph Henri', sourceDoc: 'huis.docx', sourcePage: 1, confidence: 'High', isApproved: false },
            { id: 'buyer1_lastname', label: 'Achternaam koper 1', currentValue: 'VERELST', sourceDoc: 'huis.docx', sourcePage: 1, confidence: 'High', isApproved: false },
            { id: 'buyer1_birthplace', label: 'Geboorteplaats koper 1', currentValue: 'Mechelen', sourceDoc: 'huis.docx', sourcePage: 1, confidence: 'High', isApproved: false },
            { id: 'buyer1_birthdate', label: 'Geboortedatum koper 1', currentValue: '16 augustus 1964', sourceDoc: 'huis.docx', sourcePage: 1, confidence: 'High', isApproved: false },
            { id: 'buyer2_firstname', label: 'Voornaam koper 2', currentValue: 'An Maria Walter', sourceDoc: 'huis.docx', sourcePage: 1, confidence: 'High', isApproved: false },
            { id: 'buyer2_lastname', label: 'Achternaam koper 2', currentValue: 'VAN AS', sourceDoc: 'huis.docx', sourcePage: 1, confidence: 'High', isApproved: false },
            { id: 'buyer2_birthplace', label: 'Geboorteplaats koper 2', currentValue: 'Leuven', sourceDoc: 'huis.docx', sourcePage: 1, confidence: 'High', isApproved: false },
            { id: 'buyer2_birthdate', label: 'Geboortedatum koper 2', currentValue: '21 januari 1976', sourceDoc: 'huis.docx', sourcePage: 1, confidence: 'High', isApproved: false },
            { id: 'buyers_address', label: 'Adres kopers', currentValue: 'Sint-Katelijne-Waver (Onze-Lieve-Vrouw-Waver), Waverlaan 2', sourceDoc: 'huis.docx', sourcePage: 1, confidence: 'High', isApproved: false },
        ]
    },
    {
        id: 'sec2',
        title: 'Verkoopsvoorwerp',
        content: 'ZIJN OVEREENGEKOMEN WAT VOLGT:\n\nDe verkoper verklaart -- onder cumulatieve vervulling van nagemelde opschortende voorwaarde -- te verkopen, af te staan en over te dragen aan de koper, die aanvaardt -- ieder tot beloop van de onverdeelde helft in volle eigendom -- het hierna omschreven onroerend goed en dit onder de gewone waarborgen van daad en van recht, en voor vrij, zuiver en onbelast van alle voorrechten, hypotheken, bezwarende overschrijvingen of kantmeldingen en alle welkdanige lasten of schulden.',
        isApproved: false,
        placeholders: []
    },
    {
        id: 'sec3',
        title: 'Beschrijving van het goed',
        content: 'BESCHRIJVING VAN HET GOED:\n\nGemeente [placeholder:property_municipality] -- [placeholder:property_section], voorheen [placeholder:property_former_name]: Een perceel landbouwgrond met bunker, gelegen aan de [placeholder:property_street], gekadastreerd sectie [placeholder:cadastral_section] nr. [placeholder:cadastral_number], groot volgens titel [placeholder:property_size]. Hierna kortweg omschreven als "het goed" of "voorschreven goed".',
        isApproved: true,
        placeholders: [
            { id: 'property_municipality', label: 'Gemeente eigendom', currentValue: 'SINT-KATELIJNE-WAVER', sourceDoc: 'huis.docx', sourcePage: 2, confidence: 'High', isApproved: true },
            { id: 'property_section', label: 'Afdeling', currentValue: '3e afdeling', sourceDoc: 'huis.docx', sourcePage: 2, confidence: 'High', isApproved: true },
            { id: 'property_former_name', label: 'Vroegere naam', currentValue: 'ONZE-LIEVE-VROUW-WAVER', sourceDoc: 'huis.docx', sourcePage: 2, confidence: 'High', isApproved: true },
            { id: 'property_street', label: 'Straat eigendom', currentValue: 'Kegelslei', sourceDoc: 'huis.docx', sourcePage: 2, confidence: 'High', isApproved: true },
            { id: 'cadastral_section', label: 'Kadastrale sectie', currentValue: 'C', sourceDoc: 'huis.docx', sourcePage: 2, confidence: 'High', isApproved: true },
            { id: 'cadastral_number', label: 'Kadastraal nummer', currentValue: '98', sourceDoc: 'huis.docx', sourcePage: 2, confidence: 'High', isApproved: true },
            { id: 'property_size', label: 'Grootte eigendom', currentValue: 'één hectare vier are drieëndertig centiare (01 ha 04 a 33 ca)', sourceDoc: 'huis.docx', sourcePage: 2, confidence: 'High', isApproved: true },
        ]
    },
    {
        id: 'sec4',
        title: 'Voorwaarden: Toestand & Erfdienstbaarheden',
        content: 'VOORWAARDEN:\n\n1° Toestand -- Erfdienstbaarheden: Het goed wordt verkocht in de staat waarin het zich thans bevindt en onder meer:\n\n- zonder waarborg van maat en oppervlakte, al bedragen de verschillen één/twintigste of meer;\n- met alle voor- en nadelige erfdienstbaarheden;\n- met alle zichtbare en verborgen gebreken, zonder vrijwaring dezer;\n- met alle gemeenschappen.\n\nDe verkoper verklaart geen weet te hebben van het bestaan van erfdienstbaarheden en er zelf geen te hebben toegestaan.',
        isApproved: true,
        placeholders: []
    },
    {
        id: 'sec5',
        title: 'Voorwaarden: Eigendom, Bezit & Genot',
        content: '2° Eigendom -- Bezit -- Genot:\n\nDe koper treedt in het recht van eigendom van het voorschreven goed te rekenen vanaf de ondertekening van de notariële koop-verkoopakte en zal er ook te rekenen vanaf dan alle openbare lasten, gemeentelijke en andere belastingen en taksen van dragen en betalen. Niet-vervallen annuïteiten van verhaalbelastingen en andere gemeentelijke taksen of belastingen zijn voor rekening van de koper vanaf zelfde datum.\n\nDe verkoper verklaart dat er naar zijn weten thans geen verhaalbelastingen verschuldigd zijn noch betekend werden.\n\nDe verkoper verklaart tevens dat het goed, noch geheel noch gedeeltelijk, is onderworpen aan het wettelijk recht van voorkoop ingesteld door de wet op de landpacht.\n\nDe koper zal het genot hebben van voorschreven onroerend goed door de vrije beschikking en effectieve inbezitname vanaf de ondertekening van de notariële koop-verkoopakte en de volledige betaling van de verkoopprijs.',
        isApproved: false,
        placeholders: []
    },
    {
        id: 'sec6',
        title: 'Voorwaarden: Kosten & Stedenbouw',
        content: '3° Kosten:\n\nAlle kosten, rechten en erelonen waartoe deze verkoop kan aanleiding geven, zijn ten laste van de koper, evenals de eventuele opmetingskosten.\n\n4° Stedenbouw:\n\nIn geval van bouwen zal de koper zich moeten onderwerpen aan de beslissingen en reglementen van de bevoegde instanties.\n\nOm te voldoen aan de voorschriften van het "decreet houdende de organisatie van de ruimtelijke ordening" wordt er verklaard door de verkoper dat voor het niet-bebouwde gedeelte geen bouw-, verkavelings- en stedenbouwkundige vergunning werd afgeleverd.\n\nHet bij deze verkochte goed is volgens het gewestplan [placeholder:zoning_plan] gelegen in het [placeholder:zoning_designation] bestemd voor de landbouw.',
        isApproved: false,
        placeholders: [
            { id: 'zoning_plan', label: 'Gewestplan', currentValue: 'Mechelen', sourceDoc: 'huis.docx', sourcePage: 4, confidence: 'High', isApproved: false },
            { id: 'zoning_designation', label: 'Bestemming', currentValue: 'agrarisch gebied', sourceDoc: 'huis.docx', sourcePage: 4, confidence: 'High', isApproved: false },
        ]
    },
    {
        id: 'sec7',
        title: 'Voorwaarden: Bodem & Bescherming',
        content: '5° Verklaring inzake de bodemtoestand:\n\na) De verkoper verklaart dat er op de grond, die het voorwerp is van onderhavige akte, bij zijn weten geen inrichting gevestigd is of was, of geen activiteit wordt of werd uitgeoefend die opgenomen is in de lijst van inrichtingen en activiteiten die bodemverontreiniging kunnen veroorzaken, zoals bedoeld in artikel 3, §1, van het Bodemsaneringsdecreet.\n\nb) De verkoper verklaart met betrekking tot het verkochte goed geen weet te hebben van bodemverontreiniging die schade kan berokkenen aan de koper of aan derden, of die aanleiding kan geven tot een saneringsverplichting, tot gebruiksbeperkingen of tot andere maatregelen die de overheid in dit verband kan opleggen.\n\n6° Verklaring niet-bescherming:\n\nIn uitvoering van het decreet van 16 april 1996 inzake de bescherming van landschappen, verklaart de verkoper dat het bij deze verkochte goed niet gelegen is binnen een voorlopig beschermd landschap.\n\nIn uitvoering van het decreet van 3 maart 1976 verklaart de verkoper dat het goed niet opgenomen is in een lijst, noch voorontwerp of ontwerp van lijst van de voor bescherming vatbare monumenten, stads- en dorpsgezichten.',
        isApproved: true,
        placeholders: []
    },
    {
        id: 'sec8',
        title: 'Verkoopprijs',
        content: 'VERKOOPPRIJS:\n\nDeze verkoping is gedaan en aanvaard voor en mits de prijs van [placeholder:sale_price_words] ([placeholder:sale_price_amount]).\n\nDe koper verbindt zich ertoe binnen de acht dagen vanaf heden als waarborg voor de stipte uitvoering van zijn verplichtingen een bedrag van [placeholder:deposit_amount_words] ([placeholder:deposit_amount]) te storten op de bankrekeningnummer [placeholder:notary_account] van nagenoemde notaris [placeholder:notary_name]. De notaris die deze gelden in bewaring krijgt, plaatst ze op een bijzondere rekening die hij opent op naam van de koper tot bij de ondertekening van de notariële koop-verkoopakte.\n\nHet saldo van de verkoopprijs verbindt de koper zich te betalen bij de ondertekening van de notariële koop-verkoopakte.',
        isApproved: false,
        placeholders: [
            { id: 'sale_price_words', label: 'Verkoopprijs (woorden)', currentValue: 'VIERENTWINTIGDUIZEND VIJFHONDERD EURO', sourceDoc: 'huis.docx', sourcePage: 5, confidence: 'High', isApproved: false },
            { id: 'sale_price_amount', label: 'Verkoopprijs (cijfers)', currentValue: '24.500,00 EUR', sourceDoc: 'huis.docx', sourcePage: 5, confidence: 'High', isApproved: false },
            { id: 'deposit_amount_words', label: 'Waarborgbedrag (woorden)', currentValue: 'TWEEDUIZEND VIERHONDERDVIJFTIG EURO', sourceDoc: 'huis.docx', sourcePage: 5, confidence: 'High', isApproved: false },
            { id: 'deposit_amount', label: 'Waarborgbedrag (cijfers)', currentValue: '2.450,00 EUR', sourceDoc: 'huis.docx', sourcePage: 5, confidence: 'High', isApproved: false },
            { id: 'notary_account', label: 'Rekeningnummer notaris', currentValue: '230-0122700-15', sourceDoc: 'huis.docx', sourcePage: 5, confidence: 'High', isApproved: false },
            { id: 'notary_name', label: 'Naam notaris', currentValue: 'André Costa', sourceDoc: 'huis.docx', sourcePage: 5, confidence: 'High', isApproved: false },
        ]
    },
    {
        id: 'sec9',
        title: 'Sancties bij niet-naleving',
        content: 'Ingeval van vertraging van de betaling zal de koper een verwijlvergoeding verschuldigd zijn aan de verkoper van tien frank ten honderd (10 %) \'s jaars op de nog verschuldigde koopprijs, behoudens wanneer deze vertraging te wijten is aan de verkoper. Deze verwijlvergoeding wordt berekend per dag vertraging en voor een jaar worden 365 dagen gerekend.\n\nIngeval van niet-naleving door één van de partijen van de bij deze aangegane verbintenissen en na ingebrekestelling bij aangetekend schrijven of deurwaardersexploot, welk zonder gevolg gelaten werd gedurende een periode van vijftien dagen, zal deze verkoping van rechtswege ontbonden zijn. In dit geval zal een som gelijk aan tien ten honderd van de verkoopprijs aan de niet-ingebreke gebleven partij toekomen ten titel van schadevergoeding.\n\nPartijen behouden zich nochtans het recht voor de gedwongen uitvoering van deze overeenkomst te vervolgen.',
        isApproved: true,
        placeholders: []
    },
    {
        id: 'sec10',
        title: 'Notariële Akte',
        content: 'NOTARIËLE AKTE:\n\nPartijen, die ervan kennis dragen dat ieder van hen het recht heeft zijn eigen notaris te kiezen -- zonder verhoging van kosten --, stellen beiden aan notaris [placeholder:notary_fullname] te [placeholder:notary_address].\n\nDe notariële koop-verkoopakte dient verleden te worden op voorstel van de instrumenterende notaris binnen de drie maand vanaf de vervulling van nagemelde opschortende voorwaarden.',
        isApproved: false,
        placeholders: [
            { id: 'notary_fullname', label: 'Volledige naam notaris', currentValue: 'André Costa', sourceDoc: 'huis.docx', sourcePage: 6, confidence: 'High', isApproved: false },
            { id: 'notary_address', label: 'Adres notaris', currentValue: '2861 Onze-Lieve-Vrouw-Waver, Dijk 34', sourceDoc: 'huis.docx', sourcePage: 6, confidence: 'High', isApproved: false },
        ]
    },
    {
        id: 'sec11',
        title: 'Opschortende Voorwaarden',
        content: 'OPSCHORTENDE VOORWAARDEN:\n\nOm te voldoen aan artikel 36 van het Vlaams Bodemsaneringsdecreet komen partijen overeen dat deze verkoop wordt gedaan onder de opschortende voorwaarde dat voor het bij deze verkochte goed door de Openbare Afvalstoffenmaatschappij van het Vlaams Gewest (OVAM) een bodemattest wordt afgeleverd waaruit blijkt:\n\n- hetzij dat voor het betrokken goed geen gegevens beschikbaar zijn;\n- hetzij dat voor het betrokken goed geen bodemverontreiniging werd vastgesteld die de bodemsaneringsnormen overschrijdt of dreigt te overschrijden, of die een ernstige bedreiging vormt.\n\nDe verkoper verbind zich ertoe dit bodemattest zonder uitstel aan te vragen en de inhoud ervan mee te delen aan de koper binnen de maand te rekenen vanaf heden.',
        isApproved: true,
        placeholders: []
    },
    {
        id: 'sec12',
        title: 'Verzekering',
        content: 'Verzekering in geval van overlijden bij ongeval van de koper:\n\nDe koper erkent dat de notaris die de verkoopovereenkomst heeft opgesteld en waarvan de naam voorkomt, hem op de hoogte gebracht heeft van een ongevallenverzekering onderschreven bij de C.V.B.A. "Verzekeringen van het Notariaat" ingevolge een polis op naam van de notaris en waarvan de hoofdkenmerken hierna weergegeven worden:\n\n- de verzekering is kosteloos voor de koper;\n- verzekerd risico: overlijden door ongeval;\n- verzekerde personen: kopers natuurlijke personen;\n- duur van de dekking: vanaf het ondertekenen van de verkoopovereenkomst tot aan de ondertekening van de authentieke akte van aankoop met een maximumduur van vier maanden na ondertekening van de verkoopovereenkomst.',
        isApproved: false,
        placeholders: []
    },
    {
        id: 'sec13',
        title: 'Ondertekening',
        content: 'Opgemaakt in drie exemplaren, waarvan elke partij verklaart minstens één exemplaar te hebben ontvangen, te [placeholder:signing_location] op [placeholder:signing_date].\n\nGelezen en goedgekeurd [handtekening verkoper]\nGelezen en goedgekeurd [handtekening koper 1]\nGelezen en goedgekeurd [handtekening koper 2]',
        isApproved: false,
        placeholders: [
            { id: 'signing_location', label: 'Plaats ondertekening', currentValue: 'Sint-Katelijne-Waver (Onze-Lieve-Vrouw-Waver)', sourceDoc: 'huis.docx', sourcePage: 8, confidence: 'High', isApproved: false },
            { id: 'signing_date', label: 'Datum ondertekening', currentValue: '26 februari 2003', sourceDoc: 'huis.docx', sourcePage: 8, confidence: 'High', isApproved: false },
        ]
    }
];

// Cleaned Sections (as per constants.ts HOUSE_EXTRACTION_SECTIONS)
const HOUSE_EXTRACTION_SECTIONS = MOCK_SECTIONS.map(section => ({
    ...section,
    isApproved: false,
    placeholders: section.placeholders ? section.placeholders.map(p => ({
        ...p,
        currentValue: '', // Reset value
        sourceDoc: '',
        sourcePage: 0,
        isApproved: false,
        confidence: 'Low'
    })) : []
}));


const seedHouseExtraction = async () => {
    try {
        console.log("🚀 Starting Seed: Extractie Huis Template...");

        const template = {
            ui_id: 'tmpl-house-extraction',
            name: 'Extractie Huis',
            description: 'Template gebaseerd op de standaard extractie van een huis',
            sections: JSON.stringify(HOUSE_EXTRACTION_SECTIONS),
            is_ai_suggested: false
        };

        // Check if exists
        const [existing] = await pool.query("SELECT template_id FROM Template WHERE ui_id = ?", [template.ui_id]);

        if (existing.length > 0) {
            // Update
            await pool.query(`
                UPDATE Template 
                SET naam = ?, description = ?, sections = ?, is_ai_suggested = ?
                WHERE ui_id = ?
            `, [template.name, template.description, template.sections, template.is_ai_suggested, template.ui_id]);
            console.log("✅ Updated 'Extractie Huis' template.");
        } else {
            // Insert
            await pool.query(`
                INSERT INTO Template (naam, description, sections, is_ai_suggested, ui_id)
                VALUES (?, ?, ?, ?, ?)
            `, [template.name, template.description, template.sections, template.is_ai_suggested, template.ui_id]);
            console.log("✅ Inserted 'Extractie Huis' template.");
        }

        process.exit(0);

    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
};

seedHouseExtraction();
