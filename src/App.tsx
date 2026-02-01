import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import jsPDF from 'jspdf';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { ImageUploader } from './components/ImageUploader';
import { SortableImageGrid } from './components/SortableImageGrid';
import { Header } from './components/Header';
import { Loader2, Download, Trash2, Plus } from 'lucide-react';
import { clsx } from 'clsx';
import { PDFSettingsPanel } from './components/PDFSettingsPanel';
import { ImageItem, PDFSettings } from './types';


const generateId = () => Math.random().toString(36).substr(2, 9);

function App() {
  const { t } = useTranslation();
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [pdfSettings, setPdfSettings] = useState<PDFSettings>({
    pageSize: 'a4',
    margin: 'small'
  });

  const handleImagesSelected = (files: FileList | null) => {
    if (!files) return;
    const newImages = Array.from(files).map((file) => ({
      id: generateId(),
      file,
      src: URL.createObjectURL(file), // Create object URL for preview
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => {
      const newImages = prev.filter((img) => img.id !== id);
      // Revoke URL to avoid memory leaks
      const removedImage = prev.find((img) => img.id === id);
      if (removedImage) {
        URL.revokeObjectURL(removedImage.src);
      }
      return newImages;
    });
  };

  const handleReorder = (newImages: ImageItem[]) => {
    setImages(newImages);
  };

  const handleClearAll = () => {
    images.forEach(img => URL.revokeObjectURL(img.src));
    setImages([]);
  };

  const handlePreview = (src: string) => {
    const index = images.findIndex(img => img.src === src);
    if (index >= 0) {
      setLightboxIndex(index);
      setLightboxOpen(true);
    }
  };

  const generatePDF = async () => {
    if (images.length === 0) return;

    setIsGenerating(true);

    // Small delay to allow UI to update
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const doc = new jsPDF({
        format: pdfSettings.pageSize === 'fit' ? 'a4' : pdfSettings.pageSize, // Initial format, will be overridden for fit
        unit: 'mm'
      });

      // Clear initial page created by constructor if we are going to manage pages manually loop
      // Actually jsPDF creates one page. We will reuse it or not. 
      // Simplified loop logic:

      for (let i = 0; i < images.length; i++) {
        const image = images[i];

        // Load image to get dimensions
        const img = new Image();
        img.src = image.src;
        await new Promise((resolve) => {
          img.onload = resolve;
        });

        // Add page if not first
        if (i > 0) {
          if (pdfSettings.pageSize === 'fit') {
            // For fit, we add page with image dimensions
            // Convert px to mm roughly for initial sizing or just use pixel units?
            // jsPDF setPage equivalent or addPage with format
            // 1px = 0.264583 mm
            const pxToMm = 0.264583;
            doc.addPage([img.width * pxToMm, img.height * pxToMm]);
          } else {
            doc.addPage(pdfSettings.pageSize);
          }
        } else if (pdfSettings.pageSize === 'fit') {
          // Resize first page
          const pxToMm = 0.264583;
          const widthMm = img.width * pxToMm;
          const heightMm = img.height * pxToMm;
          // jsPDF doesn't make it easy to resize the FIRST page after init easily without internal access
          // So we might need to delete first page and add new one, or init with dimensions of first image.
          // Easier approach: If 'fit', init logic inside loop.
          // Workaround: set page size
          doc.deletePage(1);
          doc.addPage([widthMm, heightMm]);
        }


        let pageWidth = doc.internal.pageSize.getWidth();
        let pageHeight = doc.internal.pageSize.getHeight();

        let x = 0;
        let y = 0;
        let imgWidth = img.width;
        let imgHeight = img.height;

        if (pdfSettings.pageSize === 'fit') {
          // Image fills page exactly
          // We work in the page units.
          // If we defined page size in mm based on pixels, we can draw image to fill it.
          // Dimensions in doc.addImage should match page dimensions
          imgWidth = pageWidth;
          imgHeight = pageHeight;
        } else {
          // Standard Size (A4, Letter)
          let margin = 0;
          if (pdfSettings.margin === 'small') margin = 10;
          if (pdfSettings.margin === 'medium') margin = 20;

          const maxWidth = pageWidth - (margin * 2);
          const maxHeight = pageHeight - (margin * 2);

          const ratio = imgWidth / imgHeight;

          // Convert raw pixels to 'some' reasonable size or just logic:
          // The image raw width in pixels is likely much larger than the page width in mm.
          // When we say 'image fills maxWidth', we mean we scale it.

          // Logic: Fit image INTO (maxWidth x maxHeight) keeping aspect ratio.

          // Assume we want to scale usage of mm units:
          // imgWidth is currently in pixels.

          // We want the final drawn width to be <= maxWidth
          // finalWidth = maxWidth (if limited by width)

          // Let's reset imgWidth/imgHeight to 'target' display dimensions.
          // Start by assuming full width
          let targetWidth = maxWidth;
          let targetHeight = targetWidth / ratio;

          if (targetHeight > maxHeight) {
            targetHeight = maxHeight;
            targetWidth = targetHeight * ratio;
          }

          imgWidth = targetWidth;
          imgHeight = targetHeight;

          x = (pageWidth - imgWidth) / 2;
          y = (pageHeight - imgHeight) / 2;
        }

        doc.addImage(img, 'JPEG', x, y, imgWidth, imgHeight);
      }

      doc.save('images.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="space-y-8">

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                {images.length > 0
                  ? `${images.length} ${t('app.dropzone.supports').split(' ')[0] /* Rough hack for "Images" label, better to use t values */}`
                  : t('app.subtitle')}
              </h2>
              {images.length > 0 && (
                <p className="text-slate-500">{t('app.footer')}</p>
              )}
            </div>

            {images.length > 0 && (
              <div className="flex gap-3">
                <button
                  onClick={handleClearAll}
                  className="px-4 py-2 text-slate-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('app.actions.clear')}</span>
                </button>
                <div className="relative">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleImagesSelected(e.target.files)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg shadow-sm transition-all flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('app.actions.add_more')}</span>
                  </button>
                </div>

                <button
                  onClick={generatePDF}
                  disabled={isGenerating}
                  className={clsx(
                    "px-6 py-2 bg-primary-600 text-white rounded-lg shadow-md",
                    "hover:bg-primary-700 hover:shadow-lg transition-all transform hover:-translate-y-0.5",
                    "disabled:opacity-75 disabled:cursor-not-allowed disabled:transform-none",
                    "flex items-center gap-2 font-medium"
                  )}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('app.actions.generating')}
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      {t('app.actions.generate')}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-8">
            {images.length > 0 && (
              <div className="max-w-2xl mx-auto">
                <PDFSettingsPanel settings={pdfSettings} onSettingsChange={setPdfSettings} />
              </div>
            )}

            {images.length === 0 ? (
              <div className="max-w-xl mx-auto mt-12 bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50">
                <ImageUploader onImagesSelected={handleImagesSelected} />
              </div>
            ) : (
              <SortableImageGrid
                images={images}
                onImagesReorder={handleReorder}
                onRemove={handleRemoveImage}
                onPreview={handlePreview}
              />
            )}
          </div>
        </div>
      </main>

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={lightboxIndex}
        slides={images.map(img => ({ src: img.src }))}
        on={{
          view: ({ index }) => setLightboxIndex(index),
        }}
      />
    </div>
  );
}

export default App;
