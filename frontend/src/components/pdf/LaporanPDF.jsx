import React from 'react';
import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import {
  BULAN_INDONESIA, calcDurationMinutes, minutesToHHMMSS,
  getDaysInMonth
} from '../../utils/timeUtils';

const MARGIN = 28.35; // 10mm in pt

// Column width percentages — revised per user feedback
const COL = {
  NO: '4%',
  TANGGAL: '10%',
  KEGIATAN: '18%',
  KETERANGAN: '18%',
  KUANTITAS: '9%',
  MULAI: '8%',
  SELESAI: '8%',
  LAMA: '9%',
  PARAF: '16%',
};

const s = StyleSheet.create({
  page: {
    fontFamily: 'Times-Roman',
    fontSize: 8,
    color: '#000000',
    backgroundColor: '#FFFFFF',
    paddingTop: MARGIN,
    paddingBottom: MARGIN,
    paddingLeft: MARGIN,
    paddingRight: MARGIN,
  },
  // === SECTION 1: Optional header (logo + dinas) ===
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#000000',
    paddingBottom: 5,
    marginBottom: 6,
  },
  logoImg: { width: 55, height: 55, objectFit: 'contain', marginRight: 8 },
  namaInstansi: {
    fontFamily: 'Times-Bold', fontSize: 11, flex: 1, textAlign: 'center',
  },
  // === SECTION 2: Pegawai / Atasan header ===
  headerSection: { flexDirection: 'row', marginBottom: 8 },
  headerCol: { width: '50%', paddingRight: 10 },
  headerColR: { width: '50%', paddingLeft: 4 },
  hTitle: { fontFamily: 'Times-Bold', fontSize: 9, marginBottom: 3 },
  hRow: { flexDirection: 'row', marginBottom: 2 },
  hLabel: { fontFamily: 'Times-Roman', fontSize: 8, width: 44 },
  hColon: { fontFamily: 'Times-Roman', fontSize: 8, width: 8 },
  hValue: { fontFamily: 'Times-Roman', fontSize: 8, flex: 1 },

  // === TABLE ===
  table: {
    borderTopWidth: 1, borderLeftWidth: 1, borderColor: '#000000',
  },
  tableRow: { flexDirection: 'row' },

  // Cell base
  cell: {
    borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#000000',
    padding: 2, justifyContent: 'center', alignItems: 'center',
  },
  // Cell for merged rows — no bottom border on first row
  cellMergeTop: {
    borderRightWidth: 1, borderBottomWidth: 0, borderColor: '#000000',
    padding: 2, justifyContent: 'center', alignItems: 'center',
  },
  // Cell for merged rows — no top border on subsequent rows
  cellMergeCont: {
    borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#000000',
    borderTopWidth: 0,
    padding: 2, justifyContent: 'center', alignItems: 'center',
  },
  cellL: {
    borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#000000',
    padding: 2, justifyContent: 'center', alignItems: 'flex-start',
  },
  cellLMergeTop: {
    borderRightWidth: 1, borderBottomWidth: 0, borderColor: '#000000',
    padding: 2, justifyContent: 'center', alignItems: 'flex-start',
  },
  cellLMergeCont: {
    borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#000000',
    borderTopWidth: 0,
    padding: 2, justifyContent: 'center', alignItems: 'flex-start',
  },

  // Cell text styles
  cellText: { fontFamily: 'Times-Roman', fontSize: 7, textAlign: 'center' },
  cellTextL: { fontFamily: 'Times-Roman', fontSize: 7, textAlign: 'left' },
  boldCell: { fontFamily: 'Times-Bold', fontSize: 7, textAlign: 'center' },
  headerText: { fontFamily: 'Times-Bold', fontSize: 7, textAlign: 'center' },
  grandTotalCell: {
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#000000',
    padding: 4,
  },
  grandTotalText: { fontFamily: 'Times-Bold', fontSize: 9, textAlign: 'center' },

  // === FOOTER ===
  footerRow: { flexDirection: 'row', marginTop: 20 },
  footerLeft: { width: '50%', paddingRight: '25%', alignItems: 'center' },
  footerRight: { width: '50%', paddingLeft: '25%', alignItems: 'center' },
  footerLabel: { fontFamily: 'Times-Roman', fontSize: 8, textAlign: 'center', marginBottom: 52 },
  footerDateText: { fontFamily: 'Times-Roman', fontSize: 8, textAlign: 'center' },
  footerNameUnderline: {
    fontFamily: 'Times-Bold', fontSize: 8, textAlign: 'center',
    borderBottomWidth: 1, borderColor: '#000000', paddingBottom: 2,
    alignSelf: 'center',
  },
  footerNIP: { fontFamily: 'Times-Roman', fontSize: 8, textAlign: 'center', marginTop: 4 },
});

