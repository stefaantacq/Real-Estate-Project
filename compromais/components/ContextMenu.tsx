import React, { useEffect, useRef } from 'react';
import { Layout, CheckCircle, Archive, ArrowRightLeft, Trash2 } from 'lucide-react';
import { DossierStatus, Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface ContextMenuProps {
    x: number;
    y: number;
    onClose: () => void;
    onMove: (status: DossierStatus) => void;
    onDelete: () => void;
    currentStatus: DossierStatus;
    lang: Language;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose, onMove, onDelete, currentStatus, lang }) => {
    const menuRef = useRef<HTMLDivElement>(null);
    const t = TRANSLATIONS[lang];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const adjustedX = Math.min(x, window.innerWidth - 220);
    const adjustedY = Math.min(y, window.innerHeight - 160);

    const menuItems = [
        {
            id: DossierStatus.DRAFT,
            label: t.moveToConcept,
            icon: <Layout className="w-4 h-4" />,
            show: currentStatus !== DossierStatus.DRAFT
        },
        {
            id: DossierStatus.ACTIVE,
            label: t.moveToActive,
            icon: <CheckCircle className="w-4 h-4" />,
            show: currentStatus !== DossierStatus.ACTIVE && currentStatus !== DossierStatus.COMPLETED
        },
        {
            id: DossierStatus.ARCHIVED,
            label: t.archive,
            icon: <Archive className="w-4 h-4" />,
            show: currentStatus !== DossierStatus.ARCHIVED
        },
        {
            id: 'delete',
            label: t.deleteDossier,
            icon: <Trash2 className="w-4 h-4 text-red-500" />,
            show: true,
            isDelete: true
        }
    ];

    return (
        <div
            ref={menuRef}
            className="fixed z-[100] bg-white border border-slate-200 rounded-xl shadow-xl py-1 min-w-[200px]"
            style={{ left: adjustedX, top: adjustedY }}
        >
            <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <ArrowRightLeft className="w-3 h-3" />
                {t.moveTo}
            </div>
            <div className="h-px bg-slate-100 my-1" />
            {menuItems.filter(item => item.show).map((item) => (
                <button
                    key={item.id}
                    onClick={() => {
                        if (item.id === 'delete') {
                            onDelete();
                        } else {
                            onMove(item.id as DossierStatus);
                        }
                        onClose();
                    }}
                    className={`w-full text-left px-3 py-2 text-sm flex items-center gap-3 transition-colors duration-150 ${item.id === 'delete'
                        ? 'text-red-600 hover:bg-red-50'
                        : 'text-slate-700 hover:bg-blue-50 hover:text-blue-600'
                        }`}
                >
                    {item.icon}
                    {item.label}
                </button>
            ))}
        </div>
    );
};
