import { Language } from './types';

export interface DocumentDefinition {
    id: string;
    label: string;
    category: string;
    synonyms: string[];
}

export const getDocumentChecklist = (lang: Language): DocumentDefinition[] => {
    const categories = {
        [Language.NL]: {
            ownership: 'Eigendom & juridische titel',
            identification: 'Identificatie van het goed',
            urbanPlanning: 'Stedenbouw & ruimtelijke ordening',
            mandatoryCertificates: 'Verplichte attesten',
            technical: 'Technische & bouwkundige documenten',
            rental: 'Huur & gebruik',
            apartment: 'Appartement / mede-eigendom',
            commercial: 'Handelspand-specifiek',
            fiscal: 'Fiscaal & financieel',
            other: 'Overige / bijzondere situaties',
        },
        [Language.FR]: {
            ownership: 'Propriété & titre juridique',
            identification: 'Identification du bien',
            urbanPlanning: 'Urbanisme & aménagement du territoire',
            mandatoryCertificates: 'Attestations obligatoires',
            technical: 'Documents techniques & de construction',
            rental: 'Location & usage',
            apartment: 'Appartement / copropriété',
            commercial: 'Spécifique commerce',
            fiscal: 'Fiscal & financier',
            other: 'Autres / situations particulières',
        },
        [Language.EN]: {
            ownership: 'Ownership & legal title',
            identification: 'Property identification',
            urbanPlanning: 'Urban planning & zoning',
            mandatoryCertificates: 'Mandatory certificates',
            technical: 'Technical & construction documents',
            rental: 'Rental & usage',
            apartment: 'Apartment / co-ownership',
            commercial: 'Commercial property specific',
            fiscal: 'Fiscal & financial',
            other: 'Other / special situations',
        },
    };

    const docs = {
        [Language.NL]: {
            // Eigendom & juridische titel
            eigendomsakte: 'Eigendomsakte',
            vorige_notariele_akte: 'Vorige notariële akte',
            hypothecaire_staat: 'Hypothecaire staat',
            erfdienstbaarheden: 'Overzicht erfdienstbaarheden',
            volmacht: 'Volmacht',

            // Identificatie van het goed
            kadastraal_uittreksel: 'Kadastraal uittreksel',
            kadastraal_plan: 'Kadastraal plan',
            kadastrale_legger: 'Kadastrale legger',
            beschrijving_goed: 'Beschrijving van het goed',

            // Stedenbouw & ruimtelijke ordening
            stedenbouwkundige_inlichtingen: 'Stedenbouwkundige inlichtingen',
            vergunningenregister: 'Uittreksel vergunningenregister',
            plannenregister: 'Uittreksel plannenregister',
            verkavelingsvergunning: 'Verkavelingsvergunning',
            bestemmingsvoorschriften: 'Bestemmingsvoorschriften',
            stedenbouwkundige_overtredingen: 'Verklaring stedenbouwkundige overtredingen',
            voorkooprecht: 'Verklaring voorkooprecht',
            overstromingsgevoeligheidsrapport: 'Overstromingsgevoeligheidsrapport',
            watertoets_stedenbouw: 'Watertoets',

            // Verplichte attesten
            epc: 'Energieprestatiecertificaat (EPC)',
            elektrisch_keuringsattest: 'Elektrisch keuringsattest',
            bodemattest: 'Bodemattest (OVAM)',
            asbestattest: 'Asbestattest',
            watertoets_attest: 'Watertoets / Overstromingsrapport',

            // Technische & bouwkundige documenten
            post_interventiedossier: 'Post-interventiedossier (PID)',
            epb_aangifte: 'EPB-aangifte',
            bouwvergunning: 'Bouwvergunning',
            regularisatiedocumenten: 'Regularisatiedocumenten',
            stabiliteitsstudie: 'Stabiliteitsstudie',

            // Huur & gebruik
            huurovereenkomst_woning: 'Huurovereenkomst woning',
            huurovereenkomst_handel: 'Huurovereenkomst handel',
            registratie_huurovereenkomst: 'Registratie huurovereenkomst',
            huurwaarborg: 'Overzicht huurwaarborg',

            // Appartement / mede-eigendom
            basisakte: 'Basisakte',
            splitsingsakte: 'Splitsingsakte',
            reglement_mede_eigendom: 'Reglement van mede-eigendom',
            huishoudelijk_reglement: 'Huishoudelijk reglement',
            verslag_vme: 'Verslag laatste algemene vergadering VME',
            jaarrekening_vme: 'Jaarrekening VME',
            afrekening_lasten: 'Afrekening gemeenschappelijke lasten',
            reservefonds: 'Overzicht reservefonds',
            werkkapitaal: 'Overzicht werkkapitaal',
            achterstallige_bijdragen: 'Verklaring achterstallige bijdragen',
            gerechtelijke_procedures_vme: 'Verklaring lopende gerechtelijke procedures VME',

            // Handelspand-specifiek
            exploitatievergunning: 'Exploitatievergunning',
            vestigingsvergunning: 'Vestigingsvergunning',
            omgevingsvergunning_milieu: 'Omgevingsvergunning milieu',
            vlarem_indeling: 'Vlarem-indelingsdocument',
            brandveiligheidsattest: 'Brandveiligheidsattest',
            keuringsattest_gas: 'Keuringsattest gasinstallatie',
            keuringsattest_lift: 'Keuringsattest lift',

            // Fiscaal & financieel
            berekening_registratierechten: 'Berekening registratierechten',
            kostenraming_notaris: 'Kostenraming notaris',
            betalingsbewijs_voorschot: 'Betalingsbewijs voorschot',

            // Overige / bijzondere situaties
            erfenisakte: 'Erfenisakte',
            akte_verdeling: 'Akte van verdeling',
            pachtcontract: 'Pachtcontract',
            onteigeningsplan: 'Onteigeningsplan',
            bewindvoerdersbesluit: 'Bewindvoerdersbesluit',
            verkoopbeslissing_vennootschap: 'Verkoopbeslissing vennootschap',
            overdracht_handelsfonds: 'Overdracht handelsfonds',
        },
        [Language.FR]: {
            // Propriété & titre juridique
            eigendomsakte: 'Acte de propriété',
            vorige_notariele_akte: 'Acte notarié précédent',
            hypothecaire_staat: 'État hypothécaire',
            erfdienstbaarheden: 'Aperçu des servitudes',
            volmacht: 'Procuration',

            // Identification du bien
            kadastraal_uittreksel: 'Extrait cadastral',
            kadastraal_plan: 'Plan cadastral',
            kadastrale_legger: 'Registre cadastral',
            beschrijving_goed: 'Description du bien',

            // Urbanisme & aménagement du territoire
            stedenbouwkundige_inlichtingen: 'Renseignements urbanistiques',
            vergunningenregister: 'Extrait du registre des permis',
            plannenregister: 'Extrait du registre des plans',
            verkavelingsvergunning: 'Permis de lotir',
            bestemmingsvoorschriften: 'Prescriptions de destination',
            stedenbouwkundige_overtredingen: 'Déclaration d\'infractions urbanistiques',
            voorkooprecht: 'Déclaration de droit de préemption',
            overstromingsgevoeligheidsrapport: 'Rapport de sensibilité aux inondations',
            watertoets_stedenbouw: 'Test de l\'eau',

            // Attestations obligatoires
            epc: 'Certificat de performance énergétique (PEB)',
            elektrisch_keuringsattest: 'Certificat de contrôle électrique',
            bodemattest: 'Attestation du sol (OVAM)',
            asbestattest: 'Attestation amiante',
            watertoets_attest: 'Test de l\'eau / Rapport d\'inondation',

            // Documents techniques & de construction
            post_interventiedossier: 'Dossier post-intervention (PID)',
            epb_aangifte: 'Déclaration PEB',
            bouwvergunning: 'Permis de construire',
            regularisatiedocumenten: 'Documents de régularisation',
            stabiliteitsstudie: 'Étude de stabilité',

            // Location & usage
            huurovereenkomst_woning: 'Contrat de bail résidentiel',
            huurovereenkomst_handel: 'Contrat de bail commercial',
            registratie_huurovereenkomst: 'Enregistrement du bail',
            huurwaarborg: 'Aperçu de la garantie locative',

            // Appartement / copropriété
            basisakte: 'Acte de base',
            splitsingsakte: 'Acte de division',
            reglement_mede_eigendom: 'Règlement de copropriété',
            huishoudelijk_reglement: 'Règlement d\'ordre intérieur',
            verslag_vme: 'Procès-verbal de la dernière AG de l\'ACP',
            jaarrekening_vme: 'Comptes annuels de l\'ACP',
            afrekening_lasten: 'Décompte des charges communes',
            reservefonds: 'Aperçu du fonds de réserve',
            werkkapitaal: 'Aperçu du fonds de roulement',
            achterstallige_bijdragen: 'Déclaration de contributions arriérées',
            gerechtelijke_procedures_vme: 'Déclaration de procédures judiciaires en cours ACP',

            // Spécifique commerce
            exploitatievergunning: 'Permis d\'exploitation',
            vestigingsvergunning: 'Permis d\'établissement',
            omgevingsvergunning_milieu: 'Permis d\'environnement',
            vlarem_indeling: 'Document de classification VLAREM',
            brandveiligheidsattest: 'Certificat de sécurité incendie',
            keuringsattest_gas: 'Certificat de contrôle de l\'installation de gaz',
            keuringsattest_lift: 'Certificat de contrôle de l\'ascenseur',

            // Fiscal & financier
            berekening_registratierechten: 'Calcul des droits d\'enregistrement',
            kostenraming_notaris: 'Estimation des frais de notaire',
            betalingsbewijs_voorschot: 'Preuve de paiement de l\'acompte',

            // Autres / situations particulières
            erfenisakte: 'Acte de succession',
            akte_verdeling: 'Acte de partage',
            pachtcontract: 'Contrat de bail rural',
            onteigeningsplan: 'Plan d\'expropriation',
            bewindvoerdersbesluit: 'Décision d\'administrateur',
            verkoopbeslissing_vennootschap: 'Décision de vente de la société',
            overdracht_handelsfonds: 'Transfert de fonds de commerce',
        },
        [Language.EN]: {
            // Ownership & legal title
            eigendomsakte: 'Deed of ownership',
            vorige_notariele_akte: 'Previous notarial deed',
            hypothecaire_staat: 'Mortgage statement',
            erfdienstbaarheden: 'Overview of easements',
            volmacht: 'Power of attorney',

            // Property identification
            kadastraal_uittreksel: 'Cadastral extract',
            kadastraal_plan: 'Cadastral plan',
            kadastrale_legger: 'Cadastral register',
            beschrijving_goed: 'Property description',

            // Urban planning & zoning
            stedenbouwkundige_inlichtingen: 'Urban planning information',
            vergunningenregister: 'Permit register extract',
            plannenregister: 'Plans register extract',
            verkavelingsvergunning: 'Subdivision permit',
            bestemmingsvoorschriften: 'Zoning regulations',
            stedenbouwkundige_overtredingen: 'Declaration of urban planning violations',
            voorkooprecht: 'Declaration of pre-emption right',
            overstromingsgevoeligheidsrapport: 'Flood sensitivity report',
            watertoets_stedenbouw: 'Water test',

            // Mandatory certificates
            epc: 'Energy Performance Certificate (EPC)',
            elektrisch_keuringsattest: 'Electrical inspection certificate',
            bodemattest: 'Soil certificate (OVAM)',
            asbestattest: 'Asbestos certificate',
            watertoets_attest: 'Water test / Flood report',

            // Technical & construction documents
            post_interventiedossier: 'Post-intervention file (PID)',
            epb_aangifte: 'EPB declaration',
            bouwvergunning: 'Building permit',
            regularisatiedocumenten: 'Regularization documents',
            stabiliteitsstudie: 'Stability study',

            // Rental & usage
            huurovereenkomst_woning: 'Residential lease agreement',
            huurovereenkomst_handel: 'Commercial lease agreement',
            registratie_huurovereenkomst: 'Lease registration',
            huurwaarborg: 'Rental deposit overview',

            // Apartment / co-ownership
            basisakte: 'Base deed',
            splitsingsakte: 'Division deed',
            reglement_mede_eigendom: 'Co-ownership regulations',
            huishoudelijk_reglement: 'Internal regulations',
            verslag_vme: 'Minutes of last general meeting HOA',
            jaarrekening_vme: 'Annual accounts HOA',
            afrekening_lasten: 'Common charges statement',
            reservefonds: 'Reserve fund overview',
            werkkapitaal: 'Working capital overview',
            achterstallige_bijdragen: 'Declaration of outstanding contributions',
            gerechtelijke_procedures_vme: 'Declaration of ongoing legal proceedings HOA',

            // Commercial property specific
            exploitatievergunning: 'Operating permit',
            vestigingsvergunning: 'Establishment permit',
            omgevingsvergunning_milieu: 'Environmental permit',
            vlarem_indeling: 'VLAREM classification document',
            brandveiligheidsattest: 'Fire safety certificate',
            keuringsattest_gas: 'Gas installation inspection certificate',
            keuringsattest_lift: 'Elevator inspection certificate',

            // Fiscal & financial
            berekening_registratierechten: 'Calculation of registration fees',
            kostenraming_notaris: 'Notary cost estimate',
            betalingsbewijs_voorschot: 'Proof of down payment',

            // Other / special situations
            erfenisakte: 'Inheritance deed',
            akte_verdeling: 'Deed of division',
            pachtcontract: 'Lease contract',
            onteigeningsplan: 'Expropriation plan',
            bewindvoerdersbesluit: 'Administrator decision',
            verkoopbeslissing_vennootschap: 'Company sale decision',
            overdracht_handelsfonds: 'Transfer of business goodwill',
        },
    };

    const cat = categories[lang];
    const d = docs[lang];

    return [
        // Eigendom & juridische titel
        { id: 'eigendomsakte', label: d.eigendomsakte, category: cat.ownership, synonyms: ['eigendom', 'akte', 'deed', 'propriété', 'acte'] },
        { id: 'vorige_notariele_akte', label: d.vorige_notariele_akte, category: cat.ownership, synonyms: ['notarieel', 'notaris', 'akte', 'notarial', 'notaire'] },
        { id: 'hypothecaire_staat', label: d.hypothecaire_staat, category: cat.ownership, synonyms: ['hypotheek', 'hypothecaire', 'mortgage', 'hypothécaire'] },
        { id: 'erfdienstbaarheden', label: d.erfdienstbaarheden, category: cat.ownership, synonyms: ['erfdienstbaarheid', 'erfdienstbaarheden', 'easement', 'servitude'] },
        { id: 'volmacht', label: d.volmacht, category: cat.ownership, synonyms: ['volmacht', 'power', 'attorney', 'procuration'] },

        // Identificatie van het goed
        { id: 'kadastraal_uittreksel', label: d.kadastraal_uittreksel, category: cat.identification, synonyms: ['kadaster', 'kadastraal', 'uittreksel', 'cadastral', 'extract'] },
        { id: 'kadastraal_plan', label: d.kadastraal_plan, category: cat.identification, synonyms: ['kadaster', 'plan', 'cadastral'] },
        { id: 'kadastrale_legger', label: d.kadastrale_legger, category: cat.identification, synonyms: ['legger', 'kadaster', 'register', 'cadastral'] },
        { id: 'beschrijving_goed', label: d.beschrijving_goed, category: cat.identification, synonyms: ['beschrijving', 'description', 'property'] },

        // Stedenbouw & ruimtelijke ordening
        { id: 'stedenbouwkundige_inlichtingen', label: d.stedenbouwkundige_inlichtingen, category: cat.urbanPlanning, synonyms: ['stedenbouw', 'inlichtingen', 'urban', 'planning', 'urbanisme'] },
        { id: 'vergunningenregister', label: d.vergunningenregister, category: cat.urbanPlanning, synonyms: ['vergunning', 'register', 'permit'] },
        { id: 'plannenregister', label: d.plannenregister, category: cat.urbanPlanning, synonyms: ['plannen', 'register', 'plans'] },
        { id: 'verkavelingsvergunning', label: d.verkavelingsvergunning, category: cat.urbanPlanning, synonyms: ['verkaveling', 'vergunning', 'subdivision', 'lotir'] },
        { id: 'bestemmingsvoorschriften', label: d.bestemmingsvoorschriften, category: cat.urbanPlanning, synonyms: ['bestemming', 'voorschrift', 'zoning', 'destination'] },
        { id: 'stedenbouwkundige_overtredingen', label: d.stedenbouwkundige_overtredingen, category: cat.urbanPlanning, synonyms: ['overtreding', 'stedenbouw', 'violation', 'infraction'] },
        { id: 'voorkooprecht', label: d.voorkooprecht, category: cat.urbanPlanning, synonyms: ['voorkooprecht', 'preemption', 'préemption'] },
        { id: 'overstromingsgevoeligheidsrapport', label: d.overstromingsgevoeligheidsrapport, category: cat.urbanPlanning, synonyms: ['overstroming', 'gevoeligheid', 'flood', 'inondation'] },
        { id: 'watertoets_stedenbouw', label: d.watertoets_stedenbouw, category: cat.urbanPlanning, synonyms: ['watertoets', 'water', 'test'] },

        // Verplichte attesten
        { id: 'epc', label: d.epc, category: cat.mandatoryCertificates, synonyms: ['epc', 'energie', 'prestatie', 'energy', 'performance', 'peb'] },
        { id: 'elektrisch_keuringsattest', label: d.elektrisch_keuringsattest, category: cat.mandatoryCertificates, synonyms: ['elektrisch', 'keuring', 'elektriciteit', 'electrical', 'électrique'] },
        { id: 'bodemattest', label: d.bodemattest, category: cat.mandatoryCertificates, synonyms: ['bodem', 'ovam', 'soil', 'sol'] },
        { id: 'asbestattest', label: d.asbestattest, category: cat.mandatoryCertificates, synonyms: ['asbest', 'asbestos', 'amiante'] },
        { id: 'watertoets_attest', label: d.watertoets_attest, category: cat.mandatoryCertificates, synonyms: ['watertoets', 'overstroming', 'water', 'flood'] },

        // Technische & bouwkundige documenten
        { id: 'post_interventiedossier', label: d.post_interventiedossier, category: cat.technical, synonyms: ['pid', 'post', 'interventie', 'intervention'] },
        { id: 'epb_aangifte', label: d.epb_aangifte, category: cat.technical, synonyms: ['epb', 'aangifte', 'declaration', 'peb'] },
        { id: 'bouwvergunning', label: d.bouwvergunning, category: cat.technical, synonyms: ['bouw', 'vergunning', 'building', 'permit', 'construire'] },
        { id: 'regularisatiedocumenten', label: d.regularisatiedocumenten, category: cat.technical, synonyms: ['regularisatie', 'regularization', 'régularisation'] },
        { id: 'stabiliteitsstudie', label: d.stabiliteitsstudie, category: cat.technical, synonyms: ['stabiliteit', 'studie', 'stability', 'stabilité'] },

        // Huur & gebruik
        { id: 'huurovereenkomst_woning', label: d.huurovereenkomst_woning, category: cat.rental, synonyms: ['huur', 'woning', 'overeenkomst', 'lease', 'rental', 'bail'] },
        { id: 'huurovereenkomst_handel', label: d.huurovereenkomst_handel, category: cat.rental, synonyms: ['huur', 'handel', 'overeenkomst', 'commercial', 'lease'] },
        { id: 'registratie_huurovereenkomst', label: d.registratie_huurovereenkomst, category: cat.rental, synonyms: ['registratie', 'huur', 'registration', 'enregistrement'] },
        { id: 'huurwaarborg', label: d.huurwaarborg, category: cat.rental, synonyms: ['waarborg', 'huur', 'deposit', 'garantie'] },

        // Appartement / mede-eigendom
        { id: 'basisakte', label: d.basisakte, category: cat.apartment, synonyms: ['basis', 'akte', 'base', 'deed'] },
        { id: 'splitsingsakte', label: d.splitsingsakte, category: cat.apartment, synonyms: ['splitsing', 'akte', 'division', 'deed'] },
        { id: 'reglement_mede_eigendom', label: d.reglement_mede_eigendom, category: cat.apartment, synonyms: ['reglement', 'mede-eigendom', 'co-ownership', 'copropriété'] },
        { id: 'huishoudelijk_reglement', label: d.huishoudelijk_reglement, category: cat.apartment, synonyms: ['huishoudelijk', 'reglement', 'internal', 'regulations'] },
        { id: 'verslag_vme', label: d.verslag_vme, category: cat.apartment, synonyms: ['vme', 'vergadering', 'verslag', 'minutes', 'hoa', 'acp'] },
        { id: 'jaarrekening_vme', label: d.jaarrekening_vme, category: cat.apartment, synonyms: ['jaarrekening', 'vme', 'annual', 'accounts'] },
        { id: 'afrekening_lasten', label: d.afrekening_lasten, category: cat.apartment, synonyms: ['afrekening', 'lasten', 'charges', 'statement'] },
        { id: 'reservefonds', label: d.reservefonds, category: cat.apartment, synonyms: ['reservefonds', 'reserve', 'fund', 'réserve'] },
        { id: 'werkkapitaal', label: d.werkkapitaal, category: cat.apartment, synonyms: ['werkkapitaal', 'working', 'capital', 'roulement'] },
        { id: 'achterstallige_bijdragen', label: d.achterstallige_bijdragen, category: cat.apartment, synonyms: ['achterstallig', 'bijdrage', 'outstanding', 'contributions'] },
        { id: 'gerechtelijke_procedures_vme', label: d.gerechtelijke_procedures_vme, category: cat.apartment, synonyms: ['gerechtelijk', 'procedure', 'vme', 'legal', 'proceedings'] },

        // Handelspand-specifiek
        { id: 'exploitatievergunning', label: d.exploitatievergunning, category: cat.commercial, synonyms: ['exploitatie', 'vergunning', 'operating', 'permit'] },
        { id: 'vestigingsvergunning', label: d.vestigingsvergunning, category: cat.commercial, synonyms: ['vestiging', 'vergunning', 'establishment', 'permit'] },
        { id: 'omgevingsvergunning_milieu', label: d.omgevingsvergunning_milieu, category: cat.commercial, synonyms: ['omgeving', 'milieu', 'vergunning', 'environmental', 'permit'] },
        { id: 'vlarem_indeling', label: d.vlarem_indeling, category: cat.commercial, synonyms: ['vlarem', 'indeling', 'classification'] },
        { id: 'brandveiligheidsattest', label: d.brandveiligheidsattest, category: cat.commercial, synonyms: ['brand', 'veiligheid', 'fire', 'safety', 'incendie'] },
        { id: 'keuringsattest_gas', label: d.keuringsattest_gas, category: cat.commercial, synonyms: ['gas', 'keuring', 'inspection', 'gaz'] },
        { id: 'keuringsattest_lift', label: d.keuringsattest_lift, category: cat.commercial, synonyms: ['lift', 'keuring', 'elevator', 'ascenseur'] },

        // Fiscaal & financieel
        { id: 'berekening_registratierechten', label: d.berekening_registratierechten, category: cat.fiscal, synonyms: ['registratie', 'rechten', 'berekening', 'registration', 'fees'] },
        { id: 'kostenraming_notaris', label: d.kostenraming_notaris, category: cat.fiscal, synonyms: ['kosten', 'notaris', 'cost', 'estimate', 'notaire'] },
        { id: 'betalingsbewijs_voorschot', label: d.betalingsbewijs_voorschot, category: cat.fiscal, synonyms: ['betaling', 'voorschot', 'payment', 'down', 'acompte'] },

        // Overige / bijzondere situaties
        { id: 'erfenisakte', label: d.erfenisakte, category: cat.other, synonyms: ['erfenis', 'akte', 'inheritance', 'deed', 'succession'] },
        { id: 'akte_verdeling', label: d.akte_verdeling, category: cat.other, synonyms: ['verdeling', 'akte', 'division', 'deed', 'partage'] },
        { id: 'pachtcontract', label: d.pachtcontract, category: cat.other, synonyms: ['pacht', 'contract', 'lease', 'bail', 'rural'] },
        { id: 'onteigeningsplan', label: d.onteigeningsplan, category: cat.other, synonyms: ['onteignen', 'plan', 'expropriation'] },
        { id: 'bewindvoerdersbesluit', label: d.bewindvoerdersbesluit, category: cat.other, synonyms: ['bewindvoerder', 'besluit', 'administrator', 'decision'] },
        { id: 'verkoopbeslissing_vennootschap', label: d.verkoopbeslissing_vennootschap, category: cat.other, synonyms: ['verkoop', 'vennootschap', 'beslissing', 'company', 'sale'] },
        { id: 'overdracht_handelsfonds', label: d.overdracht_handelsfonds, category: cat.other, synonyms: ['handelsfonds', 'overdracht', 'business', 'goodwill', 'commerce'] },
    ];
};
