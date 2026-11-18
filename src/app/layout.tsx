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
  viewportFit: "cover",
};

const themeInitScript = `
  (function() {
    try {
      var stored = localStorage.getItem('cube-theme');
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (stored === 'dark' || (!stored && prefersDark)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-[#F6F8F1] dark:bg-[#0B0E17] text-[#060057] dark:text-[#F6F8F1] font-sans selection:bg-[#D74D0D]/15 dark:selection:bg-[#FF6B2B]/25 selection:text-[#060057] dark:selection:text-[#F6F8F1] transition-colors duration-150">
        {children}
      </body>
    </html>
  );
}
