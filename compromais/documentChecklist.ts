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
            ownership_ground: 'Eigendom & Grond',
            technical_env: 'Technisch & Milieu',
            apartments: 'Appartementen (indien van toepassing)',
            parties: 'Partijen',
            financial: 'Financieel',
            optional: 'Optioneel',
        },
        [Language.FR]: {
            ownership_ground: 'Propriété & Terrain',
            technical_env: 'Technique & Environnement',
            apartments: 'Appartements (si applicable)',
            parties: 'Parties',
            financial: 'Financier',
            optional: 'Optionnel',
        },
        [Language.EN]: {
            ownership_ground: 'Ownership & Land',
            technical_env: 'Technical & Environmental',
            apartments: 'Apartments (if applicable)',
            parties: 'Parties',
            financial: 'Financial',
            optional: 'Optional',
        },
    };

    const docs = {
        [Language.NL]: {
            eigendomstitel: 'Eigendomstitel (aankoopakte of akte van erfopvolging)',
            kadastraal: 'Kadastraal plan en legger',
            bodemattest: 'Bodemattest',
            stedenbouw: 'Stedenbouwkundige inlichtingen',
            epc: 'Energieprestatiecertificaat (EPC)',
            overstroming: 'Overstromingsgevoeligheidsattest',
            basisakte: 'Basisakte',
            syndicus: 'Informatie van de syndicus',
            id_kaarten: 'Identiteitskaarten koper en verkoper',
            financiering: 'Bewijs van financiering / lening',
            aankoopbelofte: 'Aanvaarde aankoopbelofte',
        },
        [Language.FR]: {
            eigendomstitel: 'Titre de propriété (acte d’achat ou acte de succession)',
            kadastraal: 'Plan et matrice cadastrale',
            bodemattest: 'Attestation du sol',
            stedenbouw: 'Renseignements urbanistiques',
            epc: 'Certificat de performance énergétique (PEB)',
            overstroming: 'Attestation de sensibilité aux inondations',
            basisakte: 'Acte de base',
            syndicus: 'Informations du syndic',
            id_kaarten: 'Cartes d’identité acheteur et vendeur',
            financiering: 'Preuve de financement / prêt',
            aankoopbelofte: 'Promesse d’achat acceptée',
        },
        [Language.EN]: {
            eigendomstitel: 'Title deed (purchase deed or deed of succession)',
            kadastraal: 'Cadastral plan and register',
            bodemattest: 'Soil certificate',
            stedenbouw: 'Urban planning information',
            epc: 'Energy Performance Certificate (EPC)',
            overstroming: 'Flood sensitivity certificate',
            basisakte: 'Base deed',
            syndicus: 'Information from the syndic',
            id_kaarten: 'Identity cards buyer and seller',
            financiering: 'Proof of financing / loan',
            aankoopbelofte: 'Accepted purchase promise',
        },
    };

    const cat = categories[lang];
    const d = docs[lang];

    return [
        // Eigendom & Grond
        { id: 'eigendomstitel', label: d.eigendomstitel, category: cat.ownership_ground, synonyms: ['eigendom', 'akte', 'deed', 'propriété', 'successie', 'erfopvolging'] },
        { id: 'kadastraal', label: d.kadastraal, category: cat.ownership_ground, synonyms: ['kadaster', 'kadastraal', 'plan', 'legger', 'cadastral'] },
        { id: 'bodemattest', label: d.bodemattest, category: cat.ownership_ground, synonyms: ['bodem', 'ovam', 'soil', 'sol'] },
        { id: 'stedenbouw', label: d.stedenbouw, category: cat.ownership_ground, synonyms: ['stedenbouw', 'inlichtingen', 'urban', 'planning', 'urbanisme'] },

        // Technisch & Milieu
        { id: 'epc', label: d.epc, category: cat.technical_env, synonyms: ['epc', 'energie', 'prestatie', 'energy', 'performance', 'peb'] },
        { id: 'overstroming', label: d.overstroming, category: cat.technical_env, synonyms: ['overstroming', 'gevoeligheid', 'flood', 'inondation'] },

        // Appartementen
        { id: 'basisakte', label: d.basisakte, category: cat.apartments, synonyms: ['basis', 'akte', 'base', 'deed'] },
        { id: 'syndicus', label: d.syndicus, category: cat.apartments, synonyms: ['syndicus', 'syndic', 'vme'] },

        // Partijen
        { id: 'id_kaarten', label: d.id_kaarten, category: cat.parties, synonyms: ['identiteitskaart', 'id', 'paspoort', 'passport', 'identité'] },

        // Financieel
        { id: 'financiering', label: d.financiering, category: cat.financial, synonyms: ['lening', 'financiering', 'loan', 'financing', 'prêt'] },

        // Optioneel
        { id: 'aankoopbelofte', label: d.aankoopbelofte, category: cat.optional, synonyms: ['belofte', 'promise', 'compromis', 'promesse'] },
    ];
};