// ============ TABLE HEADER ============
const TableHeader = () => (
  <View style={s.tableRow}>
    <View style={[{ width: COL.NO }, s.cell]}>
      <Text style={s.headerText}>No</Text>
    </View>
    <View style={[{ width: COL.TANGGAL }, s.cell]}>
      <Text style={s.headerText}>Tanggal</Text>
    </View>
    <View style={[{ width: COL.KEGIATAN }, s.cell]}>
      <Text style={s.headerText}>Kegiatan Tugas Jabatan</Text>
    </View>
    <View style={[{ width: COL.KETERANGAN }, s.cell]}>
      <Text style={s.headerText}>Keterangan</Text>
    </View>
    <View style={[{ width: COL.KUANTITAS }, s.cell]}>
      <Text style={s.headerText}>Kuantitas / Output</Text>
    </View>
    {/* Waktu Pengerjaan — colspan 3 */}
    <View style={{ width: '25%', flexDirection: 'column' }}>
      <View style={{
        borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#000000',
        alignItems: 'center', justifyContent: 'center', padding: 2,
      }}>
        <Text style={s.headerText}>Waktu Pengerjaan</Text>
      </View>
      <View style={{ flexDirection: 'row' }}>
        <View style={[s.cell, { width: '32%', borderTopWidth: 0 }]}>
          <Text style={s.headerText}>Mulai</Text>
        </View>
        <View style={[s.cell, { width: '32%', borderTopWidth: 0 }]}>
          <Text style={s.headerText}>Selesai</Text>
        </View>
        <View style={[s.cell, { width: '36%', borderTopWidth: 0 }]}>
          <Text style={s.headerText}>Lama</Text>
        </View>
      </View>
    </View>
    <View style={[{ width: COL.PARAF }, s.cell]}>
      <Text style={s.headerText}>Paraf Verifikasi</Text>
    </View>
  </View>
);

// ============ CELL HELPERS ============
const Cell = ({ w, bold, left, children }) => (
  <View style={[left ? s.cellL : s.cell, { width: w }]}>
    {bold
      ? <Text style={s.boldCell}>{children}</Text>
      : <Text style={left ? s.cellTextL : s.cellText}>{children}</Text>
    }
  </View>
);

// ============ DATE FORMATTER ============
const formatDateSlashed = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

