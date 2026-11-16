# CUBE - Employee Monitoring & Attendance System

Aplikasi web modern (*mobile-first*) untuk presensi berbasis radius lokasi (Geofencing GPS) dan pelaporan aktivitas tugas harian pegawai, terintegrasi dengan dashboard monitoring untuk HR & Supervisor.

Built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS v4**, dan **Supabase (PostgreSQL & SSR Auth)**.

---

## 🚀 Live Demo
- **Production URL:** [https://employee-monitoring-cube.vercel.app](https://employee-monitoring-cube.vercel.app)
- **Panduan Penggunaan Lengkap:** Lihat dokumen [PANDUAN_PENGGUNA.md](./PANDUAN_PENGGUNA.md)

---

## ✨ Fitur Utama

### 📱 Sisi Pegawai (Mobile-First UI)
- **Presensi GPS Geofencing:** Clock-In dan Clock-Out otomatis mendeteksi jarak ke titik kantor, menghitung durasi kerja, dan menandai keterlambatan secara transparan.
- **Aktivitas Harian:** Pelaporan progres tugas harian (*In Progress*, *Completed*, *Blocked*) per hari kerja.
- **Riwayat Absensi & Accordion Tugas:** Rekapitulasi kehadiran pribadi, akumulasi jam kerja, dan daftar aktivitas yang dapat di-expand per tanggal.
- **Mobile Safe Area & PWA Ready:** Mendukung instalasi ke layar utama (Add to Home Screen) di iOS dan Android dengan safe-area notch & gesture bar.

### 🛡️ Sisi HR & Admin (`/admin`)
- **Monitoring Hari Ini (Live):** Dashboard metrik kehadiran tim secara *real-time*, inspeksi titik koordinat GPS ke Google Maps, serta rekap tugas harian tiap pegawai.
- **Rekapitulasi & Export CSV:** Filter riwayat kehadiran berdasarkan rentang tanggal, pegawai, dan departemen, dilengkapi unduhan spreadsheet Excel/CSV.
- **Manajemen Pegawai:** Pengaturan role akses (`EMPLOYEE`, `SUPERVISOR`, `HR_ADMIN`), divisi, penempatan kantor, dan status aktif.
- **Konfigurasi Kantor & Geofence:** Manajemen titik koordinat kantor, radius toleransi GPS (meter), jam batas masuk/pulang WIB, dan tombol *Ambil GPS Lokasi Saya*.

---

## 🛠️ Tech Stack & Arsitektur
- **Framework:** Next.js 16.4.5 (App Router, Server Actions, Proxy)
- **Styling:** Tailwind CSS v4 dengan CUBE Brand Palette (`#F6F8F1`, `#060057`, `#D74D0D`, `#E9B501`, `#C92121`)
- **Backend & Database:** Supabase PostgreSQL dengan Row-Level Security (RLS)
- **Authentication:** Supabase SSR Auth with secure HTTP-only cookies
- **Icons:** Lucide React

---

## 💻 Panduan Menjalankan Lokal

1. **Clone repository:**
   ```bash
   git clone https://github.com/RaflyGG/employee-monitoring-cube.git
   cd employee-monitoring-cube
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variables:**
   Salin `.env.local.example` menjadi `.env.local` dan isi kredensial Supabase Anda:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Jalankan database migration & RLS:**
   Eksekusi query yang terdapat di `supabase/schema.sql` dan `supabase/admin_policies.sql` pada SQL Editor Supabase.

5. **Jalankan development server:**
   ```bash
   npm run dev
   ```
   Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## 📄 Lisensi
Hak cipta &copy; 2026 CUBE Studio.
