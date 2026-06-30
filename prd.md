PRD — Aplikasi Pencatat Kegiatan Harian Pegawai

**PRODUCT REQUIREMENTS DOCUMENT**

Aplikasi Pencatat Kegiatan Harian Pegawai

*Versi 1.0 — Dipersiapkan untuk implementasi di Emergent*

# 1. Ringkasan Produk

Aplikasi web mobile-first untuk mencatat kegiatan harian pegawai lapangan (contoh: operator alat berat), menggantikan proses pencatatan manual di Excel. Aplikasi menghitung jam kerja secara otomatis dan menghasilkan dokumen PDF laporan bulanan dengan tata letak identik dengan format resmi yang sudah berjalan.

## 1.1 Tujuan Utama

- Mempermudah input kegiatan harian dari HP, termasuk di lapangan.

- Menghitung durasi kegiatan dan total jam kerja secara otomatis, tanpa hitung manual.

- Menghasilkan PDF laporan bulanan dengan tata letak, kolom, dan urutan identik dengan dokumen contoh yang dilampirkan.

- Dapat digunakan oleh beberapa pegawai berbeda tanpa sistem login/password.

## 1.2 Target Pengguna

Pegawai lapangan (operator alat berat, teknisi, dan sejenisnya) di lingkungan unit kerja pemerintahan (contoh: UPT/Dinas) yang wajib membuat laporan kegiatan harian dan direkap setiap bulan untuk ditandatangani atasan.

## 1.3 Prinsip Desain

- Mobile-first: target utama penggunaan adalah HP, bukan desktop. Desain harus elegan dan modern untuk pengalaman input di layar kecil.

- Tanpa login: data disimpan secara lokal di browser masing-masing pengguna (localStorage). Setiap pengguna otomatis memiliki ruang data sendiri di perangkatnya.

- Output PDF hitam-putih: tidak ada warna pada dokumen PDF yang di-generate, karena akan dicetak dan ditandatangani basah.

- Tidak ada riwayat/arsip bulan lalu: aplikasi hanya menyimpan data bulan yang sedang berjalan. Jika pengguna memulai input bulan baru, data kegiatan bulan sebelumnya otomatis terhapus (data pengaturan/profil tidak terhapus).

## 1.4 Di Luar Cakupan (Out of Scope)

- Sistem login dan autentikasi pengguna.

- Sinkronisasi data antar perangkat / antar browser.

- Tanda tangan digital atau approval elektronik — kolom paraf dibiarkan kosong untuk tanda tangan basah.

- Riwayat/arsip laporan bulan-bulan sebelumnya.

- Dukungan multi-bahasa.

# 2. Arsitektur & Penyimpanan Data

Aplikasi bersifat client-side sepenuhnya (tidak ada backend/server/database). Semua data disimpan di localStorage browser pengguna dalam format JSON.

## 2.1 Struktur Data localStorage

Gunakan dua kategori penyimpanan terpisah dengan key berbeda:

- settings — data pengaturan (profil pegawai, atasan, header dokumen). Bersifat permanen, tidak ikut terhapus saat reset/ganti bulan.

- activities_[bulan]_[tahun] — data kegiatan untuk bulan yang sedang berjalan. Contoh key: activities_06_2026.

### Contoh skema objek settings:

{
  "pegawai": {
    "nama": "ZAINUDIN",
    "nip": "199703162025061003",
    "jabatan": "Operator Alat Berat Pada UPT Balai Pengelolaan Alat dan Perbekalan"
  },
  "atasan": {
    "nama": "HARTADI, S.T.",
    "nip": "19811104 201001 1 018",
    "jabatan": "Kepala UPT Balai Pengelolaan Alat dan Perbekalan"
  },
  "headerDokumen": {
    "logoBase64": null,
    "namaDinas": "",
    "kota": "Muara Teweh"
  }
}

### Contoh skema objek activities (per bulan):

{
  "bulan": 6,
  "tahun": 2026,
  "hari": [
    {
      "tanggal": "2026-06-01",
      "kegiatan": [
        {
          "id": "uuid-1",
          "namaKegiatan": "Apel Pagi",
          "jamMulai": "07:30",
          "jamSelesai": "08:00",
          "tersimpan": false
        },
        {
          "id": "uuid-2",
          "namaKegiatan": "Muatan material jembatan bailey...",
          "jamMulai": "08:00",
          "jamSelesai": "17:00",
          "tersimpan": false
        }
      ],
      "disimpan": true
    }
  ]
}

*Field **"**disimpan**"** pada level hari menandai bahwa tombol Simpan hari itu sudah ditekan dan dikonfirmasi (lihat bagian 4.4). Field ini hanya checkpoint visual — data tetap bisa diedit kembali kapan saja.*

# 3. Navigasi & Struktur Halaman

Aplikasi memiliki dua halaman utama yang dapat diakses melalui bottom navigation bar (selalu terlihat di bagian bawah layar pada semua ukuran layar):

