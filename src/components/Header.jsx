import React from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Languages } from 'lucide-react';

export function Header() {
    const { t, i18n } = useTranslation();

    const toggleLanguage = () => {
        i18n.changeLanguage(i18n.language === 'en' ? 'es' : 'en');
    };

    return (
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="bg-primary-500 p-2 rounded-lg shadow-lg shadow-primary-500/30">
                        <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                            {t('app.title')}
                        </h1>
                    </div>
                </div>

                <button
                    onClick={toggleLanguage}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-slate-100 transition-colors text-sm font-medium text-slate-600"
                >
                    <Languages className="w-4 h-4" />
                    <span>{i18n.language === 'en' ? 'ES' : 'EN'}</span>
                </button>
            </div>
        </header>
    );
}
