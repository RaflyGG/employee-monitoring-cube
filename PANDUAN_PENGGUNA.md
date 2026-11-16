# Panduan Penggunaan Aplikasi CUBE
**Employee Monitoring & Attendance System**  
*CUBE Studio &bull; Versi 1.0 (MVP)*

---

## 📱 Akses Aplikasi
- **URL Aplikasi:** [https://employee-monitoring-cube.vercel.app](https://employee-monitoring-cube.vercel.app)
- **Kompatibilitas:** Dioptimalkan untuk Smartphone (Mobile-First iOS/Android) dan Browser Desktop (Google Chrome, Safari, Microsoft Edge).

---

## 1. Pendaftaran & Masuk (Autentikasi)

### A. Mendaftarkan Akun Baru (Pertama Kali)
1. Buka [https://employee-monitoring-cube.vercel.app/login](https://employee-monitoring-cube.vercel.app/login).
2. Klik tab **Daftar Akun**.
3. Isi data lengkap:
   - **ID Pegawai:** Masukkan Nomor Induk Pegawai (misal: `EMP-001`). *ID ini tidak boleh sama dengan pegawai lain.*
   - **Nama Lengkap:** Nama resmi Anda.
   - **Email Perusahaan:** Email unik aktif (misal: `nama@cubestudio.id`).
   - **Kata Sandi:** Minimal 6 karakter.
4. Klik tombol **Daftar Akun Pegawai**.
5. Setelah muncul notifikasi berhasil, klik **"Klik di sini untuk Masuk"** dan lakukan login.

### B. Masuk ke Akun (Login)
1. Pada tab **Masuk (Login)**, ketik Email dan Kata Sandi Anda.
2. Klik tombol **Masuk ke Akun**.
   - Jika akun Anda berstatus **Pegawai (`EMPLOYEE`)**, Anda otomatis diarahkan ke **Halaman Absensi**.
   - Jika akun Anda berstatus **Admin (`HR_ADMIN` / `SUPERVISOR`)**, Anda otomatis diarahkan ke **Dashboard Monitoring Admin**.

---

## 2. Panduan untuk Pegawai (Mode Mobile)

Aplikasi memiliki 3 menu navigasi utama di bagian bawah layar:

### 🕒 Menu "Absen" (Beranda)
Digunakan untuk melakukan absensi masuk (*Clock In*) dan pulang (*Clock Out*):
1. **Izinkan Akses GPS:**
   - Saat halaman dibuka, browser akan meminta izin lokasi: **Pilih "Allow / Izinkan"**.
   - Sistem akan mengukur jarak posisi Anda ke titik koordinat kantor secara otomatis (*Geofencing*).
2. **Status Indikator Lokasi:**
   - 🟢 **Di dalam radius kantor:** Anda berada dalam zona aman presensi.
   - 🟡 **Di luar radius kantor:** Jarak Anda melebihi radius kantor (absen tetap diperbolehkan, namun tercatat *Luar Area* sebagai audit anti-kecurangan).
   - 🔴 **Gagal Mendapatkan Lokasi:** Pastikan GPS HP aktif dan sinyal stabil, lalu tekan tombol **"Coba Lagi"**.
3. **Melakukan Clock-In (Masuk Kerja):**
   - Tulis catatan jika diperlukan (misal: *Kerja dari Kantor* atau *Kunjungan Klien*).
   - Tekan tombol oranye **Clock In Sekarang**.
   - Jam masuk akan otomatis tercatat: **Tepat Waktu** (sebelum jam batas kantor, default 08:00 WIB) atau **Terlambat**.
4. **Melakukan Clock-Out (Pulang Kerja):**
   - Setelah jam kerja selesai, buka kembali aplikasi.
   - Tambahkan catatan jika ada, lalu tekan tombol navy **Clock Out Sekarang**.
   - Durasi kerja harian akan terhitung otomatis (jam dan menit).

---

### 📝 Menu "Aktivitas" (Pelaporan Tugas Harian)
Digunakan untuk melaporkan progres pekerjaan selama hari tersebut:
> **Catatan:** Menu aktivitas terbuka penuh setelah Anda melakukan *Clock-In* hari ini.

1. **Membuat Tugas Baru:**
   - Tulis rincian pekerjaan pada kolom *Deskripsi pekerjaan / aktivitas harian*.
   - Pilih status awal: **Sedang Dikerjakan (In Progress)** atau **Selesai (Completed)**.
   - Tekan tombol **+ Tambah Tugas**.
2. **Mengubah Status Tugas:**
   - Anda dapat mengganti status tugas kapan saja dengan memilih opsi pada tombol tugas:
     - 🟡 **Progres:** Pekerjaan sedang berjalan.
     - 🟢 **Selesai:** Pekerjaan telah tuntas.
     - 🔴 **Kendala (Blocked):** Pekerjaan terhambat masalah/butuh bantuan.
3. **Menghapus Tugas:** Tekan ikon tempat sampah merah jika ingin membatalkan item tugas.

---

### 📅 Menu "Riwayat" (Histori Pribadi)
1. **Ringkasan Kartu Atas:**
   - Melihat total hari hadir, jumlah tepat waktu, frekuensi terlambat, dan akumulasi jam kerja.
2. **Filter Riwayat:**
   - Pilih **Semua** atau **Bulan Ini** untuk memfilter data.
3. **Rincian Harian & Tugas:**
   - Setiap kartu menampilkan tanggal, jam masuk, jam pulang, durasi, dan status radius kantor.
   - Tekan **Rincian Tugas** (accordion) untuk melihat daftar pekerjaan apa saja yang Anda selesaikan pada tanggal tersebut.

---

## 3. Panduan untuk HR & Admin (Panel `/admin`)

Akun dengan role **`HR_ADMIN`** atau **`SUPERVISOR`** memiliki panel khusus untuk mengontrol dan mengevaluasi operasional tim. Terdapat tombol pintas **"Admin"** di header atas untuk beralih mode kapan saja.

### 📊 1. Monitoring Hari Ini (`/admin`)
- **Metrik Real-time:** Menampilkan total pegawai aktif, jumlah hadir, jumlah tepat waktu, jumlah terlambat, absen di luar radius, dan pegawai yang belum absen.
- **Pencarian & Filter Cepat:** Cari pegawai berdasarkan nama, ID, divisi, atau filter status (*Semua, Tepat Waktu, Terlambat, Luar Area, Belum Absen*).
- **Pemeriksaan Titik GPS:** Klik tautan **Peta** pada baris pegawai untuk langsung membuka koordinat GPS saat absen di Google Maps.
- **Inspeksi Tugas:** Klik tombol **X Tugas** pada pegawai untuk meninjau pekerjaan harian yang sedang/sudah dikerjakan hari ini.
- **Pilih Tanggal:** Menggunakan *Date Picker* di kanan atas untuk mengecek kehadiran hari-hari sebelumnya.

---

### 📑 2. Rekap & Export CSV (`/admin/riwayat`)
- **Filter Fleksibel:**
  - Rentang tanggal (*Dari Tanggal* s/d *Sampai Tanggal*).
  - Filter berdasarkan Pegawai tertentu atau Semua Pegawai.
  - Filter berdasarkan Departemen/Divisi.
- **Akumulasi Jam Kerja:** Menampilkan total menit/jam produktif tim pada periode yang dipilih.
- **Export ke Excel / Google Sheets:**
  - Tekan tombol oranye **Export CSV**.
  - File spreadsheet `.csv` akan otomatis terunduh lengkap dengan kolom tanggal, identitas pegawai, jam masuk/keluar, status geofence, koordinat, catatan, dan rangkuman aktivitas.

---

### 👥 3. Data Pegawai (`/admin/pegawai`) *(Khusus HR Admin)*
- **Mengubah Role Akses:** Menaikkan status pegawai menjadi **`SUPERVISOR`** (hanya bisa memantau) atau **`HR_ADMIN`** (akses penuh).
- **Penempatan Kantor:** Menentukan lokasi kantor tempat pegawai wajib absen.
- **Mengatur Divisi/Departemen:** Menambahkan unit kerja (misal: *Tech, Marketing, Operational*).
- **Status Keaktifan:** Mengaktifkan atau menonaktifkan akun pegawai yang sudah tidak aktif / resign.

---

### 🏢 4. Kantor & Geofence (`/admin/kantor`) *(Khusus HR Admin)*
- **Menentukan Titik Kantor:** Masukkan nama kantor, Latitude, dan Longitude.
- **Tombol GPS Praktis:** Klik **"Ambil GPS Lokasi Saya"** jika Anda sedang berada di kantor fisik untuk mengisi titik koordinat secara instan dan presisi.
- **Radius Aman (Geofence):** Tentukan batas toleransi jarak (default `200` meter).
- **Jam Kerja:** Tentukan batas jam masuk (*Work Start Time*, misal `08:00`) untuk penentuan status *Tepat Waktu / Terlambat* otomatis, serta jam kepulangan (*Work End Time*).

---

## ❓ FAQ & Solusi Kendala Umum

**Q: Lokasi saya terdeteksi di luar kantor padahal saya sudah di dalam gedung?**  
*A: Dinding beton tebal atau gedung bertingkat terkadang membiaskan akurasi sinyal GPS smartphone. Tekan tombol Refresh GPS pada kotak lokasi. Admin juga dapat menaikkan radius toleransi geofence (misal menjadi 250m - 300m) pada menu `/admin/kantor`.*

**Q: Apakah bisa menambahkan ikon aplikasi CUBE di layar utama HP seperti aplikasi native?**  
*A: Bisa! Aplikasi CUBE sudah mendukung PWA (Progressive Web App):*
- *Di iOS (Safari):* Tekan tombol **Share (Bagikan)** &rarr; pilih **"Add to Home Screen (Tambah ke Layar Utama)"**.
- *Di Android (Chrome):* Tekan menu titik tiga &rarr; pilih **"Install App / Tambahkan ke Layar Utama"**.

---
*Dokumentasi ini disusun untuk pengguna internal & client CUBE Studio.*
