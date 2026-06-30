# PRD — Aplikasi Pencatat Kegiatan Harian Pegawai

## Product Summary
Mobile-first web app for recording daily activities of field employees (e.g., heavy equipment operators). Replaces manual Excel recording. Auto-calculates work hours and generates official-format monthly PDF reports.

## Architecture
- **Pure frontend** React app (no backend needed)
- Data stored in `localStorage` browser
- Key: `settings` for employee/supervisor config
- Key: `activities_MM_YYYY` for monthly activity data

## Core Requirements (Static)
1. Mobile-first design with accordion day cards
2. Month picker with data wipe on month change
3. Activity input: name + start/end times (24h format)
4. Auto-calculated duration per activity
5. Save per day (with validation, confirmation dialog)
6. Business rules: Apel Pagi always first, min start time, no overlap
7. PDF generation (black/white, formal government format)
8. Settings: employee, supervisor, optional header (logo/dinas)
9. No login system

## Implementation Date: 2026-02-xx

## What's Been Implemented (Updated Feb 2026)
- [x] App structure (React + Tailwind + @react-pdf/renderer)
- [x] Bottom navigation (Kegiatan / Pengaturan tabs)
- [x] BulanPicker with month navigation + confirmation dialog for month switch
- [x] DayCard accordion (expand/collapse, weekend badge, saved status)
- [x] KegiatanItem (activity input: name + time picker + real-time duration)
- [x] Validation: format, jam selesai > mulai, min start time (06:00/08:00), no overlap
- [x] Apel Pagi shortcut button (read-only, always position 1, max 1 per day)
- [x] Save per day with confirmation dialog + "Belum disimpan" indicator on edit after save
- [x] Total jam bulanan card (shows hours + minutes)
- [x] Settings page auto-save on blur: Pegawai, Atasan, Header Dokumen
- [x] Logo upload (base64 in localStorage) in Settings
- [x] Reset kegiatan with 2-step confirmation (settings NOT affected)
- [x] PDF generation (@react-pdf/renderer):
  - Optional header (logo + nama dinas)
  - Pegawai & Atasan header (2-col, no borders, aligned colons)
  - Table: 2-row merged header (Waktu Pengerjaan colspan 3)
  - Data rows: No/Tanggal only on first activity per day
  - Daily total rows (70% colspan): "Total Jam Kerja Efektif X Jam Y Menit"
  - Monthly total row (100% colspan, bold)
  - Footer signature (3-col: Pejabat Penilai | date | Pegawai Yang Membuat)
  - Filename: Laporan_Kegiatan_NAMA_BulanTahun.pdf
- [x] PDF Preview modal (PDFViewer + blob URL download button)
- [x] Only saved days (disimpan=true) appear in PDF

## Prioritized Backlog
- P1: Header table repetition on PDF page 2+ (multi-page months)
- P1: Weekend indicator more prominent
- P2: Jabatan abbreviation in PDF Kegiatan Tugas Jabatan column
- P3: Export to older browser support

## Next Tasks
1. Test PDF generation with real data
2. Verify all business rules (Apel Pagi ordering, overlap detection)
3. Test month switching confirmation
4. Performance check with 30+ day cards
