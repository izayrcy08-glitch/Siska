import React, { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Download, Upload, Save, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import DataPegawai from '../components/pengaturan/DataPegawai';
import DataAtasan from '../components/pengaturan/DataAtasan';
import HeaderDokumen from '../components/pengaturan/HeaderDokumen';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '../components/ui/alert-dialog';
import {
  buildExportPayload,
  defaultSettings,
  downloadJson,
  importExportPayload,
  loadSettings,
  removeActivity,
  saveSettings,
} from '../utils/storage';
import { BULAN_INDONESIA, getStorageKey } from '../utils/timeUtils';

function mergeSettings(raw) {
  const base = defaultSettings();
  if (!raw) return base;
  return {
    pegawai: { ...base.pegawai, ...(raw.pegawai || {}) },
    atasan: { ...base.atasan, ...(raw.atasan || {}) },
    headerDokumen: { ...base.headerDokumen, ...(raw.headerDokumen || {}) },
  };
}

const PengaturanPage = ({ activeMonth, onDataChanged }) => {
  const [form, setForm] = useState(() => mergeSettings(loadSettings()));
  const [savedSnapshot, setSavedSnapshot] = useState(() => JSON.stringify(mergeSettings(loadSettings())));
  const [showConfirm1, setShowConfirm1] = useState(false);
  const [showConfirm2, setShowConfirm2] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    const next = mergeSettings(loadSettings());
    setForm(next);
    setSavedSnapshot(JSON.stringify(next));
  }, []);

  const isDirty = useMemo(() => JSON.stringify(form) !== savedSnapshot, [form, savedSnapshot]);

  const handleSave = () => {
    const result = saveSettings(form);
    if (!result.ok) {
      toast.error('Gagal menyimpan', {
        description: 'Penyimpanan browser penuh atau diblokir. Coba hapus logo atau data lama.',
      });
      return;
    }
    setSavedSnapshot(JSON.stringify(form));
    toast.success('Pengaturan tersimpan');
    onDataChanged?.();
  };

  const handleResetClick = () => setShowConfirm1(true);
  const handleConfirm1 = () => {
    setShowConfirm1(false);
    setShowConfirm2(true);
  };
  const handleConfirm2 = () => {
    if (!activeMonth) {
      toast.error('Bulan aktif tidak ditemukan');
      setShowConfirm2(false);
      return;
    }
    const key = getStorageKey(activeMonth.bulan, activeMonth.tahun);
    const result = removeActivity(key);
    setShowConfirm2(false);
    if (!result.ok) {
      toast.error('Gagal mereset data kegiatan');
      return;
    }
    setResetDone(true);
    toast.success('Kegiatan bulan ini direset');
    onDataChanged?.();
    setTimeout(() => setResetDone(false), 3000);
  };

  const handleExport = () => {
    try {
      // Persist current form first if dirty so export is complete
      if (isDirty) {
        const r = saveSettings(form);
        if (!r.ok) {
          toast.error('Simpan pengaturan dulu gagal — ekspor dibatalkan');
          return;
        }
        setSavedSnapshot(JSON.stringify(form));
      }
      const payload = buildExportPayload();
      const stamp = new Date().toISOString().slice(0, 10);
      downloadJson(`siska-backup-${stamp}.json`, payload);
      toast.success('Data berhasil diekspor');
    } catch {
      toast.error('Gagal mengekspor data');
    }
  };

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      const result = importExportPayload(payload);
      if (!result.ok) {
        toast.error(result.error || 'Impor gagal');
        return;
      }
      const next = mergeSettings(loadSettings());
      setForm(next);
      setSavedSnapshot(JSON.stringify(next));
      toast.success('Data berhasil diimpor');
      onDataChanged?.();
    } catch {
      toast.error('File JSON tidak valid');
    }
  };

  const bulanLabel = activeMonth
    ? `${BULAN_INDONESIA[activeMonth.bulan - 1]} ${activeMonth.tahun}`
    : 'bulan ini';

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <div className="bg-white border-b border-gray-100 px-4 py-5">
        <h1 className="text-xl font-bold text-gray-900">Pengaturan</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {isDirty ? 'Ada perubahan belum disimpan' : 'Semua perubahan sudah tersimpan'}
        </p>
      </div>

      <div className="px-4 pt-4">
        <DataPegawai
          value={form.pegawai}
          onChange={(pegawai) => setForm((prev) => ({ ...prev, pegawai }))}
        />
        <DataAtasan
          value={form.atasan}
          onChange={(atasan) => setForm((prev) => ({ ...prev, atasan }))}
        />
        <HeaderDokumen
          value={form.headerDokumen}
          onChange={(headerDokumen) => setForm((prev) => ({ ...prev, headerDokumen }))}
        />

        {/* Backup */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4">
          <h3 className="font-semibold text-gray-900 mb-1">Cadangan Data</h3>
          <p className="text-sm text-gray-500 mb-3">
            Ekspor atau impor seluruh pengaturan dan kegiatan (JSON). Berguna saat ganti perangkat.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-800 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors border border-blue-200"
              data-testid="export-data-btn"
            >
              <Download size={16} />
              Ekspor Data
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors border border-gray-200"
              data-testid="import-data-btn"
            >
              <Upload size={16} />
              Impor Data
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={handleImportFile}
            />
          </div>
        </div>

        {/* Reset */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4">
          <h3 className="font-semibold text-gray-900 mb-1">Reset Data Kegiatan</h3>
          <p className="text-sm text-gray-500 mb-3">
            Hapus seluruh kegiatan bulan <span className="font-medium text-gray-700">{bulanLabel}</span>.
            Data pegawai tidak ikut terhapus. Bulan lain tetap aman.
          </p>

          {resetDone && (
            <div className="mb-3 px-3 py-2 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
              Data kegiatan berhasil direset.
            </div>
          )}

          <button
            type="button"
            onClick={handleResetClick}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors border border-red-200"
            data-testid="reset-kegiatan-btn"
          >
            <Trash2 size={16} />
            Reset Kegiatan {bulanLabel}
          </button>
        </div>
      </div>

      {/* Sticky save bar */}
      <div className="fixed bottom-16 left-0 right-0 z-40 px-3 pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">
          <button
            type="button"
            onClick={handleSave}
            disabled={!isDirty}
            data-testid="save-settings-btn"
            className={`w-full h-12 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-lg transition-all ${
              isDirty
                ? 'bg-blue-900 text-white hover:bg-blue-800 active:scale-[0.99]'
                : 'bg-white text-teal-700 border border-teal-200 cursor-default'
            }`}
          >
            {isDirty ? (
              <>
                <Save size={16} />
                Simpan Pengaturan
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                Tersimpan
              </>
            )}
          </button>
        </div>
      </div>

      <AlertDialog open={showConfirm1} onOpenChange={setShowConfirm1}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-orange-500" />
              Hapus Semua Kegiatan?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Seluruh data kegiatan {bulanLabel} akan dihapus. Tindakan ini tidak dapat dibatalkan.
              Data pegawai dan atasan tidak ikut terhapus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm1} className="bg-red-600 hover:bg-red-700" data-testid="confirm-reset-step1-btn">
              Lanjutkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showConfirm2} onOpenChange={setShowConfirm2}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle size={18} />
              Konfirmasi Terakhir
            </AlertDialogTitle>
            <AlertDialogDescription>
              PERINGATAN: Semua kegiatan {bulanLabel} akan DIHAPUS PERMANEN dan tidak bisa dikembalikan.
              Apakah Anda benar-benar yakin?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm2} className="bg-red-600 hover:bg-red-700" data-testid="confirm-reset-final-btn">
              Ya, Hapus Semua
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PengaturanPage;
