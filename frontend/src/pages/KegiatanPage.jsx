import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import BulanPicker from '../components/kegiatan/BulanPicker';
import DayCard from '../components/kegiatan/DayCard';
import TotalBulanan from '../components/kegiatan/TotalBulanan';
import OnboardingCard from '../components/kegiatan/OnboardingCard';
import PreviewModal from '../components/pdf/PreviewModal';
import {
  getStorageKey, generateEmptyMonthData, getDateString, isWeekend
} from '../utils/timeUtils';
import {
  countMonthProgress,
  dayFillStatus,
  dismissOnboarding,
  isOnboardingDismissed,
  isPDFReady as checkPDFReady,
  loadSettings,
  saveActivity,
} from '../utils/storage';

const FILTERS = [
  { key: 'semua', label: 'Semua' },
  { key: 'kerja', label: 'Kerja' },
  { key: 'belum', label: 'Belum diisi' },
  { key: 'tersimpan', label: 'Tersimpan' },
];

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

function todayParts() {
  const d = new Date();
  return {
    bulan: d.getMonth() + 1,
    tahun: d.getFullYear(),
    tanggal: getDateString(d.getFullYear(), d.getMonth() + 1, d.getDate()),
  };
}

const KegiatanPage = ({ activeMonth, onMonthChange, onGoToSettings, dataVersion = 0 }) => {
  const [monthData, setMonthData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [settings, setSettings] = useState(() => loadSettings());
  const [filter, setFilter] = useState('semua');
  const [focusDate, setFocusDate] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(() => !isOnboardingDismissed());
  const [pdfOpenedOnce, setPdfOpenedOnce] = useState(false);

  useEffect(() => {
    setSettings(loadSettings());
  }, [dataVersion]);

  useEffect(() => {
    const key = getStorageKey(activeMonth.bulan, activeMonth.tahun);
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        const { data, changed } = migrateLegacyApelPagi(parsed);
        if (changed) {
          const result = saveActivity(key, data);
          if (!result.ok) toast.error('Gagal menyimpan migrasi data');
        }
        setMonthData(data);
      } else {
        const empty = generateEmptyMonthData(activeMonth.bulan, activeMonth.tahun);
        const result = saveActivity(key, empty);
        if (!result.ok) toast.error('Gagal membuat data bulan baru');
        setMonthData(empty);
      }
    } catch {
      setMonthData(generateEmptyMonthData(activeMonth.bulan, activeMonth.tahun));
    }
  }, [activeMonth, dataVersion]);

  const handleSaveDay = useCallback((tanggal, updatedDay) => {
    setMonthData(prev => {
      if (!prev) return prev;
      const newData = {
        ...prev,
        hari: prev.hari.map(h => h.tanggal === tanggal ? { ...h, ...updatedDay } : h)
      };
      const key = getStorageKey(prev.bulan, prev.tahun);
      const result = saveActivity(key, newData);
      if (!result.ok) {
        toast.error('Gagal menyimpan kegiatan');
      }
      return newData;
    });
  }, []);

  const handleMonthChange = (newBulan, newTahun) => {
    // Multi-month safe: only switch view, never delete previous month
    onMonthChange({ bulan: newBulan, tahun: newTahun });
  };

  const handleOpenPreview = () => {
    setSettings(loadSettings());
    setShowPreview(true);
    setPdfOpenedOnce(true);
  };

  const today = todayParts();
  const isCurrentMonth =
    activeMonth.bulan === today.bulan && activeMonth.tahun === today.tahun;

  const handleGoToday = () => {
    if (!isCurrentMonth) {
      onMonthChange({ bulan: today.bulan, tahun: today.tahun });
    }
    setFocusDate(today.tanggal);
    // Scroll after render
    requestAnimationFrame(() => {
      setTimeout(() => {
        const el = document.getElementById(`day-${today.tanggal}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    });
  };

  // Auto-focus today when landing on current month first load
  useEffect(() => {
    if (isCurrentMonth && monthData) {
      setFocusDate(today.tanggal);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMonth.bulan, activeMonth.tahun, !!monthData]);

  const progress = useMemo(
    () => countMonthProgress(monthData?.hari),
    [monthData]
  );

  const progressLabel =
    progress.total > 0
      ? `${progress.tersimpan} tersimpan · ${progress.draft} draf · ${progress.kosong} kosong`
      : null;

  const filteredHari = useMemo(() => {
    if (!monthData?.hari) return [];
    return monthData.hari.filter((day) => {
      const status = dayFillStatus(day);
      if (filter === 'kerja') return !isWeekend(day.tanggal);
      if (filter === 'belum') return status === 'kosong' || status === 'draft';
      if (filter === 'tersimpan') return status === 'tersimpan';
      return true;
    });
  }, [monthData, filter]);

  const totalMenitBulan = monthData?.hari
    ?.filter(h => h.disimpan)
    .reduce((sum, h) => sum + (h.totalMenitHari || 0), 0) || 0;

  const storageKey = getStorageKey(activeMonth.bulan, activeMonth.tahun);
  const freshSettings = loadSettings();
  const pdfReady = checkPDFReady(freshSettings || settings);
  const savedDaysCount = progress.tersimpan;

  const stepsDone = {
    settings: pdfReady,
    kegiatan: savedDaysCount > 0,
    pdf: pdfOpenedOnce,
  };

  // Auto-hide onboarding when fully complete
  useEffect(() => {
    if (stepsDone.settings && stepsDone.kegiatan && stepsDone.pdf && showOnboarding) {
      // keep visible briefly? Better keep until user dismisses or all truly done — hide when all done
      const t = setTimeout(() => {
        dismissOnboarding();
        setShowOnboarding(false);
      }, 800);
      return () => clearTimeout(t);
    }
  }, [stepsDone.settings, stepsDone.kegiatan, stepsDone.pdf, showOnboarding]);

  const handleDismissOnboarding = () => {
    dismissOnboarding();
    setShowOnboarding(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <BulanPicker
        bulan={activeMonth.bulan}
        tahun={activeMonth.tahun}
        onMonthChange={handleMonthChange}
        onGoToday={handleGoToday}
        showGoToday
        progressLabel={progressLabel}
      />

      {showOnboarding && (
        <OnboardingCard
          stepsDone={stepsDone}
          onGoToSettings={onGoToSettings}
          onDismiss={handleDismissOnboarding}
        />
      )}

      {/* Filters */}
      <div className="px-3 pt-3 flex gap-1.5 overflow-x-auto no-scrollbar">
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              data-testid={`filter-${f.key}`}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                active
                  ? 'bg-blue-900 text-white border-blue-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <div className="px-3 pt-3">
        {!monthData && (
          <div className="text-center py-10 text-sm text-gray-400">Memuat data bulan...</div>
        )}
        {monthData && filteredHari.length === 0 && (
          <div className="text-center py-10 text-sm text-gray-400 bg-white rounded-2xl border border-gray-100">
            Tidak ada hari yang cocok dengan filter ini.
          </div>
        )}
        {filteredHari.map((dayData) => {
          const idx = monthData.hari.findIndex((h) => h.tanggal === dayData.tanggal);
          const prevDayKegiatan = idx > 0 ? (monthData.hari[idx - 1].kegiatan || null) : null;
          return (
            <DayCard
              key={`${dayData.tanggal}-${dataVersion}`}
              dayData={dayData}
              storageKey={storageKey}
              onSaveDay={handleSaveDay}
              prevDayKegiatan={prevDayKegiatan}
              forceExpand={focusDate === dayData.tanggal}
            />
          );
        })}
      </div>

      <TotalBulanan
        bulan={activeMonth.bulan}
        tahun={activeMonth.tahun}
        totalMenitBulan={totalMenitBulan}
        isPDFReady={pdfReady}
        settings={freshSettings || settings}
        draftCount={progress.draft}
        savedDaysCount={savedDaysCount}
        onPreviewPDF={handleOpenPreview}
        onGoToSettings={onGoToSettings}
      />

      {showPreview && (
        <PreviewModal
          monthData={monthData}
          settings={settings || freshSettings}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};

export default KegiatanPage;