- Tab "Kegiatan" (ikon kalender) — halaman utama input kegiatan harian. Ini adalah halaman default saat aplikasi dibuka.

- Tab "Pengaturan" (ikon gear/roda gigi) — halaman konfigurasi data pegawai, atasan, dan header dokumen.

## 3.1 Arahan Desain Visual

Desain harus terasa elegan dan modern, bukan tampilan formulir pemerintahan yang kaku. Gunakan prinsip berikut:

- Palet warna netral dan tenang untuk antarmuka aplikasi (boleh menggunakan warna, berbeda dengan output PDF yang wajib hitam-putih). Disarankan kombinasi warna dasar putih/abu sangat terang sebagai latar, satu warna aksen (misal biru tua, hijau tua, atau navy) untuk tombol utama dan elemen interaktif.

- Card-based layout dengan sudut membulat (rounded corners), bayangan halus (subtle shadow), dan spacing yang lega antar elemen — bukan border tebal/garis kaku.

- Tipografi modern, sans-serif, dengan hierarki ukuran font yang jelas antara judul, label, dan nilai input.

- Transisi/animasi halus saat membuka card, menambah kegiatan, atau pindah tab — namun tetap ringan, tidak mengganggu performa di HP.

- Tombol utama (primary action) harus besar, mudah dijangkau ibu jari, dan kontras jelas terhadap latar.

- Khusus output PDF: harus tetap hitam putih total, rapi, dan menyerupai dokumen formal resmi — tidak mengikuti gaya warna aplikasi.

# 4. Halaman Kegiatan

## 4.1 Pemilih Bulan

Di bagian paling atas halaman, tampilkan nama bulan dan tahun yang sedang aktif, contoh: "Juni 2026". Sediakan dua tombol navigasi di kiri-kanan teks bulan untuk berpindah ke bulan sebelumnya/berikutnya.

Aturan saat berpindah bulan:

- Jika berpindah ke bulan yang berbeda dari bulan yang sedang aktif dan ada data kegiatan yang sudah diisi, tampilkan dialog konfirmasi dengan teks: "Pindah ke bulan baru akan menghapus semua kegiatan bulan ini. Lanjutkan?"

- Jika pengguna menekan Ya/Lanjutkan: hapus seluruh data kegiatan bulan yang sedang aktif (key activities_[bulan]_[tahun] dihapus dari localStorage), lalu pindah ke bulan baru dengan data kegiatan kosong.

- Jika pengguna menekan Batal: tetap di bulan semula, tidak ada perubahan data.

- Data di objek settings (profil pegawai, atasan, header dokumen) TIDAK PERNAH ikut terhapus oleh aksi ini.

## 4.2 Daftar Hari dalam Bulan

Tampilkan seluruh hari dalam bulan yang aktif secara berurutan dari tanggal 1 sampai tanggal terakhir bulan tersebut, sebagai daftar vertikal (scroll ke bawah). Setiap hari ditampilkan sebagai satu "card" terpisah dengan header tanggal.

- Hari yang termasuk Sabtu atau Minggu diberi label kecil "Libur" di sebelah tanggal sebagai penanda visual, namun pengguna tetap bisa mengisi kegiatan pada hari tersebut seperti hari biasa (tidak ada pembatasan input khusus untuk akhir pekan).

- Hari yang belum memiliki kegiatan apapun tetap menampilkan card kosong dengan tombol "+ Tambah Kegiatan" dan tombol "+ Apel Pagi".

## 4.3 Card Kegiatan per Hari — Detail Komponen

Di dalam card setiap hari, terdapat header tanggal lalu daftar kegiatan pada hari itu. Setiap kegiatan memiliki field berikut:

- Input teks bebas untuk nama kegiatan (placeholder: "Tulis kegiatan...").

- Input jam mulai — lihat ketentuan format pada bagian 4.5.

- Input jam selesai — lihat ketentuan format pada bagian 4.5.

- Tampilan durasi otomatis (read-only), dihitung dari selisih jam selesai dan jam mulai, format HH:MM:SS. Jika salah satu jam belum diisi, tampilkan strip ("—") sebagai placeholder durasi, jangan tampilkan error.

- Tombol hapus (ikon tempat sampah) untuk menghapus kegiatan tersebut dari hari itu.

Di bagian bawah daftar kegiatan dalam satu hari, terdapat:

- Tombol "+ Tambah Kegiatan" — menambahkan baris kegiatan kosong baru di posisi paling bawah daftar kegiatan hari itu.

- Tombol "+ Apel Pagi" — shortcut untuk menambahkan kegiatan dengan nama "Apel Pagi", jam mulai 07:30, jam selesai 08:00. Lihat aturan posisi pada bagian 4.6.

- Teks total jam hari itu, contoh: "Total hari ini: 9 Jam 30 Menit". Nilai ini HANYA ter-update setelah tombol Simpan hari itu ditekan dan dikonfirmasi (lihat bagian 4.4) — bukan real-time setiap kali mengetik.

