import React, { useState } from 'react';
import KegiatanItem from './KegiatanItem';
import { validateKegiatanHari } from '../../utils/validasiKegiatan';
import {
  calcTotalHariMinutes, formatDurationText,
  generateId, getDayName, isWeekend, isNoApelPagiDay
} from '../../utils/timeUtils';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '../ui/alert-dialog';
import { ChevronDown, ChevronUp, Plus, Bell, Save, CheckCircle2, Copy, Trash2 } from 'lucide-react';

const DayCard = ({ dayData, storageKey, onSaveDay, prevDayKegiatan }) => {
  const { tanggal, disimpan: initSaved, totalMenitHari: initTotal } = dayData;

  const [kegiatan, setKegiatan] = useState(dayData.kegiatan || []);
  const [isSaved, setIsSaved] = useState(initSaved || false);
  const [totalMenitHari, setTotalMenitHari] = useState(initTotal || 0);
  const [expanded, setExpanded] = useState(false);
  const [errors, setErrors] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [modifiedAfterSave, setModifiedAfterSave] = useState(false);
  const [saveError, setSaveError] = useState('');

  const dayName = getDayName(tanggal);
  const weekend = isWeekend(tanggal);
  const noApelPagiDay = isNoApelPagiDay(tanggal);
  const dayNum = parseInt(tanggal.split('-')[2], 10);
  const hasApelPagi = kegiatan.some(k => k.namaKegiatan === 'Apel Pagi');
  const hasFilledKegiatan = kegiatan.some(k => k.namaKegiatan && k.namaKegiatan.trim());
  const canCopyPrev = prevDayKegiatan?.some(k => k.namaKegiatan?.trim());

  const persistDraft = (updatedKegiatan) => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const data = JSON.parse(raw);
        const idx = data.hari.findIndex(h => h.tanggal === tanggal);
        if (idx !== -1) {
          data.hari[idx].kegiatan = updatedKegiatan;
          localStorage.setItem(storageKey, JSON.stringify(data));
        }
      }
    } catch {}
  };

  const handleAddKegiatan = () => {
    const newK = { id: generateId(), namaKegiatan: '', jamMulai: '', jamSelesai: '' };
    const updated = [...kegiatan, newK];
    setKegiatan(updated);
    if (isSaved) setModifiedAfterSave(true);
    setSaveError('');
    persistDraft(updated);
  };

  const handleAddApelPagi = () => {
    if (hasApelPagi) return;
    const apelPagi = {
      id: generateId(),
      namaKegiatan: 'Apel Pagi',
      jamMulai: '07:00', jamSelesai: '07:30',
      isApelPagi: true
    };
    const updated = [apelPagi, ...kegiatan];
    setKegiatan(updated);
    if (isSaved) setModifiedAfterSave(true);
    persistDraft(updated);
  };

  const handleCopyPrevDay = () => {
    if (!canCopyPrev) return;
    const copied = prevDayKegiatan
      .filter(k => k.namaKegiatan?.trim())
      .map(k => ({ ...k, id: generateId() }));
    setKegiatan(copied);
    if (isSaved) setModifiedAfterSave(true);
    setSaveError('');
    persistDraft(copied);
  };

  const handleUpdateKegiatan = (id, field, value) => {
    const updated = kegiatan.map(k => k.id === id ? { ...k, [field]: value } : k);
    setKegiatan(updated);
    if (isSaved) setModifiedAfterSave(true);
    if (errors[id]?.[field]) {
      setErrors(prev => ({ ...prev, [id]: { ...prev[id], [field]: undefined } }));
    }
    persistDraft(updated);
  };

  const handleDeleteKegiatan = (id) => {
    const updated = kegiatan.filter(k => k.id !== id);
    setKegiatan(updated);
    if (isSaved) setModifiedAfterSave(true);
    setSaveError('');
    persistDraft(updated);
  };

  const handleDeleteAll = () => {
    setKegiatan([]);
    setIsSaved(false);
    setTotalMenitHari(0);
    setModifiedAfterSave(false);
    setErrors({});
    setSaveError('');
    setShowDeleteAllConfirm(false);
    onSaveDay(tanggal, { kegiatan: [], disimpan: false, totalMenitHari: 0 });
  };

  const handleSave = () => {
    const filledKegiatan = kegiatan.filter(k => k.namaKegiatan?.trim());
    if (filledKegiatan.length === 0) {
      setSaveError('Harap isi minimal 1 kegiatan sebelum menyimpan.');
      return;
    }
    const nonApelFilled = filledKegiatan.filter(k => !k.isApelPagi);
    if (nonApelFilled.length === 0) {
      setSaveError('Harap isi minimal 1 kegiatan kerja selain Apel Pagi.');
      return;
    }

    const { errors: validationErrors, valid } = validateKegiatanHari(kegiatan);
    if (!valid) {
      setErrors(validationErrors);
      if (!expanded) setExpanded(true);
      setSaveError('');
      return;
    }
    setSaveError('');
    setErrors({});
    setShowConfirm(true);
  };

  const confirmSave = () => {
    const totalMenit = calcTotalHariMinutes(kegiatan);
    setIsSaved(true);
    setTotalMenitHari(totalMenit);
    setModifiedAfterSave(false);
    setShowConfirm(false);
    setExpanded(false);
    onSaveDay(tanggal, { kegiatan, disimpan: true, totalMenitHari: totalMenit });
  };

  const hasErrors = Object.values(errors).some(e => e && Object.values(e).some(Boolean));

  return (
    <>
      <div className={`bg-white rounded-2xl border mb-2.5 overflow-hidden transition-all ${
        expanded ? 'border-blue-200 shadow-md' : 'border-gray-200 shadow-sm'
      }`}>
        {/* Card Header */}
        <button
          className="w-full px-4 py-3 flex items-center justify-between active:bg-gray-50 transition-colors"
          onClick={() => setExpanded(e => !e)}
          data-testid={`day-card-header-${tanggal}`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${
              isSaved && !modifiedAfterSave ? 'bg-blue-900 text-white' :
              weekend ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-700'
            }`}>
              {dayNum}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-gray-800">{dayName}</span>
                {weekend && (
                  <span className="text-xs px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded-full font-medium">Libur</span>
                )}
                {isSaved && !modifiedAfterSave && (
                  <CheckCircle2 size={13} className="text-teal-500" />
                )}
              </div>
              <span className="text-xs text-gray-400">{tanggal}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {modifiedAfterSave && (
              <span className="text-xs text-orange-500 font-medium">Belum disimpan</span>
            )}
            {isSaved && !modifiedAfterSave && totalMenitHari > 0 && (
              <span className="text-xs font-semibold text-blue-900">{formatDurationText(totalMenitHari)}</span>
            )}
            {expanded ? (
              <ChevronUp size={17} className="text-gray-400" />
            ) : (
              <ChevronDown size={17} className="text-gray-400" />
            )}
          </div>
        </button>

        {/* Expanded Content */}
        {expanded && (
          <div className="px-4 pb-4 border-t border-gray-100">
            {/* Activity list */}
            <div className="mt-3 space-y-2">
              {kegiatan.length === 0 && (
                <div className="text-center py-5 text-sm text-gray-400 bg-gray-50 rounded-xl">
                  Belum ada kegiatan. Tambahkan di bawah.
                </div>
              )}
              {kegiatan.map(k => (
                <KegiatanItem
                  key={k.id}
                  kegiatan={k}
                  errors={errors[k.id] || {}}
                  onUpdate={(field, value) => handleUpdateKegiatan(k.id, field, value)}
                  onDelete={() => handleDeleteKegiatan(k.id)}
                />
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 mt-3 flex-wrap">
              <button
                onClick={handleAddKegiatan}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-blue-700 bg-blue-50 rounded-xl hover:bg-blue-100 active:scale-95 transition-all font-medium"
                data-testid={`add-kegiatan-btn-${tanggal}`}
              >
                <Plus size={15} />
                Tambah Kegiatan
              </button>
              {!hasApelPagi && !noApelPagiDay && (
                <button
                  onClick={handleAddApelPagi}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm text-teal-700 bg-teal-50 rounded-xl hover:bg-teal-100 active:scale-95 transition-all font-medium"
                  data-testid={`add-apel-pagi-btn-${tanggal}`}
                >
                  <Bell size={15} />
                  + Apel Pagi
                </button>
              )}
              {canCopyPrev && (
                <button
                  onClick={handleCopyPrevDay}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm text-indigo-700 bg-indigo-50 rounded-xl hover:bg-indigo-100 active:scale-95 transition-all font-medium"
                  data-testid={`copy-prev-day-btn-${tanggal}`}
                >
                  <Copy size={15} />
                  Salin Hari Sebelumnya
                </button>
              )}
              {kegiatan.length > 0 && (
                <button
                  onClick={() => setShowDeleteAllConfirm(true)}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 bg-red-50 rounded-xl hover:bg-red-100 active:scale-95 transition-all font-medium"
                  data-testid={`delete-all-btn-${tanggal}`}
                >
                  <Trash2 size={15} />
                  Hapus Semua
                </button>
              )}
            </div>

            {/* Save error warning */}
            {(hasErrors || saveError) && (
              <div className="mt-3 px-3 py-2 bg-red-50 rounded-xl border border-red-200 space-y-0.5">
                {saveError && <p className="text-xs text-red-600 font-medium">{saveError}</p>}
                {hasErrors && <p className="text-xs text-red-600 font-medium">Ada kesalahan pada input jam. Periksa kembali sebelum menyimpan.</p>}
              </div>
            )}

            {/* Daily total when saved */}
            {isSaved && !modifiedAfterSave && totalMenitHari > 0 && (
              <div className="mt-3 text-sm text-gray-600 px-1">
                Total hari ini: <span className="font-semibold text-gray-900">{formatDurationText(totalMenitHari)}</span>
              </div>
            )}

            {/* Save Button / Saved State Display */}
            {isSaved && !modifiedAfterSave ? (
              <div className="mt-3 w-full h-12 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 bg-teal-50 text-teal-700 border border-teal-200">
                <CheckCircle2 size={16} />
                Kegiatan Tersimpan
              </div>
            ) : hasFilledKegiatan ? (
              <button
                onClick={handleSave}
                className={`mt-3 w-full h-12 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-98 ${
                  modifiedAfterSave
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : 'bg-blue-900 text-white hover:bg-blue-800'
                }`}
                data-testid={`save-day-btn-${tanggal}`}
              >
                <Save size={16} />
                {modifiedAfterSave ? 'Simpan Perubahan' : 'Simpan'}
              </button>
            ) : null}
          </div>
        )}
      </div>

      {/* Save Confirmation */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Simpan Kegiatan?</AlertDialogTitle>
            <AlertDialogDescription>
              Simpan kegiatan hari {tanggal}? Data tetap bisa diedit setelahnya.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSave} data-testid={`confirm-save-btn-${tanggal}`}>
              Ya, Simpan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete All Confirmation */}
      <AlertDialog open={showDeleteAllConfirm} onOpenChange={setShowDeleteAllConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Semua Kegiatan?</AlertDialogTitle>
            <AlertDialogDescription>
              Semua kegiatan pada hari {tanggal} akan dihapus. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAll}
              className="bg-red-600 hover:bg-red-700"
              data-testid={`confirm-delete-all-btn-${tanggal}`}
            >
              Ya, Hapus Semua
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DayCard;
