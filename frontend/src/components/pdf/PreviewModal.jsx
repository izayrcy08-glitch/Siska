import React, { useState, useEffect } from 'react';
import { pdf } from '@react-pdf/renderer';
import LaporanPDF from './LaporanPDF';
import { BULAN_INDONESIA } from '../../utils/timeUtils';
import { X, Download, FileText, ExternalLink, Loader2, AlertCircle } from 'lucide-react';

const PreviewModal = ({ monthData, settings, onClose }) => {
  const namaBulan = BULAN_INDONESIA[(monthData?.bulan || 1) - 1];
  const namaPegawai = (settings?.pegawai?.nama || 'Pegawai').replace(/\s+/g, '_');
  const namaFile = `Laporan_Kegiatan_${namaPegawai}_${namaBulan}${monthData?.tahun || ''}.pdf`;

  const [blobUrl, setBlobUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let url = null;
    pdf(<LaporanPDF monthData={monthData} settings={settings} />)
      .toBlob()
      .then(blob => {
        url = URL.createObjectURL(blob);
        setBlobUrl(url);
        setLoading(false);
      })
      .catch(err => {
        console.error('PDF error:', err);
        setError('Gagal membuat PDF. Silakan coba lagi.');
        setLoading(false);
      });
    return () => { if (url) URL.revokeObjectURL(url); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownload = () => {
    if (!blobUrl) return;
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = namaFile;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleViewPDF = () => {
    if (!blobUrl) return;
    window.open(blobUrl, '_blank', 'noopener,noreferrer');
  };

  const savedDaysCount = monthData?.hari?.filter(h => h.disimpan && h.kegiatan?.some(k => k.namaKegiatan?.trim())).length || 0;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-gray-50" data-testid="preview-modal">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white shadow-sm flex-shrink-0">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Laporan PDF</h2>
          <p className="text-xs text-gray-400">{namaBulan} {monthData?.tahun}</p>
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
          data-testid="close-preview-btn"
        >
          <X size={18} className="text-gray-600" />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        {loading && (
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Loader2 size={36} className="text-blue-700 animate-spin" />
            </div>
            <p className="text-base font-semibold text-gray-800 mb-1">Membuat PDF...</p>
            <p className="text-sm text-gray-400">Mohon tunggu sebentar</p>
          </div>
        )}

        {error && (
          <div className="text-center">
            <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={36} className="text-red-500" />
            </div>
            <p className="text-base font-semibold text-gray-800 mb-1">Gagal Membuat PDF</p>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-gray-800 text-white rounded-xl text-sm font-medium"
            >
              Tutup
            </button>
          </div>
        )}

        {blobUrl && !loading && (
          <div className="w-full max-w-sm">
            {/* File Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-6 text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <FileText size={32} className="text-blue-700" />
              </div>
              <p className="text-sm font-semibold text-gray-900 mb-1 break-all">{namaFile}</p>
              <p className="text-xs text-gray-400">{savedDaysCount} hari kerja tersimpan</p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleViewPDF}
                className="w-full h-13 py-3.5 rounded-xl bg-blue-900 text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-blue-800 transition-colors active:scale-98"
                data-testid="view-pdf-btn"
              >
                <ExternalLink size={17} />
                Buka PDF di Tab Baru
              </button>
              <button
                onClick={handleDownload}
                className="w-full h-13 py-3.5 rounded-xl border-2 border-blue-900 text-blue-900 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors active:scale-98"
                data-testid="download-pdf-btn"
              >
                <Download size={17} />
                Download PDF
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                data-testid="close-preview-bottom-btn"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewModal;
