import React, { useState, useEffect, useCallback } from 'react';
import BulanPicker from '../components/kegiatan/BulanPicker';
import DayCard from '../components/kegiatan/DayCard';
import TotalBulanan from '../components/kegiatan/TotalBulanan';
import PreviewModal from '../components/pdf/PreviewModal';
import {
  getStorageKey, generateEmptyMonthData
} from '../utils/timeUtils';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '../components/ui/alert-dialog';

function loadSettings() {
  try { return JSON.parse(localStorage.getItem('settings')) || null; } catch { return null; }
}

/** One-shot: old default Apel Pagi 07:30–08:00 → 07:00–07:30 */
function migrateLegacyApelPagi(monthData) {
  if (!monthData?.hari) return { data: monthData, changed: false };
  let changed = false;
  const hari = monthData.hari.map(h => {
    if (!h.kegiatan?.length) return h;
    let dayChanged = false;
    const kegiatan = h.kegiatan.map(k => {
      const isApel = k.isApelPagi || k.namaKegiatan === 'Apel Pagi';
      if (isApel && k.jamMulai === '07:30' && k.jamSelesai === '08:00') {
        dayChanged = true;
        changed = true;
        return { ...k, jamMulai: '07:00', jamSelesai: '07:30' };
      }
      return k;
    });
    return dayChanged ? { ...h, kegiatan } : h;
  });
  return { data: changed ? { ...monthData, hari } : monthData, changed };
}

const KegiatanPage = ({ onGoToSettings }) => {
  const today = new Date();
  const [activeMonth, setActiveMonth] = useState({
    bulan: today.getMonth() + 1,
    tahun: today.getFullYear()
  });
  const [monthData, setMonthData] = useState(null);
  const [showMonthConfirm, setShowMonthConfirm] = useState(false);
  const [pendingMonth, setPendingMonth] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [settings, setSettings] = useState(null);

  // Load settings on mount and keep fresh
  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  // Re-read settings on every render for isPDFReady check
  const freshSettings = loadSettings();
  const isPDFReady = !!(freshSettings?.pegawai?.nama);

  // Load month data
  useEffect(() => {
    const key = getStorageKey(activeMonth.bulan, activeMonth.tahun);
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        const { data, changed } = migrateLegacyApelPagi(parsed);
        if (changed) localStorage.setItem(key, JSON.stringify(data));
        setMonthData(data);
      } else {
        const empty = generateEmptyMonthData(activeMonth.bulan, activeMonth.tahun);
        localStorage.setItem(key, JSON.stringify(empty));
        setMonthData(empty);
      }
    } catch {
      const empty = generateEmptyMonthData(activeMonth.bulan, activeMonth.tahun);
      setMonthData(empty);
    }
  }, [activeMonth]);

  const handleSaveDay = useCallback((tanggal, updatedDay) => {
    setMonthData(prev => {
      if (!prev) return prev;
      const newData = {
        ...prev,
        hari: prev.hari.map(h => h.tanggal === tanggal ? { ...h, ...updatedDay } : h)
      };
      localStorage.setItem(getStorageKey(prev.bulan, prev.tahun), JSON.stringify(newData));
      return newData;
    });
  }, []);

  const handleMonthChange = (newBulan, newTahun) => {
    const hasData = monthData?.hari?.some(h => h.kegiatan && h.kegiatan.length > 0);
    if (hasData) {
      setPendingMonth({ bulan: newBulan, tahun: newTahun });
      setShowMonthConfirm(true);
    } else {
      setActiveMonth({ bulan: newBulan, tahun: newTahun });
    }
  };

  const confirmMonthChange = () => {
    if (!pendingMonth) return;
    const key = getStorageKey(activeMonth.bulan, activeMonth.tahun);
    localStorage.removeItem(key);
    setActiveMonth(pendingMonth);
    setShowMonthConfirm(false);
    setPendingMonth(null);
  };

  const handleOpenPreview = () => {
    // Fresh read of settings
    setSettings(loadSettings());
    setShowPreview(true);
  };

  const totalMenitBulan = monthData?.hari
    ?.filter(h => h.disimpan)
    .reduce((sum, h) => sum + (h.totalMenitHari || 0), 0) || 0;

  const storageKey = getStorageKey(activeMonth.bulan, activeMonth.tahun);

  return (
    <div className="min-h-screen bg-gray-50">
      <BulanPicker
        bulan={activeMonth.bulan}
        tahun={activeMonth.tahun}
        onMonthChange={handleMonthChange}
      />

      <div className="px-3 pt-3">
        {monthData?.hari?.map((dayData, idx) => {
          const prevDayKegiatan = idx > 0 ? (monthData.hari[idx - 1].kegiatan || null) : null;
          return (
            <DayCard
              key={dayData.tanggal}
              dayData={dayData}
              storageKey={storageKey}
              onSaveDay={handleSaveDay}
              prevDayKegiatan={prevDayKegiatan}
            />
          );
        })}
      </div>

      <TotalBulanan
        bulan={activeMonth.bulan}
        tahun={activeMonth.tahun}
        totalMenitBulan={totalMenitBulan}
        isPDFReady={isPDFReady}
        onPreviewPDF={handleOpenPreview}
        onGoToSettings={onGoToSettings}
      />

      {/* Month Change Confirmation */}
      <AlertDialog open={showMonthConfirm} onOpenChange={setShowMonthConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ganti Bulan?</AlertDialogTitle>
            <AlertDialogDescription>
              Pindah ke bulan baru akan menghapus semua kegiatan bulan ini. Lanjutkan?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setShowMonthConfirm(false); setPendingMonth(null); }}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmMonthChange} data-testid="confirm-month-change-btn">
              Ya, Lanjutkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* PDF Preview Modal */}
      {showPreview && (
        <PreviewModal
          monthData={monthData}
          settings={settings}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};

export default KegiatanPage;
