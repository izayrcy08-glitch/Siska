import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BULAN_INDONESIA } from '../../utils/timeUtils';

const BulanPicker = ({ bulan, tahun, onMonthChange }) => {
  const namaBulan = BULAN_INDONESIA[bulan - 1];

  const handlePrev = () => {
    if (bulan === 1) onMonthChange(12, tahun - 1);
    else onMonthChange(bulan - 1, tahun);
  };

  const handleNext = () => {
    if (bulan === 12) onMonthChange(1, tahun + 1);
    else onMonthChange(bulan + 1, tahun);
  };

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
      <div className="flex items-center justify-between px-4 py-4">
        <button
          onClick={handlePrev}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all"
          data-testid="prev-month-btn"
        >
          <ChevronLeft size={20} className="text-gray-700" />
        </button>

        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900">{namaBulan} {tahun}</h1>
          <p className="text-xs text-gray-400 mt-0.5">Pilih hari untuk input kegiatan</p>
        </div>

        <button
          onClick={handleNext}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all"
          data-testid="next-month-btn"
        >
          <ChevronRight size={20} className="text-gray-700" />
        </button>
      </div>
    </div>
  );
};

export default BulanPicker;
