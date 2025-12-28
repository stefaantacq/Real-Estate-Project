import React, { useState } from 'react';

interface ExpandableTextProps {
    text: string;
    limit?: number;
    className?: string;
}

export const ExpandableText: React.FC<ExpandableTextProps> = ({ text = '', limit = 100, className }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const content = text || '';
    const shouldTruncate = content.length > limit;

    if (!shouldTruncate) return <p className={className}>{content}</p>;

    return (
        <div className={className}>
            <p>
                {isExpanded ? content : `${content.slice(0, limit)}...`}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsExpanded(!isExpanded);
                    }}
                    className="ml-2 text-brand-600 hover:text-brand-700 font-bold text-xs inline-flex items-center"
                >
                    {isExpanded ? 'Minder weergeven' : 'Lees meer'}
                </button>
            </p>
        </div>
    );
};
