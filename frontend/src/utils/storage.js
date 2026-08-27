import { DEFAULT_ATASAN_TANDA_TANGAN } from '../constants/atasanPresets';

const SETTINGS_KEY = 'settings';
const ONBOARDING_KEY = 'siska_onboarding_dismissed';
const EXPORT_VERSION = 1;

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return null;
    return normalizeSettings(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveSettings(data) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(data));
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err };
  }
}

export function defaultSettings() {
  return {
    pegawai: { nama: '', nip: '', jabatan: '' },
    atasan: { nama: '', nip: '', jabatan: '' },
    atasanTandaTangan: { ...DEFAULT_ATASAN_TANDA_TANGAN },
    headerDokumen: { logoBase64: null, logoWidth: null, logoHeight: null, namaDinas: '', kota: '' },
  };
}

/** Gabungkan settings tersimpan dengan default (termasuk atasanTandaTangan baru). */
export function normalizeSettings(raw) {
  const base = defaultSettings();
  if (!raw) return base;
  return {
    pegawai: { ...base.pegawai, ...(raw.pegawai || {}) },
    atasan: { ...base.atasan, ...(raw.atasan || {}) },
    atasanTandaTangan: {
      ...base.atasanTandaTangan,
      ...(raw.atasanTandaTangan || {}),
    },
    headerDokumen: { ...base.headerDokumen, ...(raw.headerDokumen || {}) },
  };
}

export function isPDFReady(settings) {
  const p = settings?.pegawai;
  return !!(p?.nama?.trim() && p?.nip?.trim() && p?.jabatan?.trim());
}

export function getMissingPegawaiFields(settings) {
  const p = settings?.pegawai || {};
  const missing = [];
  if (!p.nama?.trim()) missing.push('Nama lengkap');
  if (!p.nip?.trim()) missing.push('NIP');
  if (!p.jabatan?.trim()) missing.push('Jabatan');
  return missing;
}

export function isOnboardingDismissed() {
  try {
    return localStorage.getItem(ONBOARDING_KEY) === '1';
  } catch {
    return false;
  }
}

export function dismissOnboarding() {
  try {
    localStorage.setItem(ONBOARDING_KEY, '1');
  } catch {
    /* ignore */
  }
}

export function listActivityKeys() {
  try {
    return Object.keys(localStorage).filter((k) => k.startsWith('activities_'));
  } catch {
    return [];
  }
}

export function loadActivity(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveActivity(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err };
  }
}

export function removeActivity(key) {
  try {
    localStorage.removeItem(key);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err };
  }
}

export function buildExportPayload() {
  const activities = {};
  for (const key of listActivityKeys()) {
    const data = loadActivity(key);
    if (data) activities[key] = data;
  }
  return {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    settings: loadSettings() || defaultSettings(),
    activities,
  };
}

export function importExportPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return { ok: false, error: 'Format file tidak valid' };
  }
  if (payload.version !== EXPORT_VERSION && payload.version !== 1) {
    return { ok: false, error: 'Versi backup tidak dikenali' };
  }
  try {
    if (payload.settings) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(payload.settings));
    }
    if (payload.activities && typeof payload.activities === 'object') {
      for (const [key, data] of Object.entries(payload.activities)) {
        if (!key.startsWith('activities_')) continue;
        localStorage.setItem(key, JSON.stringify(data));
      }
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: 'Gagal menyimpan data (storage penuh?)' };
  }
}

export function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function dayFillStatus(day) {
  const filled = (day?.kegiatan || []).some((k) => k.namaKegiatan?.trim());
  if (day?.disimpan) return 'tersimpan';
  if (filled) return 'draft';
  return 'kosong';
}

export function countMonthProgress(hari) {
  const list = hari || [];
  let tersimpan = 0;
  let draft = 0;
  let kosong = 0;
  for (const d of list) {
    const filled = (d.kegiatan || []).some((k) => k.namaKegiatan?.trim());
    if (d.disimpan) tersimpan += 1;
    else if (filled) draft += 1;
    else kosong += 1;
  }
  return { tersimpan, draft, kosong, total: list.length };
}
