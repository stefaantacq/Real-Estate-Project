import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FileText, Clock, ChevronRight, MapPin, GripVertical } from 'lucide-react';
import { Dossier, DossierStatus, Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface SortableDossierCardProps {
    dossier: Dossier;
    lang: Language;
    onOpenDossier: (id: string) => void;
    onContextMenu?: (e: React.MouseEvent, id: string, status: DossierStatus) => void;
}

export const SortableDossierCard: React.FC<SortableDossierCardProps> = ({ dossier, lang, onOpenDossier, onContextMenu }) => {
    const t = TRANSLATIONS[lang];
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: dossier.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex flex-col bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-200 dark:border-slate-800 hover:border-brand-400 dark:hover:border-brand-500 hover:shadow-lg transition-all cursor-pointer group min-w-[280px] h-full min-h-[120px] relative ${isDragging ? 'shadow-2xl' : ''}`}
            onClick={() => onOpenDossier(dossier.id)}
            onContextMenu={(e) => onContextMenu?.(e, dossier.id, dossier.status)}
        >
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                        {...attributes}
                        {...listeners}
                        className="p-1 -ml-1 text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing transition-colors flex-shrink-0"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <GripVertical className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">{dossier.name}</h3>
                </div>
            </div>

            <div className="space-y-1 mt-auto">
                <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 truncate">
                    <MapPin className="w-3 h-3 mr-1" />
                    {dossier.address}
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {dossier.date}</span>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand-500 transition-colors" />
                </div>
            </div>
        </div>
    );
};