- Tombol "Simpan" — lihat detail lengkap pada bagian 4.4.

## 4.4 Tombol Simpan per Hari

- Tombol "Simpan" pada sebuah hari HANYA muncul jika hari tersebut memiliki minimal satu kegiatan yang sudah diisi (nama kegiatan tidak kosong).

- Saat tombol Simpan ditekan, sistem terlebih dahulu menjalankan seluruh validasi yang dijelaskan pada bagian 4.6 (urutan Apel Pagi, batas jam mulai, dan tumpang tindih jam). Jika ada validasi yang gagal, tampilkan pesan error inline pada kegiatan yang bermasalah dan BATALKAN proses simpan — total jam tidak diperbarui.

- Jika seluruh validasi lolos, tampilkan dialog konfirmasi singkat (contoh: "Simpan kegiatan hari ini?") dengan pilihan Ya/Batal.

- Setelah pengguna menekan Ya pada dialog konfirmasi: (a) tandai field disimpan pada hari tersebut menjadi true, (b) hitung ulang dan tampilkan total jam harian hari itu, (c) hitung ulang dan tampilkan total jam bulanan di bagian bawah halaman (lihat bagian 4.7).

- Setelah disimpan, kegiatan pada hari itu TETAP BISA DIEDIT BEBAS kapan saja (bukan terkunci/read-only). Tombol Simpan tetap tersedia untuk ditekan ulang jika ada perubahan kegiatan setelahnya, agar total jam ter-update kembali.

- Jika pengguna mengedit kegiatan setelah hari itu tersimpan, tampilkan indikator kecil (misal label "Belum disimpan" atau perubahan warna tombol Simpan) untuk menandakan bahwa ada perubahan yang belum di-konfirmasi ulang.

## 4.5 Format & Cara Input Jam

- Seluruh input dan tampilan jam menggunakan format 24 jam, dari 00:00 sampai 23:59. Tidak ada format AM/PM di manapun dalam aplikasi maupun PDF.

- Setiap field jam (mulai dan selesai) mendukung DUA cara input sekaligus: (a) tap pada field memunculkan time picker native bawaan HP yang dikonfigurasi 24 jam, dan (b) pengguna juga bisa mengetik manual langsung menggunakan keyboard, contoh: ketik "0730" atau "07:30".

- Validasi format: jika input manual tidak membentuk jam yang valid (misal "25:99" atau teks bebas), tampilkan error inline berwarna merah di bawah field tersebut, contoh teks: "Format jam tidak valid".

- Validasi logika: jam selesai harus lebih besar dari jam mulai pada kegiatan yang sama. Jika jam selesai sama atau lebih kecil dari jam mulai, tampilkan error inline, contoh teks: "Jam selesai harus setelah jam mulai".

## 4.6 Aturan Urutan & Validasi Jam Antar Kegiatan

Ini adalah bagian PALING PENTING dan harus diimplementasikan dengan presisi. Berlaku per hari (per card), tidak lintas hari.

### 4.6.1 Aturan Posisi Apel Pagi

- Kegiatan dengan nama "Apel Pagi" SELALU diposisikan di urutan PALING ATAS (posisi pertama) dalam daftar kegiatan hari itu, berapapun urutan saat pengguna menekan tombol "+ Apel Pagi".

- Contoh: jika pengguna sudah mengisi Kegiatan 1 dan Kegiatan 2 terlebih dahulu, lalu menekan tombol "+ Apel Pagi" setelahnya, maka sistem HARUS otomatis memindahkan Apel Pagi menjadi urutan pertama, dan Kegiatan 1 menjadi urutan kedua, Kegiatan 2 menjadi urutan ketiga. Pengurutan ulang ini terjadi otomatis secara real-time saat Apel Pagi ditambahkan, tanpa perlu menekan tombol Simpan terlebih dahulu.

- Jam Apel Pagi selalu tetap 07:30 sampai 08:00 dan tidak bisa diubah oleh pengguna (read-only) — ini adalah jam standar baku.

- Hanya boleh ada maksimal SATU kegiatan "Apel Pagi" per hari. Jika tombol "+ Apel Pagi" ditekan padahal Apel Pagi sudah ada di hari itu, tombol tersebut harus disembunyikan atau dinonaktifkan.

### 4.6.2 Aturan Batas Jam Mulai Kegiatan Pertama (Bukan Apel Pagi)

- JIKA hari itu memiliki Apel Pagi: kegiatan pertama setelah Apel Pagi (urutan kedua dan seterusnya) wajib memiliki jam mulai MINIMAL 08:00 (boleh 08:00 atau lebih besar, tidak boleh lebih kecil dari 08:00).

- JIKA hari itu TIDAK memiliki Apel Pagi: kegiatan pertama hari itu wajib memiliki jam mulai MINIMAL 06:00 (boleh 06:00 atau lebih besar, tidak boleh lebih kecil dari 06:00).

