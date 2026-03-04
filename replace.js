const fs = require('fs');
const path = 'compromais/components/Editor.tsx';
let content = fs.readFileSync(path, 'utf8');

// Insert isCurrentVersion state if not exists
if (!content.includes('const [isCurrentVersion, setIsCurrentVersion] = useState(true);')) {
    content = content.replace(
        'const [isInitialized, setIsInitialized] = useState(false);',
        'const [isCurrentVersion, setIsCurrentVersion] = useState(true);\n    const [isInitialized, setIsInitialized] = useState(false);'
    );
}

if (!content.includes('setIsCurrentVersion(ver.is_current === 1 || ver.is_current === true);')) {
    content = content.replace(
        'setFuture([]);\n                }',
        'setFuture([]);\n                }\n                if (ver) {\n                    setIsCurrentVersion(ver.is_current === 1 || ver.is_current === true);\n                }'
    );
}

// Replace isArchived definition and occurrences
if (!content.includes('const isReadOnly = isArchived || !isCurrentVersion;')) {
    content = content.replace(
        'const isArchived = dossier?.status === DossierStatus.ARCHIVED;',
        'const isArchived = dossier?.status === DossierStatus.ARCHIVED;\n    const isReadOnly = isArchived || !isCurrentVersion;'
    );
}

content = content.replace(/!isArchived/g, '!isReadOnly');
content = content.replace(/if \(isArchived\)/g, 'if (isReadOnly)');
content = content.replace(/\[history, future, sections, isInitialized, isArchived, id\]/g, '[history, future, sections, isInitialized, isReadOnly, id]');

if (content.match(/isArchived\) return/)) {
    content = content.replace(/isArchived\) return/g, 'isReadOnly) return');
}

// Ensure the handleSave updates correctly
if (!content.includes('setIsCurrentVersion(true);')) {
    content = content.replace(
        "window.history.replaceState(null, '', `#/editor/${result.new_ui_id}`);",
        "window.history.replaceState(null, '', `#/editor/${result.new_ui_id}`);\n                setIsCurrentVersion(true);"
    );
}

// Add the banner for !isCurrentVersion
const bannerDiv = `
            {/* Top Toolbar */}
            {!isCurrentVersion && dossier?.status !== DossierStatus.ARCHIVED && (
                <div className="bg-yellow-50 border-b border-yellow-200 p-3 flex flex-col md:flex-row items-center justify-between text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-900 dark:text-yellow-200">
                    <div className="flex items-center gap-2 font-medium">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        U bekijkt een oudere versie. Oude versies kunnen niet meer bewerkt worden.
                    </div>
                    <button 
                        onClick={handleSave} 
                        className="mt-2 md:mt-0 flex items-center px-4 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold rounded-lg transition-colors shadow-sm"
                    >
                        Ga verder vanaf deze versie
                    </button>
                </div>
            )}
            <div className="h-14 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0 shadow-sm z-10">
`;
if (!content.includes('U bekijkt een oudere versie.')) {
    content = content.replace(
        '{/* Top Toolbar */}\n            <div className="h-14 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0 shadow-sm z-10">',
        bannerDiv
    );
}

fs.writeFileSync(path, content, 'utf8');
console.log('Done');
