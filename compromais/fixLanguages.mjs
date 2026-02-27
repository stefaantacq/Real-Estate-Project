import fs from 'fs';

const constantsPath = '/Users/stefaantacq/Downloads/Real-Estate-Project/compromais/constants.ts';
let constants = fs.readFileSync(constantsPath, 'utf8');

const newNl = `
    welcomeBack: 'Welkom terug! Log in op uw account.',
    registerBroker: 'Maak een nieuw account aan als makelaar.',
    loginCib: 'Log in met CIB',
    devLogin: 'Dev Login',
    noAccount: 'Nog geen account? Registreer hier',
    fullName: 'Volledige Naam',
    backToLogin: 'Terug naar Login',
    registerAccount: 'Registreer account',
    aiConnected: 'AI Verbonden',
    aiDisconnected: 'AI Niet Verbonden',
    aiChecking: 'AI Status Controleren...',
    themeToggle: 'Thema wisselen',
    myDivision: 'Mijn opdeling',
    recentlyOpened: 'Recent gebruikt',
    recent: 'Recent',
    dragToConcept: 'Sleep hier dossiers naartoe om ze naar Concept te verplaatsen',
    dragToActive: 'Sleep hier dossiers naartoe om ze naar In Behandeling te verplaatsen',
    dragToArchive: 'Sleep hier dossiers naartoe om te archiveren',
    privacySecurity: 'Privacy & Veiligheid',
    aiSettings: 'AI Verrijking (Advanced)',
    docPromptLabel: 'Document Analyse Verrijking',
    docPromptDesc: 'Wordt gebruikt bij het scannen van dossiers (ID\'s, aktes, etc.). Bijvoorbeeld: "Focus vooral op de namen van de kopers" of "Formatteer data altijd als DD-MM-YYYY".',
    docPromptPlaceholder: 'Typ hier je extra instructies voor data extractie...',
    tplPromptLabel: 'Template Analyse Verrijking',
    tplPromptDesc: 'Wordt gebruikt bij het analyseren van nieuwe PDF sjablonen. Bijvoorbeeld: "Maak voor elk lidwoord een aparte placeholder" of "Groepeer alle adressen in één sectie".',
    tplPromptPlaceholder: 'Typ hier je extra instructies voor sjabloon analyse...',
    notifications: 'Notificaties',
    comingSoon: 'Binnenkort beschikbaar',
    displayOptions: 'Weergave',
    showAiStatusSetting: 'Toon AI Status Indicator',
    showAiStatusDesc: 'Toon een visuele indicator in de zijbalk die de status van de AI-verbinding weergeeft.',
    noArchivedFound: 'Geen gearchiveerde dossiers gevonden.',
`;

const newFr = `
    welcomeBack: 'Bon retour ! Connectez-vous à votre compte.',
    registerBroker: 'Créez un nouveau compte en tant que courtier.',
    loginCib: 'Se connecter avec CIB',
    devLogin: 'Connexion développeur',
    noAccount: 'Pas encore de compte ? Inscrivez-vous ici',
    fullName: 'Nom Complet',
    backToLogin: 'Retour à la connexion',
    registerAccount: 'Enregistrer le compte',
    aiConnected: 'IA Connectée',
    aiDisconnected: 'IA Non connectée',
    aiChecking: 'Vérification du statut IA...',
    themeToggle: 'Changer de thème',
    myDivision: 'Ma division',
    recentlyOpened: 'Récemment utilisé',
    recent: 'Récent',
    dragToConcept: 'Faites glisser les dossiers ici pour les déplacer vers Brouillon',
    dragToActive: 'Faites glisser les dossiers ici pour les déplacer vers En Traitement',
    dragToArchive: 'Faites glisser les dossiers ici pour archiver',
    privacySecurity: 'Confidentialité & Sécurité',
    aiSettings: 'Enrichissement IA (Avancé)',
    docPromptLabel: 'Enrichissement d\\'analyse de document',
    docPromptDesc: 'Utilisé lors de la numérisation des dossiers. Par exemple : "Concentrez-vous sur les noms des acheteurs" ou "Formatez les dates en JJ-MM-AAAA".',
    docPromptPlaceholder: 'Tapez vos instructions supplémentaires ici...',
    tplPromptLabel: 'Enrichissement d\\'analyse de modèle',
    tplPromptDesc: 'Utilisé lors de l\\'analyse de nouveaux modèles PDF.',
    tplPromptPlaceholder: 'Tapez vos instructions supplémentaires pour le modèle ici...',
    notifications: 'Notifications',
    comingSoon: 'Bientôt disponible',
    displayOptions: 'Affichage',
    showAiStatusSetting: 'Afficher l\\'indicateur de statut IA',
    showAiStatusDesc: 'Afficher un indicateur visuel dans la barre latérale.',
    noArchivedFound: 'Aucun dossier archivé trouvé.',
`;

