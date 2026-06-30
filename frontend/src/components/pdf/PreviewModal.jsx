import React, { useState } from 'react';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import LaporanPDF from './LaporanPDF';
import { BULAN_INDONESIA } from '../../utils/timeUtils';
import { X, Download, Loader2 } from 'lucide-react';

const PreviewModal = ({ monthData, settings, onClose }) => {
  const namaBulan = BULAN_INDONESIA[(monthData?.bulan || 1) - 1];
  const namaPegawai = (settings?.pegawai?.nama || 'Pegawai').replace(/\s+/g, '_');
  const namaFile = `Laporan_Kegiatan_${namaPegawai}_${namaBulan}${monthData?.tahun || ''}.pdf`;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white" data-testid="preview-modal">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white shadow-sm flex-shrink-0">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Preview PDF</h2>
          <p className="text-xs text-gray-400">{namaBulan} {monthData?.tahun}</p>
        </div>
        <div className="flex items-center gap-2">
          <PDFDownloadLink
            document={<LaporanPDF monthData={monthData} settings={settings} />}
            fileName={namaFile}
          >
            {({ loading, error }) => (
              <button
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-900 text-white rounded-xl text-sm font-medium hover:bg-blue-800 transition-colors disabled:opacity-60"
                disabled={loading || !!error}
                data-testid="download-pdf-btn"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                {loading ? 'Menyiapkan...' : 'Download'}
              </button>
            )}
          </PDFDownloadLink>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
            data-testid="close-preview-btn"
          >
            <X size={18} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 min-h-0 bg-gray-100">
        <PDFViewer width="100%" height="100%" showToolbar={false} style={{ border: 'none' }}>
          <LaporanPDF monthData={monthData} settings={settings} />
        </PDFViewer>
      </div>

      {/* Bottom bar */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-gray-200 bg-white">
        <button
          onClick={onClose}
          className="w-full h-11 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          data-testid="close-preview-bottom-btn"
        >
          Tutup
        </button>
      </div>
    </div>
  );
};

export default PreviewModal;
