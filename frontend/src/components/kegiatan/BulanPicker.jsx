import React from 'react';
import { ChevronLeft, ChevronRight, CalendarClock } from 'lucide-react';
import { BULAN_INDONESIA } from '../../utils/timeUtils';

const BulanPicker = ({ bulan, tahun, onMonthChange, onGoToday, showGoToday, progressLabel }) => {
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
      <div className="flex items-center justify-between px-4 py-3">
        <button
          type="button"
          onClick={handlePrev}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all"
          data-testid="prev-month-btn"
          aria-label="Bulan sebelumnya"
        >
          <ChevronLeft size={20} className="text-gray-700" />
        </button>

        <div className="text-center min-w-0 px-2">
          <h1 className="text-xl font-bold text-gray-900 truncate">{namaBulan} {tahun}</h1>
          {progressLabel ? (
            <p className="text-xs text-gray-500 mt-0.5 truncate">{progressLabel}</p>
          ) : (
            <p className="text-xs text-gray-400 mt-0.5">Data tiap bulan disimpan terpisah</p>
          )}
        </div>

        <button
          type="button"
          onClick={handleNext}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all"
          data-testid="next-month-btn"
          aria-label="Bulan berikutnya"
        >
          <ChevronRight size={20} className="text-gray-700" />
        </button>
      </div>

      {showGoToday && (
        <div className="px-4 pb-3 -mt-1">
          <button
            type="button"
            onClick={onGoToday}
            className="w-full flex items-center justify-center gap-2 h-9 rounded-xl bg-blue-50 text-blue-800 text-sm font-medium hover:bg-blue-100 border border-blue-100 transition-colors"
            data-testid="go-today-btn"
          >
            <CalendarClock size={15} />
            Ke Hari Ini
          </button>
        </div>
      )}
    </div>
  );
};

export default BulanPicker;