const newEn = `
    welcomeBack: 'Welcome back! Log in to your account.',
    registerBroker: 'Create a new account as a broker.',
    loginCib: 'Log in with CIB',
    devLogin: 'Dev Login',
    noAccount: 'No account yet? Register here',
    fullName: 'Full Name',
    backToLogin: 'Back to Login',
    registerAccount: 'Register account',
    aiConnected: 'AI Connected',
    aiDisconnected: 'AI Disconnected',
    aiChecking: 'Checking AI Status...',
    themeToggle: 'Toggle Theme',
    myDivision: 'My division',
    recentlyOpened: 'Recently used',
    recent: 'Recent',
    dragToConcept: 'Drag dossiers here to move them to Draft',
    dragToActive: 'Drag dossiers here to move them to In Progress',
    dragToArchive: 'Drag dossiers here to archive',
    privacySecurity: 'Privacy & Security',
    aiSettings: 'AI Enrichment (Advanced)',
    docPromptLabel: 'Document Analysis Enrichment',
    docPromptDesc: 'Used when scanning dossiers. For example: "Focus especially on buyer names" or "Always format data as DD-MM-YYYY".',
    docPromptPlaceholder: 'Type your extra instructions for extraction here...',
    tplPromptLabel: 'Template Analysis Enrichment',
    tplPromptDesc: 'Used when analyzing new PDF templates.',
    tplPromptPlaceholder: 'Type your extra instructions for template analysis here...',
    notifications: 'Notifications',
    comingSoon: 'Coming soon',
    displayOptions: 'Display',
    showAiStatusSetting: 'Show AI Status Indicator',
    showAiStatusDesc: 'Show a visual indicator in the sidebar showing the status of the AI connection.',
    noArchivedFound: 'No archived dossiers found.',
`;

constants = constants.replace(/(userEmail:\s*'.*?',)/, "$1\n" + newNl);
constants = constants.replace(/(userEmail:\s*'.*?',)(?=[\s\S]*?Language\.EN)/, "$1\n" + newFr);
// The second match is trickier, let's just do it carefully.
// Instead of complex regex, let's split and replace.
let parts = constants.split('userEmail:');
if (parts.length === 4) {
    // 0: start, 1: NL, 2: FR, 3: EN
    parts[1] = parts[1].replace(/('.*?'),/, "$1,\n" + newNl);
    parts[2] = parts[2].replace(/('.*?'),/, "$1,\n" + newFr);
    parts[3] = parts[3].replace(/('.*?'),/, "$1,\n" + newEn);
    constants = parts.join('userEmail:');
}
fs.writeFileSync(constantsPath, constants);
console.log('constants updated');

const replaceInFile = (file, replacements) => {
    let content = fs.readFileSync(file, 'utf8');
    for (const [find, replace] of replacements) {
        content = content.split(find).join(replace);
    }
    fs.writeFileSync(file, content);
};

