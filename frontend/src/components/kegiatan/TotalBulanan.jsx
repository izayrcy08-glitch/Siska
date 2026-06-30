import React from 'react';
import { FileText, AlertCircle } from 'lucide-react';
import { BULAN_INDONESIA, formatDurationText } from '../../utils/timeUtils';

const TotalBulanan = ({ bulan, tahun, totalMenitBulan, isPDFReady, onPreviewPDF }) => {
  const namaBulan = BULAN_INDONESIA[bulan - 1];
  const totalJam = Math.floor(totalMenitBulan / 60);

  return (
    <div className="px-4 pb-6 mt-2">
      {/* Total Summary Card */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-2xl p-4 text-white mb-4 shadow-md">
        <p className="text-blue-200 text-xs font-medium uppercase tracking-wider mb-1">Total Jam Kerja Efektif</p>
        <p className="text-2xl font-bold">{totalJam} Jam</p>
        <p className="text-blue-200 text-sm mt-0.5">{namaBulan} {tahun}</p>
      </div>

      {/* PDF Button */}
      <button
        onClick={onPreviewPDF}
        disabled={!isPDFReady}
        data-testid="preview-pdf-btn"
        className={`w-full h-14 rounded-xl flex items-center justify-center gap-2 text-base font-semibold transition-all ${
          isPDFReady
            ? 'bg-teal-700 text-white hover:bg-teal-800 active:scale-98 shadow-sm'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        <FileText size={20} />
        Preview & Download PDF
      </button>

      {!isPDFReady && (
        <div className="flex items-start gap-2 mt-2 px-1">
          <AlertCircle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-gray-500">
            Lengkapi data pegawai di Pengaturan terlebih dahulu
          </p>
        </div>
      )}
    </div>
  );
};

export default TotalBulanan;
