import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { clsx } from 'clsx';

export function ImageUploader({ onImagesSelected }) {
    const { t } = useTranslation();

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            onImagesSelected(e.dataTransfer.files);
        }
    }, [onImagesSelected]);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleFileInput = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            onImagesSelected(e.target.files);
        }
    };

    return (
        <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className={clsx(
                "relative group cursor-pointer",
                "border-2 border-dashed border-slate-300 rounded-2xl",
                "bg-slate-50 hover:bg-slate-100 transition-all duration-300",
                "flex flex-col items-center justify-center p-12 text-center",
                "hover:border-primary-400 hover:shadow-lg hover:shadow-primary-100"
            )}
        >
            <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            <div className="mb-4 p-4 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform duration-300">
                <Upload className="w-8 h-8 text-primary-500" />
            </div>

            <h3 className="text-xl font-semibold text-slate-700 mb-2">
                {t('app.dropzone.title')}
            </h3>
            <p className="text-slate-500 mb-4">
                {t('app.dropzone.subtitle')}
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-200">
                <ImageIcon className="w-4 h-4" />
                {t('app.dropzone.supports')}
            </div>
        </div>
    );
}