// ============ MAIN COMPONENT ============
const LaporanPDF = ({ monthData, settings }) => {
  const { pegawai = {}, atasan = {}, headerDokumen = {} } = settings || {};
  const { bulan = 1, tahun = new Date().getFullYear(), hari = [] } = monthData || {};

  const namaBulan = BULAN_INDONESIA[bulan - 1];
  const lastDay = getDaysInMonth(bulan, tahun);
  const kota = headerDokumen?.kota || '';
  const showHeader = !!(headerDokumen?.logoBase64 || headerDokumen?.namaDinas);

  const savedDays = hari.filter(d => d.disimpan && d.kegiatan?.some(k => k.namaKegiatan?.trim()));

  const grandTotalMenit = savedDays.reduce((sum, d) => sum + (d.totalMenitHari || 0), 0);
  const grandTotalJam = Math.floor(grandTotalMenit / 60);
  const grandTotalSisa = grandTotalMenit % 60;
  const grandTotalText = grandTotalSisa === 0
    ? `${grandTotalJam} Jam`
    : `${grandTotalJam} Jam ${grandTotalSisa} Menit`;

  const footerDate = `${lastDay} ${namaBulan} ${tahun}`;

  return (
    <Document>
      <Page size="A4" style={s.page} wrap>
        {/* ============ SECTION 1: HEADER DOKUMEN (OPTIONAL) ============ */}
        {showHeader && (
          <View style={s.logoSection}>
            {headerDokumen?.logoBase64 && (
              <Image src={headerDokumen.logoBase64} style={s.logoImg} />
            )}
            {headerDokumen?.namaDinas && (
              <Text style={s.namaInstansi}>{headerDokumen.namaDinas.toUpperCase()}</Text>
            )}
          </View>
        )}

        {/* ============ SECTION 2: HEADER PEGAWAI & ATASAN ============ */}
        <View style={s.headerSection}>
          <View style={s.headerCol}>
            <Text style={s.hTitle}>PEGAWAI</Text>
            <View style={s.hRow}>
              <Text style={s.hLabel}>Nama</Text>
              <Text style={s.hColon}>:</Text>
              <Text style={s.hValue}>{pegawai?.nama || ''}</Text>
            </View>
            <View style={s.hRow}>
              <Text style={s.hLabel}>NIP</Text>
              <Text style={s.hColon}>:</Text>
              <Text style={s.hValue}>{pegawai?.nip || ''}</Text>
            </View>
            <View style={s.hRow}>
              <Text style={s.hLabel}>Jabatan</Text>
              <Text style={s.hColon}>:</Text>
              <Text style={s.hValue}>{pegawai?.jabatan || ''}</Text>
            </View>
          </View>
          <View style={s.headerColR}>
            <Text style={s.hTitle}>ATASAN</Text>
            <View style={s.hRow}>
              <Text style={s.hLabel}>Nama</Text>
              <Text style={s.hColon}>:</Text>
              <Text style={s.hValue}>{atasan?.nama || ''}</Text>
            </View>
            <View style={s.hRow}>
              <Text style={s.hLabel}>NIP</Text>
              <Text style={s.hColon}>:</Text>
              <Text style={s.hValue}>{atasan?.nip || ''}</Text>
            </View>
            <View style={s.hRow}>
              <Text style={s.hLabel}>Jabatan</Text>
              <Text style={s.hColon}>:</Text>
              <Text style={s.hValue}>{atasan?.jabatan || ''}</Text>
            </View>
          </View>
        </View>

        {/* ============ SECTION 3 & 4: TABEL UTAMA ============ */}
        <View style={s.table}>
          <TableHeader />

          {savedDays.length === 0 && (
            <View style={s.tableRow}>
              <Cell w="100%" bold>Belum ada kegiatan yang disimpan</Cell>
            </View>
          )}

          {savedDays.map((day, dayIdx) => {
            const filled = day.kegiatan.filter(k => k.namaKegiatan?.trim());
            const totalMenitHari = day.totalMenitHari || 0;
            const totalJamHari = Math.floor(totalMenitHari / 60);
            const totalMenitSisa = totalMenitHari % 60;
            const totalText = totalMenitSisa === 0
              ? `Subtotal: ${totalJamHari} Jam`
              : `Subtotal: ${totalJamHari} Jam ${totalMenitSisa} Menit`;

            const tanggalFormatted = formatDateSlashed(day.tanggal);

            return (
              <React.Fragment key={day.tanggal}>
                {filled.map((k, kIdx) => {
                  const durMin = calcDurationMinutes(k.jamMulai, k.jamSelesai);
                  const durStr = durMin !== null ? minutesToHHMMSS(durMin) : '—';
                  const mulaiStr = k.jamMulai ? k.jamMulai + ':00' : '—';
                  const selesaiStr = k.jamSelesai ? k.jamSelesai + ':00' : '—';

                  const isFirst = kIdx === 0;
                  const isLast = kIdx === filled.length - 1;

                  // Merge logic for No, Tanggal, Jabatan columns:
                  // First row: show content, no bottom border
                  // Middle rows: empty, no top border, no bottom border (if not last)
                  // Last row: empty, no top border, with bottom border (or regular if only 1 row)

                  const mergeStyleNo = isFirst ? s.cellMergeTop : (isLast ? s.cellMergeCont : s.cellMergeCont);
                  const mergeStyleTgl = isFirst ? s.cellMergeTop : (isLast ? s.cellMergeCont : s.cellMergeCont);
                  const mergeStyleJab = isFirst ? s.cellMergeTop : (isLast ? s.cellMergeCont : s.cellMergeCont);

                  // For middle rows (not first, not last), also remove bottom border
                  const noBottom = !isFirst && !isLast;
                  const finalStyleNo = noBottom
                    ? { ...mergeStyleNo, borderBottomWidth: 0 }
                    : mergeStyleNo;
                  const finalStyleTgl = noBottom
                    ? { ...mergeStyleTgl, borderBottomWidth: 0 }
                    : mergeStyleTgl;
                  const finalStyleJab = noBottom
                    ? { ...mergeStyleJab, borderBottomWidth: 0 }
                    : mergeStyleJab;

                  return (
                    <View key={k.id} style={s.tableRow} wrap={false}>
                      {/* No — merge vertikal */}
                      <View style={[finalStyleNo, { width: COL.NO }]}>
                        <Text style={s.cellText}>{isFirst ? String(dayIdx + 1) : ''}</Text>
                      </View>
                      {/* Tanggal — merge vertikal */}
                      <View style={[finalStyleTgl, { width: COL.TANGGAL }]}>
                        <Text style={s.cellText}>{isFirst ? tanggalFormatted : ''}</Text>
                      </View>
                      {/* Kegiatan Tugas Jabatan — merge vertikal, hanya sekali */}
                      <View style={[finalStyleJab, { width: COL.KEGIATAN }]}>
                        <Text style={s.cellText}>{isFirst ? (pegawai?.jabatan || '') : ''}</Text>
                      </View>
                      {/* Keterangan — nama kegiatan, tiap baris */}
                      <Cell w={COL.KETERANGAN}>{k.namaKegiatan}</Cell>
                      <Cell w={COL.KUANTITAS}>1 Keg</Cell>
                      <Cell w={COL.MULAI}>{mulaiStr}</Cell>
                      <Cell w={COL.SELESAI}>{selesaiStr}</Cell>
                      <Cell w={COL.LAMA}>{durStr}</Cell>
                      <Cell w={COL.PARAF}>{''}</Cell>
                    </View>
                  );
                })}

                {/* Total harian — colspan 7 kolom (Kegiatan s/d Lama) */}
                <View style={s.tableRow} wrap={false}>
                  <View style={[s.cell, { width: COL.NO }]}>
                    <Text style={s.cellText}></Text>
                  </View>
                  <View style={[s.cell, { width: COL.TANGGAL }]}>
                    <Text style={s.cellText}></Text>
                  </View>
                  {/* Total colspan: KEGIATAN + KETERANGAN + KUANTITAS + MULAI + SELESAI + LAMA = 70% */}
                  <View style={[s.cell, {
                    width: '70%',
                    justifyContent: 'center', alignItems: 'center',
                  }]}>
                    <Text style={s.boldCell}>{totalText}</Text>
                  </View>
                  <View style={[s.cell, { width: COL.PARAF }]}>
                    <Text style={s.cellText}></Text>
                  </View>
                </View>
              </React.Fragment>
            );
          })}

          {/* Total Bulanan — colspan semua 9 kolom */}
          <View style={s.tableRow}>
            <View style={[s.grandTotalCell, { width: '100%' }]}>
              <Text style={s.grandTotalText}>
                {`Total Jam Kerja Efektif Bulan ${namaBulan} ${tahun} : ${grandTotalText}`}
              </Text>
            </View>
          </View>
        </View>

        {/* ============ SECTION 5: FOOTER TANDA TANGAN ============ */}
        <View style={s.footerRow} wrap={false}>
          {/* Kolom Kiri: Pejabat Penilai — posisi ~25% */}
          <View style={s.footerLeft}>
            {/* Placeholder teks transparan agar tinggi sejajar dengan tanggal di kanan */}
            <Text style={[s.footerDateText, { color: '#FFFFFF' }]}>.</Text>
            <Text style={s.footerLabel}>Pejabat Penilai,</Text>
            <Text style={s.footerNameUnderline}>{atasan?.nama || ''}</Text>
            <Text style={s.footerNIP}>NIP. {atasan?.nip || ''}</Text>
          </View>

          {/* Kolom Kanan: Tanggal + Pegawai — posisi ~75% */}
          <View style={s.footerRight}>
            <Text style={s.footerDateText}>
              {kota ? `${kota}, ${footerDate}` : footerDate}
            </Text>
            <Text style={s.footerLabel}>Pegawai Yang Membuat,</Text>
            <Text style={s.footerNameUnderline}>{pegawai?.nama || ''}</Text>
            <Text style={s.footerNIP}>NIP. {pegawai?.nip || ''}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default LaporanPDF;