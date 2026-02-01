export interface ImageItem {
    id: string;
    file: File;
    src: string;
}

export type PageSize = 'a4' | 'letter' | 'fit';
export type MarginSize = 'none' | 'small' | 'medium';

export interface PDFSettings {
    pageSize: PageSize;
    margin: MarginSize;
}