- Jika aturan ini dilanggar, tampilkan error inline pada field jam mulai kegiatan yang bermasalah, contoh teks: "Jam mulai minimal 08:00 (setelah Apel Pagi)" atau "Jam mulai minimal 06:00".

### 4.6.3 Aturan Larangan Tumpang Tindih (Overlap) Jam

- Dalam satu hari yang sama, rentang waktu (jam mulai sampai jam selesai) antar kegiatan TIDAK BOLEH tumpang tindih sama sekali.

- Aturan presisinya: kegiatan berikutnya harus memiliki jam mulai SAMA DENGAN ATAU LEBIH BESAR dari jam selesai kegiatan sebelumnya. Jam mulai kegiatan berikutnya TIDAK BOLEH lebih kecil dari jam selesai kegiatan sebelumnya.

- Contoh valid: Kegiatan A jam 08:00–10:00, Kegiatan B jam 10:00–12:00 (boleh, karena 10:00 = 10:00).

- Contoh valid: Kegiatan A jam 08:00–10:00, Kegiatan B jam 11:00–12:00 (boleh, ada jeda, karena 11:00 > 10:00).

- Contoh TIDAK valid: Kegiatan A jam 08:00–10:00, Kegiatan B jam 09:30–12:00 (DITOLAK, karena 09:30 < 10:00, tumpang tindih).

- Jika terdeteksi tumpang tindih, tampilkan error inline pada kegiatan yang melanggar, contoh teks: "Jam tumpang tindih dengan kegiatan sebelumnya, mulai paling cepat 10:00". Kegiatan dengan error TIDAK BOLEH disimpan sampai diperbaiki oleh pengguna (lihat bagian 4.4 soal validasi sebelum simpan).

- Validasi tumpang tindih dilakukan berdasarkan urutan kegiatan dalam daftar (setelah Apel Pagi otomatis berada di posisi pertama), bukan berdasarkan urutan pengisian oleh pengguna.

## 4.7 Total Jam Bulanan

Di bagian paling bawah daftar hari (sebelum tombol "Preview & Download PDF"), tampilkan total jam kerja efektif seluruh bulan, dihitung dari akumulasi total jam SELURUH hari yang sudah pernah ditekan tombol Simpannya (field disimpan = true). Contoh tampilan: "Total Jam Kerja Efektif Bulan Juni 2026: 155 Jam". Nilai ini otomatis ter-update setiap kali ada hari yang disimpan ulang.

## 4.8 Tombol Preview & Download PDF

- Tombol besar di bagian paling bawah halaman dengan teks "Preview & Download PDF".

- Tombol ini DINONAKTIFKAN (disabled, dengan tampilan visual pudar) jika data Nama Pegawai pada halaman Pengaturan belum diisi. Tambahkan teks kecil di bawah tombol yang menjelaskan kondisi ini, contoh: "Lengkapi data pegawai di Pengaturan terlebih dahulu".

- Saat ditekan (dan aktif), tampilkan preview dokumen PDF dalam modal/halaman penuh sebelum benar-benar di-download — lihat bagian 6.

# 5. Halaman Pengaturan

Halaman ini berisi tiga bagian (section) yang berurutan dari atas ke bawah. Semua field menggunakan auto-save: setiap kali pengguna selesai mengetik atau berpindah field (on blur), nilai langsung tersimpan ke localStorage tanpa perlu tombol "Simpan" terpisah.

## 5.1 Section: Data Pegawai

| **Field** | **Tipe Input** | **Contoh** |
| --- | --- | --- |
| Nama | Teks bebas | ZAINUDIN |
| NIP | Teks bebas (boleh ada spasi) | 199703162025061003 |
| Jabatan | Teks area (multi-baris) | Operator Alat Berat Pada UPT Balai Pengelolaan Alat dan Perbekalan |

## 5.2 Section: Data Atasan

| **Field** | **Tipe Input** | **Contoh** |
| --- | --- | --- |
| Nama | Teks bebas | HARTADI, S.T. |
| NIP | Teks bebas (boleh ada spasi) | 19811104 201001 1 018 |
| Jabatan | Teks area (multi-baris) | Kepala UPT Balai Pengelolaan Alat dan Perbekalan |

## 5.3 Section: Header Dokumen (Opsional)

| **Field** | **Tipe Input** | **Keterangan** |
| --- | --- | --- |
| Logo Dinas | Upload gambar (PNG/JPG) | Disimpan sebagai base64 di localStorage. Jika kosong, area logo tidak tampil sama sekali di PDF. |
| Nama Dinas / Instansi | Teks bebas | Jika kosong, baris ini tidak tampil sama sekali di PDF. |
| Kota | Teks bebas | Digunakan pada baris tanggal tanda tangan, contoh: Muara Teweh. |

