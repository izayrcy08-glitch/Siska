export const BULAN_INDONESIA = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember'
];

const HARI_NAMA = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];

// Parse "HH:MM" → total minutes, or null if invalid
export function parseTimeToMinutes(timeStr) {
  if (!timeStr) return null;
  const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  if (h > 23 || m > 59) return null;
  return h * 60 + m;
}

export function minutesToHHMM(total) {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}

export function minutesToHHMMSS(total) {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:00`;
}

export function calcDurationMinutes(jamMulai, jamSelesai) {
  const s = parseTimeToMinutes(jamMulai);
  const e = parseTimeToMinutes(jamSelesai);
  if (s === null || e === null || e <= s) return null;
  return e - s;
}

export function formatDurationHHMMSS(minutes) {
  if (minutes === null || minutes <= 0) return '—';
  return minutesToHHMMSS(minutes);
}

export function formatDurationText(minutes) {
  if (!minutes || minutes <= 0) return '0 Jam';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h} Jam`;
  return `${h} Jam ${m} Menit`;
}

export function calcTotalHariMinutes(kegiatanList) {
  let total = 0;
  for (const k of (kegiatanList || [])) {
    if (!k.namaKegiatan || !k.namaKegiatan.trim()) continue;
    const dur = calcDurationMinutes(k.jamMulai, k.jamSelesai);
    if (dur) total += dur;
  }
  return total;
}

export function getDaysInMonth(bulan, tahun) {
  return new Date(tahun, bulan, 0).getDate();
}

export function getDateString(tahun, bulan, hari) {
  return `${tahun}-${String(bulan).padStart(2,'0')}-${String(hari).padStart(2,'0')}`;
}

export function getDayOfWeek(dateStr) {
  return new Date(dateStr + 'T00:00:00').getDay();
}

export function isWeekend(dateStr) {
  const d = getDayOfWeek(dateStr);
  return d === 0 || d === 6;
}

export function getDayName(dateStr) {
  return HARI_NAMA[getDayOfWeek(dateStr)];
}

export function getStorageKey(bulan, tahun) {
  return `activities_${String(bulan).padStart(2,'0')}_${tahun}`;
}

export function generateEmptyMonthData(bulan, tahun) {
  const daysCount = getDaysInMonth(bulan, tahun);
  const hari = [];
  for (let d = 1; d <= daysCount; d++) {
    hari.push({
      tanggal: getDateString(tahun, bulan, d),
      kegiatan: [],
      disimpan: false,
      totalMenitHari: 0,
    });
  }
  return { bulan, tahun, hari };
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function getLastDayOfMonth(bulan, tahun) {
  return getDaysInMonth(bulan, tahun);
}
