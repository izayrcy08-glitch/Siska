import { parseTimeToMinutes } from './timeUtils';

export function validateKegiatanHari(kegiatanList) {
  const errors = {};
  if (!kegiatanList || kegiatanList.length === 0) return { errors, valid: true };

  const filled = kegiatanList.filter(k => k.namaKegiatan && k.namaKegiatan.trim());
  if (filled.length === 0) return { errors, valid: true };

  // Validate time format and logic for each activity
  for (const k of filled) {
    errors[k.id] = {};

    if (k.jamMulai && parseTimeToMinutes(k.jamMulai) === null) {
      errors[k.id].jamMulai = 'Format jam tidak valid';
    }
    if (k.jamSelesai && parseTimeToMinutes(k.jamSelesai) === null) {
      errors[k.id].jamSelesai = 'Format jam tidak valid';
    }

    if (k.jamMulai && k.jamSelesai && !errors[k.id].jamMulai && !errors[k.id].jamSelesai) {
      const s = parseTimeToMinutes(k.jamMulai);
      const e = parseTimeToMinutes(k.jamSelesai);
      if (e !== null && s !== null && e <= s) {
        errors[k.id].jamSelesai = 'Jam selesai harus setelah jam mulai';
      }
    }
  }

  const hasApelPagi = filled[0]?.namaKegiatan === 'Apel Pagi';
  const firstNonApel = hasApelPagi ? filled[1] : filled[0];

  // Without Apel Pagi, first activity must start at or after 06:00.
  // With Apel Pagi, subsequent activities are constrained by overlap vs apel end time.
  if (!hasApelPagi && firstNonApel && firstNonApel.jamMulai && !errors[firstNonApel.id]?.jamMulai) {
    const startMin = parseTimeToMinutes(firstNonApel.jamMulai);
    if (startMin !== null && startMin < 6 * 60) {
      errors[firstNonApel.id] = errors[firstNonApel.id] || {};
      errors[firstNonApel.id].jamMulai = 'Jam mulai minimal 06:00';
    }
  }

  // Validate no overlap between consecutive activities
  for (let i = 1; i < filled.length; i++) {
    const prev = filled[i - 1];
    const curr = filled[i];
    if (!prev.jamSelesai || !curr.jamMulai) continue;
    if (errors[prev.id]?.jamSelesai || errors[curr.id]?.jamMulai) continue;

    const prevEnd = parseTimeToMinutes(prev.jamSelesai);
    const currStart = parseTimeToMinutes(curr.jamMulai);
    if (prevEnd === null || currStart === null) continue;

    if (currStart < prevEnd) {
      errors[curr.id] = errors[curr.id] || {};
      errors[curr.id].jamMulai = `Jam tumpang tindih dengan kegiatan sebelumnya, mulai paling cepat ${prev.jamSelesai}`;
    }
  }

  const hasErrors = Object.values(errors).some(e => Object.keys(e).length > 0);
  return { errors, valid: !hasErrors };
}
