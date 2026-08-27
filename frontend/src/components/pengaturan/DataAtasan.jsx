import React, { useEffect, useRef } from 'react';
import { Lock, Users } from 'lucide-react';
import {
  ATASAN_HEADER_PRESETS,
  DEFAULT_ATASAN_TANDA_TANGAN,
  matchHeaderPreset,
} from '../../constants/atasanPresets';

const inputClass =
  'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50 transition-all';

function resolveTtd(nextAtasan) {
  if (matchHeaderPreset(nextAtasan)) {
    return { ...DEFAULT_ATASAN_TANDA_TANGAN };
  }
  return { nama: nextAtasan.nama || '', nip: nextAtasan.nip || '' };
}

const DataAtasan = ({ atasan = {}, atasanTandaTangan = {}, onChange }) => {
  const header = {
    nama: atasan.nama || '',
    nip: atasan.nip || '',
    jabatan: atasan.jabatan || '',
  };

  const matched = matchHeaderPreset(header);
  const isLocked = Boolean(matched);
  const selectValue = matched?.id || '';

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  /** Hartadi → TTD Syahbudi; manual → TTD = nama+NIP yang sama */
  const emit = (nextAtasan) => {
    onChange?.({ atasan: nextAtasan, atasanTandaTangan: resolveTtd(nextAtasan) });
  };

  // Samakan TTD tersimpan dengan aturan mode (mis. data lama / setelah ganti mode)
  useEffect(() => {
    const expected = resolveTtd(header);
    const same =
      (atasanTandaTangan.nama || '') === expected.nama &&
      (atasanTandaTangan.nip || '') === expected.nip;
    if (same) return;
    onChangeRef.current?.({ atasan: header, atasanTandaTangan: expected });
  }, [header.nama, header.nip, header.jabatan, atasanTandaTangan.nama, atasanTandaTangan.nip]);

  const updateHeader = (field, next) => {
    emit({ ...header, [field]: next });
  };

  const handlePresetSelect = (e) => {
    const id = e.target.value;
    if (!id) {
      emit({ nama: '', nip: '', jabatan: '' });
      return;
    }
    const preset = ATASAN_HEADER_PRESETS.find((p) => p.id === id);
    if (!preset) return;
    emit({
      nama: preset.nama,
      nip: preset.nip,
      jabatan: preset.jabatan,
    });
  };

  const ttdHintName = isLocked
    ? DEFAULT_ATASAN_TANDA_TANGAN.nama
    : header.nama.trim() || 'nama atasan yang diketik di atas';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
          <Users size={16} className="text-teal-700" />
        </div>
        <h2 className="font-semibold text-gray-900">Data Atasan</h2>
      </div>

      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">Atasan di atas tabel</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Muncul di blok ATASAN PDF (nama, NIP, jabatan).
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Pilih dari daftar
          </label>
          <div className="relative">
            <select
              value={selectValue}
              onChange={handlePresetSelect}
              className={`${inputClass}${isLocked ? ' pr-10' : ''}`}
              data-testid="atasan-preset"
            >
              <option value="">Ketik manual / pilih…</option>
              {ATASAN_HEADER_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
            {isLocked && (
              <Lock
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                aria-hidden
              />
            )}
          </div>
        </div>

        {isLocked ? (
          <div className="rounded-xl bg-gray-50 border border-gray-100 px-3 py-3 space-y-2 text-sm">
            <div>
              <p className="text-xs text-gray-400">Nama</p>
              <p className="text-gray-800" data-testid="atasan-nama">{matched.nama}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">NIP</p>
              <p className="text-gray-800" data-testid="atasan-nip">{matched.nip}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Jabatan</p>
              <p className="text-gray-800" data-testid="atasan-jabatan">{matched.jabatan}</p>
            </div>
          </div>
        ) : (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Nama Atasan</label>
              <input
                type="text"
                value={header.nama}
                onChange={(e) => updateHeader('nama', e.target.value)}
                placeholder="Contoh: HARTADI, S.T."
                className={inputClass}
                data-testid="atasan-nama"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">NIP Atasan</label>
              <input
                type="text"
                value={header.nip}
                onChange={(e) => updateHeader('nip', e.target.value)}
                placeholder="Contoh: 19811104 201001 1 018"
                className={inputClass}
                data-testid="atasan-nip"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Jabatan Atasan</label>
              <textarea
                value={header.jabatan}
                onChange={(e) => updateHeader('jabatan', e.target.value)}
                placeholder="Contoh: Kepala UPT Balai Pengelolaan Alat..."
                rows={2}
                className={`${inputClass} resize-none`}
                data-testid="atasan-jabatan"
              />
            </div>
          </>
        )}

        <p className="text-xs text-gray-400 pt-1">
          {isLocked ? (
            <>
              Tanda tangan Pejabat Penilai di PDF memakai{' '}
              <span className="font-medium text-gray-600">{ttdHintName}</span>.
            </>
          ) : (
            <>
              Mode manual: atasan di atas tabel dan tanda tangan Pejabat Penilai memakai data yang sama
              {header.nama.trim() ? (
                <>
                  {' '}
                  (
                  <span className="font-medium text-gray-600">{header.nama.trim()}</span>
                  ).
                </>
              ) : (
                '.'
              )}
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default DataAtasan;