Catatan penting: seluruh field pada bagian Header Dokumen bersifat opsional. Jika SEMUA field ini dikosongkan, maka PDF yang dihasilkan TIDAK menampilkan bagian header tambahan apapun, dan tabel data Pegawai/Atasan langsung menjadi elemen paling atas dokumen (lihat bagian 6.2).

## 5.4 Reset Data Kegiatan

- Tombol "Reset Kegiatan Bulan Ini" pada halaman Pengaturan.

- Memerlukan konfirmasi dua langkah: tekan tombol → muncul dialog peringatan pertama → pengguna konfirmasi → muncul dialog peringatan kedua yang menegaskan aksi tidak bisa dibatalkan → pengguna konfirmasi final → seluruh data kegiatan bulan yang sedang aktif dihapus.

- Data pada section Data Pegawai, Data Atasan, dan Header Dokumen TIDAK ikut terhapus oleh aksi ini.

# 6. Spesifikasi Output PDF — Detail Presisi untuk Implementasi

***Bagian ini ditulis dengan sangat eksplisit karena developer/AI yang mengimplementasikan TIDAK dapat melihat gambar referensi. Setiap elemen layout dijelaskan dalam bentuk teks dan tabel terstruktur, bukan visual.***

## 6.1 Spesifikasi Umum

- Ukuran kertas: A4 Portrait (210mm x 297mm).

- Margin halaman: atas 10mm, bawah 10mm, kiri 10mm, kanan 10mm.

- Font: gunakan font serif standar (Times New Roman atau setara) untuk kesan dokumen formal resmi.

- SELURUH teks dan elemen visual berwarna HITAM di atas latar PUTIH. Tidak ada warna, tidak ada shading/abu-abu pada PDF, meskipun aplikasi (UI input) menggunakan warna.

- Library yang direkomendasikan: gunakan library yang membangun PDF secara terstruktur/programatik (bukan screenshot/canvas dari HTML), agar teks tetap bisa di-select, hasil tajam pada segala resolusi, dan layout presisi dengan colspan/rowspan. Contoh library yang cocok untuk React: @react-pdf/renderer.

## 6.2 Bagian 1 — Header Dokumen (Tampil HANYA jika diisi di Pengaturan)

Jika logo dan/atau nama dinas diisi pada Pengaturan, tampilkan di paling atas dokumen sebelum bagian lainnya, dengan struktur:

[LOGO kiri, max tinggi 20mm]   NAMA DINAS / INSTANSI (tengah, BOLD, font besar)
                                 (garis horizontal pemisah penuh lebar halaman)

- Jika field Logo dan Nama Dinas keduanya kosong, bagian ini TIDAK tampil sama sekali — dokumen langsung dimulai dari Bagian 2 (Header Data Pegawai & Atasan).

- Jika hanya salah satu yang diisi, tampilkan yang terisi saja (misal hanya nama dinas tanpa logo, tetap tampil di tengah dengan garis pemisah di bawahnya).

## 6.3 Bagian 2 — Header Data Pegawai & Atasan

Berada tepat di bawah Bagian 1 (atau di paling atas dokumen jika Bagian 1 tidak tampil). Berupa DUA KOLOM SEJAJAR HORIZONTAL, TANPA border/garis tabel, dengan struktur:

PEGAWAI                          ATASAN
Nama    : ZAINUDIN                Nama    : HARTADI, S.T.
NIP     : 199703162025061003      NIP     : 19811104 201001 1 018
Jabatan : Operator Alat Berat     Jabatan : Kepala UPT Balai
          Pada UPT Balai                    Pengelolaan Alat
          Pengelolaan Alat                  dan Perbekalan
          dan Perbekalan

- Label "PEGAWAI" dan "ATASAN" dicetak BOLD, di atas masing-masing blok data.

- Kolom kiri (PEGAWAI) menempati persis 50% lebar halaman (dalam margin), kolom kanan (ATASAN) menempati 50% sisanya.

- Setiap baris label (Nama, NIP, Jabatan) menggunakan format "Label : Nilai" dengan tanda titik dua sejajar antar baris dalam satu kolom (gunakan lebar label yang konsisten, misal 70pt, sebelum tanda titik dua).

- Jika teks nilai (terutama Jabatan) terlalu panjang untuk satu baris, teks WAJIB wrap ke baris berikutnya dengan indentasi yang sejajar dengan posisi awal nilai (bukan sejajar dengan label) — lihat contoh di atas, baris kedua dan ketiga Jabatan dimulai sejajar dengan huruf "O" pada "Operator", bukan sejajar dengan huruf "J" pada "Jabatan".

- Tidak ada border/garis tabel sama sekali pada Bagian 2 ini.

## 6.4 Bagian 3 — Tabel Kegiatan (Tabel Utama)

Tabel dengan border penuh pada semua sel (grid lengkap), lebar 100% area konten halaman. Berikut struktur kolom dari kiri ke kanan:

