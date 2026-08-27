/** Preset atasan di atas tabel (blok ATASAN PDF) */
export const ATASAN_HEADER_PRESETS = [
  {
    id: 'hartadi',
    label: 'Hartadi, S.T',
    nama: 'Hartadi, S.T',
    nip: '19811104 201001 1 018',
    jabatan: 'Kepala UPT Balai Pengelolaan Alat dan Perbekalan',
  },
];

/** Default pejabat penilai (tanda tangan bawah tabel) */
export const DEFAULT_ATASAN_TANDA_TANGAN = {
  nama: 'Syahbudi Nor, A.Md',
  nip: '19850629 2014031 001',
};

export function matchHeaderPreset(atasan = {}) {
  return (
    ATASAN_HEADER_PRESETS.find(
      (p) =>
        (atasan.nama || '') === p.nama &&
        (atasan.nip || '') === p.nip &&
        (atasan.jabatan || '') === p.jabatan
    ) || null
  );
}
