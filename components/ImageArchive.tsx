
import React, { useState } from 'react';
import { InvoiceData } from '../types';
import { Search, Image as ImageIcon, Calendar, FileText, Download, X, ZoomIn } from 'lucide-react';

interface ImageArchiveProps {
  invoices: InvoiceData[];
  translations: any;
  language: string;
}

const ImageArchive: React.FC<ImageArchiveProps> = ({ invoices, translations: t, language }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState<InvoiceData | null>(null);

  // Filter only invoices that have an image
  const invoicesWithImages = invoices.filter(inv => 
    inv.imageUrl && 
    (inv.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) || 
     inv.date.includes(searchQuery))
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <ImageIcon className="text-purple-500" size={24} />
            {t.archive.title}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{t.archive.subtitle}</p>
        </div>
        
        {/* Search */}
        <div className="relative w-full md:w-72">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
                type="text" 
                placeholder={t.archive.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm dark:text-white transition-all shadow-sm"
            />
        </div>
      </div>

      {/* Grid */}
      {invoicesWithImages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
            <div className="p-6 bg-slate-50 dark:bg-slate-700/50 rounded-full mb-4">
                <ImageIcon size={40} className="text-slate-300 dark:text-slate-500" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">{t.archive.noImages}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {invoicesWithImages.map((invoice) => (
                <div 
                    key={invoice.id} 
                    className="group relative aspect-square bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 cursor-pointer hover:shadow-lg transition-all"
                    onClick={() => setSelectedImage(invoice)}
                >
                    <img 
                        src={invoice.imageUrl} 
                        alt={invoice.vendorName} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    
                    {/* Overlay Info */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-12 translate-y-2 group-hover:translate-y-0 transition-transform">
                        <p className="text-white font-bold text-sm truncate">{invoice.vendorName}</p>
                        <div className="flex justify-between items-end mt-1">
                            <span className="text-white/80 text-xs flex items-center gap-1">
                                <Calendar size={10} /> {invoice.date}
                            </span>
                            <span className="text-emerald-300 text-xs font-mono font-bold" dir="ltr">
                                {invoice.totalAmount.toFixed(3)}
                            </span>
                        </div>
                    </div>

                    <div className="absolute top-2 left-2 p-2 bg-black/30 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <ZoomIn size={16} />
                    </div>
                </div>
            ))}
        </div>
      )}

      {/* Modal Viewer */}
      {selectedImage && (
        <div className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
            <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <button 
                    onClick={() => setSelectedImage(null)}
                    className="absolute -top-12 left-0 text-white hover:text-slate-300 transition-colors flex items-center gap-2"
                >
                    <X size={24} />
                    <span className="text-sm font-bold">إغلاق</span>
                </button>

                <div className="bg-black rounded-3xl overflow-hidden flex items-center justify-center border border-white/10 shadow-2xl">
                    <img 
                        src={selectedImage.imageUrl} 
                        alt={selectedImage.vendorName} 
                        className="max-w-full max-h-[80vh] object-contain"
                    />
                </div>

                <div className="mt-4 flex justify-between items-center text-white">
                    <div>
                        <h3 className="font-bold text-xl">{selectedImage.vendorName}</h3>
                        <p className="text-sm text-slate-400 flex items-center gap-2">
                            <FileText size={14} /> {selectedImage.description || 'فاتورة'} • {selectedImage.date}
                        </p>
                    </div>
                    <a 
                        href={selectedImage.imageUrl} 
                        download={`invoice-${selectedImage.date}-${selectedImage.vendorName}.jpg`}
                        className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Download size={18} />
                        <span>تحميل</span>
                    </a>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default ImageArchive;
