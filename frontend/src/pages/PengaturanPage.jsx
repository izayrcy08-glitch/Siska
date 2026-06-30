import React, { useState } from 'react';
import DataPegawai from '../components/pengaturan/DataPegawai';
import DataAtasan from '../components/pengaturan/DataAtasan';
import HeaderDokumen from '../components/pengaturan/HeaderDokumen';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '../components/ui/alert-dialog';
import { Trash2, AlertTriangle } from 'lucide-react';

function getActiveMonthKey() {
  // Find all activity keys and return the most recent
  const keys = Object.keys(localStorage).filter(k => k.startsWith('activities_'));
  if (keys.length === 0) return null;
  // Return any one — there should only be one at a time
  return keys[0];
}

const PengaturanPage = () => {
  const [showConfirm1, setShowConfirm1] = useState(false);
  const [showConfirm2, setShowConfirm2] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const handleResetClick = () => setShowConfirm1(true);
  const handleConfirm1 = () => { setShowConfirm1(false); setShowConfirm2(true); };
  const handleConfirm2 = () => {
    const key = getActiveMonthKey();
    if (key) localStorage.removeItem(key);
    setShowConfirm2(false);
    setResetDone(true);
    setTimeout(() => setResetDone(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-5">
        <h1 className="text-xl font-bold text-gray-900">Pengaturan</h1>
        <p className="text-sm text-gray-400 mt-0.5">Data otomatis tersimpan saat Anda berpindah field</p>
      </div>

      <div className="px-4 pt-4">
        <DataPegawai />
        <DataAtasan />
        <HeaderDokumen />

        {/* Reset Button */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4">
          <h3 className="font-semibold text-gray-900 mb-1">Reset Data Kegiatan</h3>
          <p className="text-sm text-gray-500 mb-3">Hapus seluruh kegiatan bulan ini. Data pegawai tidak ikut terhapus.</p>

          {resetDone && (
            <div className="mb-3 px-3 py-2 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
              Data kegiatan berhasil direset.
            </div>
          )}

          <button
            onClick={handleResetClick}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors border border-red-200"
            data-testid="reset-kegiatan-btn"
          >
            <Trash2 size={16} />
            Reset Kegiatan Bulan Ini
          </button>
        </div>
      </div>

      {/* Confirmation Step 1 */}
      <AlertDialog open={showConfirm1} onOpenChange={setShowConfirm1}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-orange-500" />
              Hapus Semua Kegiatan?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Seluruh data kegiatan bulan ini akan dihapus. Tindakan ini tidak dapat dibatalkan.
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

      {/* Confirmation Step 2 */}
      <AlertDialog open={showConfirm2} onOpenChange={setShowConfirm2}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle size={18} />
              Konfirmasi Terakhir
            </AlertDialogTitle>
            <AlertDialogDescription>
              PERINGATAN: Semua kegiatan bulan ini akan DIHAPUS PERMANEN dan tidak bisa dikembalikan.
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
