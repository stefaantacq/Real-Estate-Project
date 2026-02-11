import React from 'react';

interface CollaboraEditorProps {
    documentId: string; // The ID/Filename of the document to edit
    onBack: () => void;
}

// CONFIGURATION
// In a real app, these should be env variables
const COLLABORA_URL = 'http://localhost:9980/browser/dist/cool.html';
const WOPI_HOST_URL = 'http://host.docker.internal:3000/wopi';
// NOTE: 'host.docker.internal' is crucial. Collabora (in container) needs to reach Node (on host).
// If both are in the same docker network, use container name.
// Since user has 'immich_caddy_net', we assume Node is running locally on the host machine relative to Dockge?
// WAIT: The user said "the node.js server is running" -> "npm run dev".
// This means Node is running on WINDOWS HOST (localhost:3000).
// Docker Container -> Windows Host requires 'host.docker.internal'.

export const CollaboraEditor: React.FC<CollaboraEditorProps> = ({ documentId, onBack }) => {

    // Construct the WOPISrc
    // This is the URL that Collabora will call to get file info.
    // It must be accessible FROM INSIDE the Collabora container.
    const wopiSrc = `${WOPI_HOST_URL}/files/${documentId}`;

    // Construct the Iframe URL
    // WOPISrc param must be URI encoded
    const iframeUrl = `${COLLABORA_URL}?WOPISrc=${encodeURIComponent(wopiSrc)}`;

    return (
        <div className="flex flex-col h-screen w-full bg-slate-100">
            {/* Simple Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="flex items-center text-slate-600 hover:text-slate-900 px-3 py-1 rounded hover:bg-slate-100 transition-colors"
                    >
                        ← Back
                    </button>
                    <h2 className="font-bold text-slate-700">Collabora Editor</h2>
                </div>
                <div className="text-xs text-slate-400">
                    Doc ID: {documentId}
                </div>
            </div>

            {/* Editor Frame */}
            <div className="flex-1 w-full bg-slate-200 relative">
                <iframe
                    src={iframeUrl}
                    className="w-full h-full border-none"
                    title="Collabora Online Editor"
                    allowFullScreen
                />
            </div>
        </div>
    );
};
