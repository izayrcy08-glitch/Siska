import React from 'react';
import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import {
  BULAN_INDONESIA, calcDurationMinutes, minutesToHHMMSS,
  getDaysInMonth
} from '../../utils/timeUtils';

const MARGIN = 28.35; // 10mm in pt

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
  // Optional logo/dinas header
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
  // Pegawai / Atasan header
  headerSection: { flexDirection: 'row', marginBottom: 8 },
  headerCol: { width: '50%', paddingRight: 10 },
  headerColR: { width: '50%', paddingLeft: 4 },
  hTitle: { fontFamily: 'Times-Bold', fontSize: 9, marginBottom: 3 },
  hRow: { flexDirection: 'row', marginBottom: 2 },
  hLabel: { fontFamily: 'Times-Roman', fontSize: 8, width: 44 },
  hColon: { fontFamily: 'Times-Roman', fontSize: 8, width: 8 },
  hValue: { fontFamily: 'Times-Roman', fontSize: 8, flex: 1 },
  // Table
  table: {
    borderTopWidth: 1, borderLeftWidth: 1, borderColor: '#000000',
  },
  tableRow: { flexDirection: 'row' },
  // Generic cell (center text)
  cell: {
    borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#000000',
    padding: 2, justifyContent: 'center', alignItems: 'center',
  },
  cellL: {
    borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#000000',
    padding: 2, justifyContent: 'center', alignItems: 'flex-start',
  },
  cellText: { fontFamily: 'Times-Roman', fontSize: 7, textAlign: 'center' },
  cellTextL: { fontFamily: 'Times-Roman', fontSize: 7, textAlign: 'left' },
  boldCell: { fontFamily: 'Times-Bold', fontSize: 7, textAlign: 'center' },
  headerText: { fontFamily: 'Times-Bold', fontSize: 7, textAlign: 'center' },
  // Footer
  footerRow: { flexDirection: 'row', marginTop: 14 },
  footerCol: { width: '33.33%' },
  footerColC: { width: '33.33%', alignItems: 'center' },
  footerColR: { width: '33.33%', alignItems: 'flex-end' },
  footerLabel: { fontFamily: 'Times-Roman', fontSize: 8, marginBottom: 48 },
  footerLabelR: { fontFamily: 'Times-Roman', fontSize: 8, marginBottom: 48, textAlign: 'right' },
  footerName: { fontFamily: 'Times-Bold', fontSize: 8 },
  footerNIP: { fontFamily: 'Times-Roman', fontSize: 8 },
  footerDateText: { fontFamily: 'Times-Roman', fontSize: 8, textAlign: 'center' },
});

// Simple cell helper
const C = ({ w, bold, left, noRight, noBottom, children, minH }) => (
  <View style={[
    left ? s.cellL : s.cell,
    { width: w },
    noRight ? { borderRightWidth: 0 } : {},
    noBottom ? { borderBottomWidth: 0 } : {},
    minH ? { minHeight: minH } : {},
  ]}>
    {bold
      ? <Text style={s.boldCell}>{children}</Text>
      : <Text style={left ? s.cellTextL : s.cellText}>{children}</Text>
    }
  </View>
);

// Kegiatan cell with 2 text lines
const KegiatanCell = ({ jabatan, nomor, namaKegiatan }) => (
  <View style={[s.cellL, { width: '28%' }]}>
    <Text style={s.cellTextL}>{`${jabatan} ${nomor}`}</Text>
    <Text style={s.cellTextL}>{namaKegiatan}</Text>
  </View>
);

// 2-row table header
const TableHeader = () => (
  <View style={s.tableRow}>
    {/* Simple cells that span 2 rows (via minHeight) */}
    <C w="4%" bold minH={32}>No</C>
    <C w="10%" bold minH={32}>Tanggal</C>
    <C w="28%" bold minH={32}>Kegiatan Tugas Jabatan</C>
    <C w="8%" bold minH={32}>Keterangan</C>
    <C w="9%" bold minH={32}>Kuantitas / Output</C>

    {/* Waktu Pengerjaan group (25%) */}
    <View style={{
      width: '25%',
      flexDirection: 'column',
      borderRightWidth: 0,
      borderBottomWidth: 0,
    }}>
      {/* Title row */}
      <View style={{
        borderBottomWidth: 1, borderColor: '#000000',
        alignItems: 'center', justifyContent: 'center',
        padding: 2, minHeight: 16,
      }}>
        <Text style={s.headerText}>Waktu Pengerjaan</Text>
      </View>
      {/* Sub-columns */}
      <View style={{ flexDirection: 'row', flex: 1 }}>
        <View style={{
          width: '32%', borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#000000',
          alignItems: 'center', justifyContent: 'center', padding: 2, minHeight: 16,
        }}>
          <Text style={s.headerText}>Mulai</Text>
        </View>
        <View style={{
          width: '32%', borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#000000',
          alignItems: 'center', justifyContent: 'center', padding: 2, minHeight: 16,
        }}>
          <Text style={s.headerText}>Selesai</Text>
        </View>
        <View style={{
          width: '36%', borderRightWidth: 1, borderBottomWidth: 1, borderColor: '#000000',
          alignItems: 'center', justifyContent: 'center', padding: 2, minHeight: 16,
        }}>
          <Text style={s.headerText}>Lama</Text>
        </View>
      </View>
    </View>

    <C w="16%" bold minH={32}>Paraf Verifikasi</C>
  </View>
);

