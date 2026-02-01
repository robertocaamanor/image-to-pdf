import React from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, FileText, LayoutTemplate } from 'lucide-react';
import { PDFSettings, PageSize, MarginSize } from '../types';

interface PDFSettingsPanelProps {
    settings: PDFSettings;
    onSettingsChange: (settings: PDFSettings) => void;
}

export function PDFSettingsPanel({ settings, onSettingsChange }: PDFSettingsPanelProps) {
    const { t } = useTranslation();

    const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const pageSize = e.target.value as PageSize;
        // If fit to image is selected, force margin to none as it's implied
        const newSettings = {
            ...settings,
            pageSize,
            margin: pageSize === 'fit' ? 'none' : settings.margin
        };
        onSettingsChange(newSettings);
    };

    const handleMarginChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onSettingsChange({ ...settings, margin: e.target.value as MarginSize });
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Settings className="w-5 h-5 text-slate-500" />
                <h3 className="font-semibold text-slate-700">{t('app.settings.title')}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Page Size Selection */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        {t('app.settings.page_size.label')}
                    </label>
                    <select
                        value={settings.pageSize}
                        onChange={handlePageSizeChange}
                        className="w-full h-10 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    >
                        <option value="a4">{t('app.settings.page_size.a4')}</option>
                        <option value="letter">{t('app.settings.page_size.letter')}</option>
                        <option value="fit">{t('app.settings.page_size.fit')}</option>
                    </select>
                </div>

                {/* Margin Selection */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                        <LayoutTemplate className="w-4 h-4" />
                        {t('app.settings.margin.label')}
                    </label>
                    <select
                        value={settings.margin}
                        onChange={handleMarginChange}
                        disabled={settings.pageSize === 'fit'}
                        className="w-full h-10 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <option value="none">{t('app.settings.margin.none')}</option>
                        <option value="small">{t('app.settings.margin.small')}</option>
                        <option value="medium">{t('app.settings.margin.medium')}</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