| **No Kolom** | **Nama Kolom** | **Lebar Relatif** | **Alignment** | **Isi** |
| --- | --- | --- | --- | --- |
| 1 | No | 4% | Tengah | Nomor urut HARI (1 sampai jumlah hari dalam bulan), bukan nomor urut kegiatan. |
| 2 | Tanggal | 10% | Tengah | Format YYYY-MM-DD, contoh: 2026-06-01. |
| 3 | Kegiatan Tugas Jabatan | 28% | Kiri | Baris pertama: jabatan pegawai + nomor urut kegiatan dalam hari itu (contoh: "Operator Alat Berat 1"). Baris kedua: nama kegiatan. |
| 4 | Keterangan | 8% | Tengah | Selalu diisi teks "Selesai". |
| 5 | Kuantitas / Output | 9% | Tengah | Selalu diisi teks "1 Keg". |
| 6 | Waktu Pengerjaan Mulai | 8% | Tengah | Format HH:MM:SS (24 jam), contoh: 07:30:00. |
| 7 | Waktu Pengerjaan Selesai | 8% | Tengah | Format HH:MM:SS (24 jam), contoh: 08:00:00. |
| 8 | Lama Pengerjaan | 9% | Tengah | Format HH:MM:SS, dihitung otomatis dari selisih kolom 7 dan kolom 6. |
| 9 | Paraf Verifikasi | 16% | Tengah | SELALU KOSONG. Disediakan untuk tanda tangan basah saat pencetakan. |

**PENTING: kolom angka menit total (yang ada pada dokumen contoh lama, di posisi paling kanan, berisi angka seperti 30 atau 540) TIDAK DIIKUTSERTAKAN dalam tabel baru ini. Hanya kolom ****"****Lama Pengerjaan****"**** format HH:MM:SS yang dipertahankan.**

### 6.4.1 Header Tabel (Judul Kolom) — Dua Level

Header tabel terdiri dari DUA BARIS dengan struktur gabungan sel (merged cells) sebagai berikut:

- Baris pertama header: kolom No, Tanggal, Kegiatan Tugas Jabatan, Keterangan, dan Kuantitas/Output masing-masing melakukan ROWSPAN 2 (menyatu vertikal dengan baris kedua header, karena tidak punya sub-kolom).

- Baris pertama header: judul "Waktu Pengerjaan" melakukan COLSPAN 3, menaungi tiga sub-kolom di baris kedua: Mulai, Selesai, Lama.

- Baris pertama header: kolom Paraf Verifikasi melakukan ROWSPAN 2.

- Baris kedua header: hanya berisi tiga sel yaitu "Mulai", "Selesai", "Lama" (sub-kolom dari Waktu Pengerjaan).

- Seluruh teks judul kolom dicetak BOLD dan rata tengah.

### 6.4.2 Struktur Baris Data per Hari

Untuk SETIAP hari dalam bulan yang memiliki kegiatan (field disimpan = true dan minimal satu kegiatan terisi), buat baris-baris berikut secara berurutan:

- Baris kegiatan PERTAMA hari itu: kolom No diisi nomor urut hari, kolom Tanggal diisi tanggal hari itu, kolom-kolom lain diisi sesuai data kegiatan pertama (yang sudah berurutan dengan Apel Pagi di posisi pertama jika ada).

- Baris kegiatan KEDUA dan seterusnya (masih hari yang sama): kolom No dan kolom Tanggal DIKOSONGKAN (sel kosong, tidak diulang), kolom lain diisi sesuai data kegiatan tersebut.

- Baris TOTAL JAM HARIAN, ditempatkan tepat setelah baris kegiatan terakhir hari itu: kolom No dan Tanggal dikosongkan, kolom Paraf dikosongkan, sedangkan kolom Kegiatan Tugas Jabatan sampai kolom Lama Pengerjaan (7 kolom: nomor 3 sampai 8) di-COLSPAN menjadi satu sel berisi teks total jam, rata tengah atau rata kanan. Format teks: jika ada sisa menit gunakan "Total Jam Kerja Efektif [X] Jam [Y] Menit" (contoh: "Total Jam Kerja Efektif 9 Jam 30 Menit"), jika pas tanpa sisa menit gunakan "Total Jam Kerja Efektif [X] Jam" (contoh: "Total Jam Kerja Efektif 9 Jam").

Catatan penomoran kegiatan: di dalam sel kolom "Kegiatan Tugas Jabatan", baris pertama sel berisi "[Jabatan Pegawai] [nomor urut kegiatan dalam hari itu]" — contoh "Operator Alat Berat 1", "Operator Alat Berat 2", dan seterusnya. Nomor urut ini MENGIKUTI URUTAN KEGIATAN DALAM HARI ITU SAJA (mulai dari 1 lagi setiap hari baru), BUKAN nomor urut global sepanjang bulan. Baris kedua dalam sel yang sama berisi nama kegiatan yang diketik pengguna.

## 6.5 Bagian 4 — Baris Total Bulanan

