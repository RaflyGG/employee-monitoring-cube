import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CUBE - Employee Monitoring & Attendance",
  description: "Aplikasi Presensi & Pelaporan Tugas Pegawai Mobile-First",
  manifest: "/manifest.json",
  icons: {
    icon: "/cube-icon.png",
    apple: "/cube-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#F6F8F1] text-[#060057] font-sans selection:bg-[#D74D0D]/15 selection:text-[#060057]">
        {children}
      </body>
    </html>
  );
}
