import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X } from 'lucide-react';

export function SortableItem({ id, src, onRemove }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 999 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="relative group aspect-[3/4] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white"
        >
            <img
                src={src}
                alt="Upload"
                className="w-full h-full object-cover pointer-events-none"
            />

            {/* Overlay backdrop */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />

            {/* Remove button */}
            <button
                onClick={(e) => {
                    e.stopPropagation(); // Prevent drag start
                    onRemove(id);
                }}
                className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-full 
                   text-red-500 opacity-0 group-hover:opacity-100 
                   hover:bg-red-50 hover:text-red-600 
                   transition-all duration-200 shadow-sm transform hover:scale-110"
            >
                <X className="w-4 h-4" />
            </button>

            {/* Drag handle indicator (optional visual cue) */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-white/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    );
}