Tepat setelah baris Total Jam Harian dari hari TERAKHIR yang memiliki data dalam bulan tersebut, tambahkan SATU baris penutup tabel dengan ketentuan:

- Baris ini melakukan COLSPAN SELURUH KOLOM (9 kolom, dari No sampai Paraf Verifikasi) menjadi satu sel penuh lebar tabel.

- Isi teks: "Total Jam Kerja Efektif Bulan [Nama Bulan] [Tahun] [Total Jam Keseluruhan] Jam", contoh: "Total Jam Kerja Efektif Bulan Juni 2026 155 Jam".

- Teks dicetak BOLD, rata tengah.

- Total jam keseluruhan ini adalah akumulasi dari SEMUA baris Total Jam Harian di atasnya (hanya hari yang disimpan/disimpan=true yang diikutsertakan dalam akumulasi).

## 6.6 Bagian 5 — Footer Tanda Tangan

Berada DI LUAR/DI BAWAH tabel (bukan baris tabel), tanpa border/garis apapun, dengan layout TIGA KOLOM sejajar horizontal:

Pejabat Penilai,          [Kota], [tanggal] [Bulan] [Tahun]          Pegawai Yang Membuat,

[NAMA ATASAN, BOLD]                                                  [NAMA PEGAWAI, BOLD]
NIP [NIP Atasan]                                                     NIP. [NIP Pegawai]

- Kolom KIRI: teks label "Pejabat Penilai," lalu beri jarak vertikal kosong setara kurang lebih 4 baris (ruang untuk tanda tangan basah), lalu nama atasan (BOLD), lalu baris NIP atasan.

- Kolom TENGAH: teks kota dan tanggal, format "[Kota], [tanggal] [Bulan] [Tahun]" — contoh "Muara Teweh, 30 Juni 2026". Nilai kota diambil dari Pengaturan, dan tanggal yang digunakan adalah TANGGAL TERAKHIR pada bulan yang sedang di-generate (bukan tanggal hari ini saat PDF dibuat). Teks rata tengah, vertikal sejajar dengan label kolom kiri/kanan (bukan di bawah area tanda tangan).

- Kolom KANAN: teks label "Pegawai Yang Membuat," lalu jarak vertikal kosong yang sama dengan kolom kiri, lalu nama pegawai (BOLD), lalu baris NIP pegawai dengan format "NIP. [nilai]" (perhatikan tanda titik setelah NIP, mengikuti format pada dokumen contoh).

- Ketiga kolom memiliki lebar yang kurang lebih sama (masing-masing sekitar sepertiga lebar halaman).

## 6.7 Aturan Teknis Tambahan untuk Developer

- Word wrap (pembungkusan teks otomatis) WAJIB aktif pada kolom "Kegiatan Tugas Jabatan" di tabel dan pada baris "Jabatan" di header Pegawai/Atasan, karena teksnya sering panjang.

- Jika data dalam satu bulan menyebabkan tabel melebihi satu halaman A4, WAJIB ada pagination otomatis dan HEADER TABEL (dua baris judul kolom pada 6.4.1) HARUS DIULANG di setiap halaman baru.

- Nama file saat di-download: Laporan_Kegiatan_[NAMA_PEGAWAI]_[NamaBulan][Tahun].pdf — contoh: Laporan_Kegiatan_ZAINUDIN_Juni2026.pdf. Spasi pada nama pegawai diganti underscore.

- Hanya hari yang sudah ditekan tombol Simpan (disimpan = true) yang akan muncul pada PDF. Hari yang belum disimpan TIDAK ditampilkan di PDF sama sekali, meskipun sudah ada teks kegiatan yang diketik.

# 7. Preview Sebelum Download

- Tombol "Preview & Download PDF" pada halaman Kegiatan membuka tampilan preview dokumen dalam modal/halaman penuh (fullscreen), menampilkan render visual PDF yang akan di-download, bisa di-scroll untuk melihat seluruh halaman.

- Di bagian bawah modal preview, sediakan dua tombol: "Download PDF" (memicu proses download file ke perangkat) dan "Tutup" (menutup modal, kembali ke halaman Kegiatan tanpa download).

- Jika menggunakan @react-pdf/renderer di React, komponen <PDFViewer> dapat dipakai langsung untuk menampilkan preview ini di dalam modal.

# 8. Rekomendasi Teknologi (Tech Stack)

## 8.1 Frontend

