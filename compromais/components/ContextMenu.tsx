import React, { useEffect, useRef } from 'react';
import { Layout, CheckCircle, Archive, ArrowRightLeft } from 'lucide-react';
import { DossierStatus } from '../types';

interface ContextMenuProps {
    x: number;
    y: number;
    onClose: () => void;
    onMove: (status: DossierStatus) => void;
    currentStatus: DossierStatus;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose, onMove, currentStatus }) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    // Adjust position if menu goes off-screen
    const adjustedX = Math.min(x, window.innerWidth - 220);
    const adjustedY = Math.min(y, window.innerHeight - 160);

    const menuItems = [
        {
            id: DossierStatus.DRAFT,
            label: 'Verplaats naar Concept',
            icon: <Layout className="w-4 h-4" />,
            show: currentStatus !== DossierStatus.DRAFT
        },
        {
            id: DossierStatus.ACTIVE,
            label: 'Verplaats naar In Behandeling',
            icon: <CheckCircle className="w-4 h-4" />,
            show: currentStatus !== DossierStatus.ACTIVE && currentStatus !== DossierStatus.COMPLETED
        },
        {
            id: DossierStatus.ARCHIVED,
            label: 'Archiveer',
            icon: <Archive className="w-4 h-4" />,
            show: currentStatus !== DossierStatus.ARCHIVED
        },
    ];

    return (
        <div
            ref={menuRef}
            className="fixed z-[100] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl py-1 min-w-[200px] animate-in fade-in zoom-in duration-100"
            style={{ left: adjustedX, top: adjustedY }}
        >
            <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <ArrowRightLeft className="w-3 h-3" />
                Verplaats naar
            </div>
            <div className="h-px bg-slate-100 dark:bg-slate-700 my-1" />
            {menuItems.filter(item => item.show).map((item) => (
                <button
                    key={item.id}
                    onClick={() => {
                        onMove(item.id as DossierStatus);
                        onClose();
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-brand-50 dark:hover:bg-brand-900/30 hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-3 transition-colors"
                >
                    {item.icon}
                    {item.label}
                </button>
            ))}
        </div>
    );
};