const LaporanPDF = ({ monthData, settings }) => {
  const { pegawai = {}, atasan = {}, headerDokumen = {} } = settings || {};
  const { bulan = 1, tahun = new Date().getFullYear(), hari = [] } = monthData || {};

  const namaBulan = BULAN_INDONESIA[bulan - 1];
  const lastDay = getDaysInMonth(bulan, tahun);
  const kota = headerDokumen?.kota || '';
  const showHeader = !!(headerDokumen?.logoBase64 || headerDokumen?.namaDinas);

  // Only saved days
  const savedDays = hari.filter(d => d.disimpan && d.kegiatan?.some(k => k.namaKegiatan?.trim()));

  // Calculate grand total
  const grandTotalMenit = savedDays.reduce((sum, d) => sum + (d.totalMenitHari || 0), 0);
  const grandTotalJam = Math.floor(grandTotalMenit / 60);

  const footerDate = `${lastDay} ${namaBulan} ${tahun}`;

  return (
    <Document>
      <Page size="A4" style={s.page} wrap>
        {/* Section 1: Header Dokumen (optional) */}
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

        {/* Section 2: Header Pegawai & Atasan */}
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

        {/* Section 3 & 4: Main Table */}
        <View style={s.table}>
          <TableHeader />

          {savedDays.length === 0 && (
            <View style={s.tableRow}>
              <C w="100%" bold>Belum ada kegiatan yang disimpan</C>
            </View>
          )}

          {savedDays.map((day, dayIdx) => {
            const filled = day.kegiatan.filter(k => k.namaKegiatan?.trim());
            const totalMenitHari = day.totalMenitHari || 0;
            const totalJamHari = Math.floor(totalMenitHari / 60);
            const totalMenitSisa = totalMenitHari % 60;
            const totalText = totalMenitSisa === 0
              ? `Total Jam Kerja Efektif ${totalJamHari} Jam`
              : `Total Jam Kerja Efektif ${totalJamHari} Jam ${totalMenitSisa} Menit`;

            return (
              <React.Fragment key={day.tanggal}>
                {filled.map((k, kIdx) => {
                  const durMin = calcDurationMinutes(k.jamMulai, k.jamSelesai);
                  const durStr = durMin !== null ? minutesToHHMMSS(durMin) : '—';
                  const mulaiStr = k.jamMulai ? k.jamMulai + ':00' : '—';
                  const selesaiStr = k.jamSelesai ? k.jamSelesai + ':00' : '—';
                  const jabatanPendek = (pegawai?.jabatan || '').split(' ').slice(0, 3).join(' ');

                  return (
                    <View key={k.id} style={s.tableRow} wrap={false}>
                      <C w="4%">{kIdx === 0 ? String(dayIdx + 1) : ''}</C>
                      <C w="10%">{kIdx === 0 ? day.tanggal : ''}</C>
                      <KegiatanCell
                        jabatan={jabatanPendek}
                        nomor={kIdx + 1}
                        namaKegiatan={k.namaKegiatan}
                      />
                      <C w="8%">Selesai</C>
                      <C w="9%">1 Keg</C>
                      <C w="8%">{mulaiStr}</C>
                      <C w="8%">{selesaiStr}</C>
                      <C w="9%">{durStr}</C>
                      <C w="16%">{''}</C>
                    </View>
                  );
                })}

                {/* Total daily row */}
                <View style={s.tableRow} wrap={false}>
                  <C w="4%">{''}</C>
                  <C w="10%">{''}</C>
                  <C w="70%" bold>{totalText}</C>
                  <C w="16%">{''}</C>
                </View>
              </React.Fragment>
            );
          })}

          {/* Monthly Total Row */}
          <View style={s.tableRow}>
            <C w="100%" bold>
              {`Total Jam Kerja Efektif Bulan ${namaBulan} ${tahun} ${grandTotalJam} Jam`}
            </C>
          </View>
        </View>

        {/* Section 5: Footer Tanda Tangan */}
        <View style={s.footerRow} wrap={false}>
          <View style={s.footerCol}>
            <Text style={s.footerLabel}>Pejabat Penilai,</Text>
            <Text style={s.footerName}>{atasan?.nama || ''}</Text>
            <Text style={s.footerNIP}>NIP {atasan?.nip || ''}</Text>
          </View>
          <View style={s.footerColC}>
            <Text style={s.footerDateText}>
              {kota ? `${kota}, ${footerDate}` : footerDate}
            </Text>
          </View>
          <View style={s.footerColR}>
            <Text style={s.footerLabelR}>Pegawai Yang Membuat,</Text>
            <Text style={[s.footerName, { textAlign: 'right' }]}>{pegawai?.nama || ''}</Text>
            <Text style={[s.footerNIP, { textAlign: 'right' }]}>NIP. {pegawai?.nip || ''}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default LaporanPDF;