| **Komponen** | **Rekomendasi** | **Alasan** |
| --- | --- | --- |
| Framework UI | React + Vite | Cocok untuk state management kompleks (banyak hari, banyak kegiatan per hari). Vite memberikan build cepat dan ringan, tanpa kebutuhan SSR karena aplikasi murni client-side. |
| Styling | Tailwind CSS | Mempercepat implementasi desain mobile-first yang elegan dan modern tanpa menulis banyak CSS manual. |
| State & Storage | React state (useState/useReducer) + localStorage API native | Tidak perlu library tambahan untuk kebutuhan penyimpanan sesederhana ini. |
| Generate & Preview PDF | @react-pdf/renderer | Membangun PDF terstruktur secara programatik (bukan screenshot HTML), mendukung colspan/rowspan layout tabel kompleks, dan menyediakan komponen <PDFViewer> untuk preview langsung di browser. |
| Deployment | Vercel atau Netlify (tier gratis) | Cukup hubungkan ke repository, deploy otomatis, HTTPS otomatis, tanpa konfigurasi server. |

## 8.2 Catatan untuk Implementasi di Emergent

- Karena dikerjakan menggunakan model AI yang tidak dapat membaca gambar, seluruh spesifikasi layout PDF pada Bab 6 ditulis dalam bentuk struktur teks/tabel eksplisit (bukan deskripsi visual umum) — pastikan instruksi tersebut disalin secara lengkap dan utuh ke prompt Emergent, termasuk seluruh contoh format yang diberikan dalam blok kode.

- Sampaikan secara eksplisit ke Emergent bahwa desain ANTARMUKA APLIKASI (halaman Kegiatan dan Pengaturan) boleh modern, elegan, dan menggunakan warna — namun desain DOKUMEN PDF HASIL OUTPUT wajib tetap hitam putih total, menyerupai dokumen resmi formal.

- Sarankan Emergent membangun fitur dalam urutan: (1) struktur data & localStorage, (2) halaman Pengaturan, (3) halaman Kegiatan beserta seluruh validasi jam pada bagian 4.6, (4) generator PDF sesuai Bab 6, (5) modal preview pada Bab 7.

## 8.3 Struktur Folder yang Disarankan

src/
├── components/
│   ├── BottomNav.jsx
│   ├── kegiatan/
│   │   ├── BulanPicker.jsx
│   │   ├── DayCard.jsx
│   │   ├── KegiatanItem.jsx
│   │   └── TotalBulanan.jsx
│   ├── pengaturan/
│   │   ├── DataPegawai.jsx
│   │   ├── DataAtasan.jsx
│   │   └── HeaderDokumen.jsx
│   └── pdf/
│       ├── LaporanPDF.jsx       (dokumen @react-pdf/renderer)
│       └── PreviewModal.jsx
├── hooks/
│   └── useLocalStorage.js
├── utils/
│   ├── timeUtils.js              (parsing, validasi, hitung durasi)
│   └── validasiKegiatan.js       (aturan 4.6: urutan, batas jam, overlap)
└── App.jsx

# 9. Ringkasan Aturan Bisnis Kritis (Checklist)

Daftar ini merangkum seluruh aturan logika yang WAJIB benar — gunakan sebagai checklist QA setelah implementasi:

- Apel Pagi selalu otomatis pindah ke posisi pertama dalam daftar kegiatan hari itu, kapanpun ditambahkan.

- Jam Apel Pagi tetap 07:30–08:00, tidak bisa diedit pengguna.

- Jika ada Apel Pagi: kegiatan berikutnya minimal mulai jam 08:00.

- Jika TIDAK ada Apel Pagi: kegiatan pertama hari itu minimal mulai jam 06:00.

- Tidak boleh ada tumpang tindih jam antar kegiatan dalam hari yang sama — kegiatan berikutnya harus mulai sama dengan atau setelah jam selesai kegiatan sebelumnya.

- Semua input/tampilan jam memakai format 24 jam (00:00–23:59), tidak ada AM/PM.

- Input jam mendukung dua cara: time picker native ATAU ketik manual, keduanya berfungsi pada field yang sama.

- Tombol Simpan per hari hanya muncul jika hari itu sudah ada minimal satu kegiatan terisi.

- Validasi (posisi Apel Pagi, batas jam, overlap) dijalankan SEBELUM proses simpan; jika gagal, simpan dibatalkan dan total jam tidak berubah.

- Setelah disimpan, kegiatan tetap bisa diedit bebas (tidak terkunci) — Simpan hanya checkpoint visual.

- Total jam harian dan total jam bulanan hanya ter-update setelah tombol Simpan ditekan dan dikonfirmasi, bukan real-time saat mengetik.

- Berpindah ke bulan lain menghapus seluruh data kegiatan bulan yang sedang aktif (dengan konfirmasi), tapi TIDAK menghapus data Pengaturan.

- PDF hanya menampilkan hari yang sudah disimpan (disimpan = true).

- Kolom angka menit pada tabel lama DIHAPUS; kolom "Lama Pengerjaan" format HH:MM:SS DIPERTAHANKAN.

- Kolom "Paraf Verifikasi" pada PDF selalu kosong.

- Header logo & nama dinas pada PDF hanya tampil jika diisi di Pengaturan; jika kosong, bagian tersebut tidak tampil sama sekali.

- Output PDF selalu hitam putih total, terlepas dari tema warna yang dipakai di UI aplikasi.