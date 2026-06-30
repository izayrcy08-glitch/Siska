import React from 'react';
import { FileText, AlertCircle, Settings } from 'lucide-react';
import { BULAN_INDONESIA, formatDurationText } from '../../utils/timeUtils';

const TotalBulanan = ({ bulan, tahun, totalMenitBulan, isPDFReady, onPreviewPDF, onGoToSettings }) => {
  const namaBulan = BULAN_INDONESIA[bulan - 1];
  const totalJam = Math.floor(totalMenitBulan / 60);
  const sisaMenit = totalMenitBulan % 60;
  const totalDisplay = totalJam > 0
    ? (sisaMenit > 0 ? `${totalJam} Jam ${sisaMenit} Menit` : `${totalJam} Jam`)
    : (sisaMenit > 0 ? `${sisaMenit} Menit` : '0 Jam');

  return (
    <div className="px-4 pb-6 mt-2">
      {/* Total Summary Card */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-2xl p-4 text-white mb-4 shadow-md">
        <p className="text-blue-200 text-xs font-medium uppercase tracking-wider mb-1">Total Jam Kerja Efektif</p>
        <p className="text-2xl font-bold">{totalDisplay}</p>
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
        <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3">
          <div className="flex items-start gap-2 mb-2">
            <AlertCircle size={15} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-800 font-medium">
              Data pegawai belum diisi
            </p>
          </div>
          <p className="text-xs text-amber-700 mb-3 ml-5">
            Lengkapi nama, NIP, dan jabatan di Pengaturan untuk mengaktifkan tombol PDF.
          </p>
          {onGoToSettings && (
            <button
              onClick={onGoToSettings}
              className="ml-5 flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700 transition-colors"
              data-testid="go-to-settings-btn"
            >
              <Settings size={13} />
              Buka Pengaturan
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TotalBulanan;