// Auth.tsx
replaceInFile('/Users/stefaantacq/Downloads/Real-Estate-Project/compromais/components/Auth.tsx', [
    [`'Welkom terug! Log in op uw account.'`, `t.welcomeBack`],
    [`'Maak een nieuw account aan als makelaar.'`, `t.registerBroker`],
    [`<label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>`, `<label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t.email}</label>`],
    [`<label className="text-sm font-medium text-slate-700 dark:text-slate-300">Wachtwoord</label>`, `<label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t.password}</label>`],
    [`<label className="text-sm font-medium text-slate-700 dark:text-slate-300">Volledige Naam</label>`, `<label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t.fullName}</label>`],
    [`Log in met CIB`, `{t.loginCib}`],
    [`Dev Login (admin@test.be)`, `{t.devLogin} (admin@test.be)`],
    [`Nog geen account? Registreer hier`, `{t.noAccount}`],
    [`Terug naar Login`, `{t.backToLogin}`],
    [`{view === 'login' && 'Log in'}`, `{view === 'login' && t.loginBtn}`],
    [`{view === 'register' && 'Registreer account'}`, `{view === 'register' && t.registerAccount}`],
]);
console.log('Auth.tsx updated');

// Layout.tsx
replaceInFile('/Users/stefaantacq/Downloads/Real-Estate-Project/compromais/components/Layout.tsx', [
    [`'AI Verbonden'`, `t.aiConnected`],
    [`'AI Niet Verbonden'`, `t.aiDisconnected`],
    [`'AI Status Controleren...'`, `t.aiChecking`],
    [`"Toggle Theme"`, `t.themeToggle`],
]);
console.log('Layout.tsx updated');

// Dashboard.tsx
replaceInFile('/Users/stefaantacq/Downloads/Real-Estate-Project/compromais/components/Dashboard.tsx', [
    [`Mijn opdeling\n          </button>`, `{t.myDivision}\n          </button>`],
    [`Mijn opdeling`, `{t.myDivision}`], // if inline
    [`Recent\n          </button>`, `{t.recent}\n          </button>`],
    [`Recent\n`, `{t.recent}\n`],
    [`<span>Concept</span>`, `<span>{t.draft}</span>`],
    [`Sleep hier dossiers naartoe om ze naar Concept te verplaatsen`, `{t.dragToConcept}`],
    [`<span>In Behandeling</span>`, `<span>{t.incomplete}</span>`],
    [`Sleep hier dossiers naartoe om ze naar In Behandeling te verplaatsen`, `{t.dragToActive}`],
    [`<span>Gearchiveerd</span>`, `<span>{t.archived}</span>`],
    [`Sleep hier dossiers naartoe om te archiveren`, `{t.dragToArchive}`],
    [`<span>Recent gebruikt</span>`, `<span>{t.recentlyOpened}</span>`],
    [`Geen gearchiveerde dossiers gevonden.`, `{t.noArchivedFound}`],
]);
console.log('Dashboard.tsx updated');

// SettingsPage.tsx
replaceInFile('/Users/stefaantacq/Downloads/Real-Estate-Project/compromais/components/SettingsPage.tsx', [
    [`Privacy & Veiligheid`, `{t.privacySecurity}`],
    [`AI Verrijking (Advanced)`, `{t.aiSettings}`],
    [`Document Analyse Verrijking`, `{t.docPromptLabel}`],
    [`Wordt gebruikt bij het scannen van dossiers (ID's, aktes, etc.). Bijvoorbeeld: "Focus vooral op de namen van de kopers" of "Formatteer data altijd als DD-MM-YYYY".`, `{t.docPromptDesc}`],
    [`Typ hier je extra instructies voor data extractie...`, `{t.docPromptPlaceholder}`],
    [`Template Analyse Verrijking`, `{t.tplPromptLabel}`],
    [`Wordt gebruikt bij het analyseren van nieuwe PDF sjablonen (layouts en secties). Bijvoorbeeld: "Maak voor elk lidwoord een aparte placeholder" of "Groepeer alle adressen in één sectie".`, `{t.tplPromptDesc}`],
    [`Typ hier je extra instructies voor sjabloon analyse...`, `{t.tplPromptPlaceholder}`],
    [`Notificaties`, `{t.notifications}`],
    [`Binnenkort beschikbaar`, `{t.comingSoon}`],
    [`Weergave`, `{t.displayOptions}`],
    [`Toon AI Status Indicator`, `{t.showAiStatusSetting}`],
    [`Toon een visuele indicator in de zijbalk die de status van de AI-verbinding weergeeft.`, `{t.showAiStatusDesc}`],
]);
console.log('SettingsPage.tsx updated');

