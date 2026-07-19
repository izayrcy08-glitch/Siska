import React from 'react';
import { calcDurationMinutes, formatDurationHHMMSS } from '../../utils/timeUtils';
import { Trash2 } from 'lucide-react';

const KegiatanItem = ({ kegiatan, errors = {}, onUpdate, onDelete }) => {
  const { id, namaKegiatan, jamMulai, jamSelesai, isApelPagi } = kegiatan;
  const durationMin = calcDurationMinutes(jamMulai, jamSelesai);
  const durationDisplay = durationMin !== null ? formatDurationHHMMSS(durationMin) : '—';

  return (
    <div className={`rounded-xl border p-3 ${isApelPagi ? 'bg-teal-50 border-teal-200' : 'bg-gray-50 border-gray-200'}`}>
      {isApelPagi && (
        <div className="flex items-center gap-1 mb-2">
          <span className="text-xs font-semibold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full">Apel Pagi</span>
        </div>
      )}

      <input
        type="text"
        value={namaKegiatan}
        onChange={e => onUpdate('namaKegiatan', e.target.value)}
        readOnly={isApelPagi}
        placeholder="Tulis kegiatan..."
        className={`w-full bg-transparent text-sm font-medium text-gray-800 placeholder-gray-400 border-0 border-b border-gray-200 pb-1.5 focus:outline-none focus:border-blue-500 transition-colors ${isApelPagi ? 'cursor-not-allowed text-gray-500' : ''}`}
        data-testid={`activity-name-${id}`}
      />

      <div className="grid grid-cols-3 gap-2 mt-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Mulai</label>
          <input
            type="time"
            value={jamMulai || ''}
            onChange={e => onUpdate('jamMulai', e.target.value)}
            className={`w-full text-sm rounded-lg border px-2 py-2 min-h-[40px] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
              errors.jamMulai ? 'border-red-400 bg-red-50' :
              isApelPagi ? 'border-teal-200 bg-white' : 'border-gray-200 bg-white'
            }`}
            data-testid={`activity-start-time-${id}`}
          />
          {errors.jamMulai && (
            <p className="text-xs text-red-500 mt-1 leading-tight">{errors.jamMulai}</p>
          )}
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Selesai</label>
          <input
            type="time"
            value={jamSelesai || ''}
            onChange={e => onUpdate('jamSelesai', e.target.value)}
            className={`w-full text-sm rounded-lg border px-2 py-2 min-h-[40px] focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
              errors.jamSelesai ? 'border-red-400 bg-red-50' :
              isApelPagi ? 'border-teal-200 bg-white' : 'border-gray-200 bg-white'
            }`}
            data-testid={`activity-end-time-${id}`}
          />
          {errors.jamSelesai && (
            <p className="text-xs text-red-500 mt-1 leading-tight">{errors.jamSelesai}</p>
          )}
        </div>

        <div>
          <label className="block text-xs text-gray-500 mb-1">Durasi</label>
          <div className={`text-sm rounded-lg border px-2 py-2 min-h-[40px] flex items-center justify-center font-mono ${
            durationMin !== null ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-gray-50 border-gray-200 text-gray-400'
          }`}>
            {durationDisplay}
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-2">
        <button
          onClick={onDelete}
          className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition-colors"
          data-testid={`delete-activity-btn-${id}`}
        >
          <Trash2 size={14} />
          Hapus
        </button>
      </div>
    </div>
  );
};

export default KegiatanItem;
