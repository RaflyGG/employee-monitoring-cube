"use client";

import { useState, useEffect, useCallback } from "react";
import {
  MapPin,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Building,
} from "lucide-react";
import { checkGeofence, DEFAULT_OFFICE } from "@/utils/geofence";

type AttendanceState = "NOT_CHECKED_IN" | "CHECKED_IN" | "COMPLETED";

interface AttendanceRecord {
  checkInTime: string;
  checkInRawDate: string;
  checkOutTime?: string;
  checkOutRawDate?: string;
  notes?: string;
}

export default function AttendancePage() {
  // 1. Live Clock State
  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
      setCurrentDate(
        now.toLocaleDateString("id-ID", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Geolocation State
  const [geoStatus, setGeoStatus] = useState<
    "loading" | "inside" | "outside" | "error"
  >("loading");
  const [geoDistance, setGeoDistance] = useState<number | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [isRefreshingGps, setIsRefreshingGps] = useState<boolean>(false);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoStatus("error");
      setGeoError("Browser Anda tidak mendukung fitur Geolocation.");
      return;
    }

    setGeoStatus("loading");
    setGeoError(null);
    setIsRefreshingGps(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const result = checkGeofence(latitude, longitude, DEFAULT_OFFICE);
        setGeoDistance(result.distance);
        setGeoStatus(result.isInside ? "inside" : "outside");
        setIsRefreshingGps(false);
      },
      (error) => {
        setIsRefreshingGps(false);
        setGeoStatus("error");
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGeoError("Izin akses lokasi ditolak. Aktifkan GPS pada perangkat.");
            break;
          case error.POSITION_UNAVAILABLE:
            setGeoError("Sinyal GPS tidak tersedia atau tidak akurat.");
            break;
          case error.TIMEOUT:
            setGeoError("Waktu pencarian sinyal GPS habis. Coba lagi.");
            break;
          default:
            setGeoError("Gagal mendeteksi lokasi.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      }
    );
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  // 3. Attendance Flow & Form State
  const [attendanceState, setAttendanceState] =
    useState<AttendanceState>("NOT_CHECKED_IN");
  const [record, setRecord] = useState<AttendanceRecord | null>(null);
  const [note, setNote] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleClockIn = () => {
    if (geoStatus === "loading") return;

    setIsSubmitting(true);
    const now = new Date();
    const timeStr = now.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    setTimeout(() => {
      setRecord({
        checkInTime: timeStr,
        checkInRawDate: now.toISOString(),
        notes: note.trim() || undefined,
      });
      setAttendanceState("CHECKED_IN");
      setNote("");
      setIsSubmitting(false);
    }, 400);
  };

  const handleClockOut = () => {
    if (geoStatus === "loading" || !record) return;

    setIsSubmitting(true);
    const now = new Date();
    const timeStr = now.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    setTimeout(() => {
      setRecord((prev) =>
        prev
          ? {
              ...prev,
              checkOutTime: timeStr,
              checkOutRawDate: now.toISOString(),
            }
          : null
      );
      setAttendanceState("COMPLETED");
      setIsSubmitting(false);
    }, 400);
  };

  // Calculate work duration
  const calculateWorkHours = () => {
    if (!record?.checkInRawDate || !record?.checkOutRawDate) return "-";
    const start = new Date(record.checkInRawDate).getTime();
    const end = new Date(record.checkOutRawDate).getTime();
    const diffMs = Math.max(0, end - start);
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours} jam ${minutes} menit`;
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Live Digital Clock Card */}
      <section className="bg-white border border-slate-200/80 rounded-2xl p-5 text-center shadow-xs">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          {currentDate || "Memuat tanggal..."}
        </p>
        <div className="my-1">
          <span className="font-mono text-4xl font-bold tracking-tight text-slate-900">
            {currentTime || "--:--:--"}
          </span>
          <span className="text-xs font-semibold text-slate-400 ml-1.5">
            WIB
          </span>
        </div>
        <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
          <Building className="h-3.5 w-3.5 text-slate-400" />
          <span>Kantor Utama (Radius {DEFAULT_OFFICE.radiusMeters}m)</span>
        </div>
      </section>

      {/* 2. GPS Status Card */}
      <section className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-600" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Validasi Lokasi (GPS)
            </h2>
          </div>
          <button
            type="button"
            onClick={requestLocation}
            disabled={isRefreshingGps}
            aria-label="Refresh Lokasi"
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${
                isRefreshingGps ? "animate-spin text-blue-600" : ""
              }`}
            />
          </button>
        </div>

        {/* State: GPS Loading */}
        {geoStatus === "loading" && (
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <RefreshCw className="h-4 w-4 text-blue-600 animate-spin shrink-0" />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-700">
                Mencari sinyal GPS...
              </span>
              <span className="text-[11px] text-slate-400">
                Menghitung jarak ke titik kantor
              </span>
            </div>
          </div>
        )}

        {/* State: Inside Geofence */}
        {geoStatus === "inside" && (
          <div className="flex items-start gap-3 p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl">
            <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-emerald-900 leading-tight">
                Di dalam radius kantor ({geoDistance ?? 0} meter)
              </span>
              <span className="text-[11px] text-emerald-700/90 mt-0.5">
                Koordinat terverifikasi dalam zona aman presensi.
              </span>
            </div>
          </div>
        )}

        {/* State: Outside Geofence */}
        {geoStatus === "outside" && (
          <div className="flex items-start gap-3 p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-amber-900 leading-tight">
                Di luar radius kantor ({geoDistance ?? 0} meter)
              </span>
              <span className="text-[11px] text-amber-700/90 mt-0.5">
                Jarak Anda melebihi batas radius {DEFAULT_OFFICE.radiusMeters}m.
              </span>
            </div>
          </div>
        )}

        {/* State: GPS Error / Permission Denied */}
        {geoStatus === "error" && (
          <div className="flex items-start gap-3 p-3 bg-rose-50/80 border border-rose-200 rounded-xl">
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 flex flex-col">
              <span className="text-sm font-semibold text-rose-900 leading-tight">
                Gagal Mendapatkan Lokasi
              </span>
              <span className="text-[11px] text-rose-700 mt-0.5">
                {geoError || "Pastikan GPS aktif dan izin lokasi diizinkan."}
              </span>
              <button
                type="button"
                onClick={requestLocation}
                className="mt-2 text-xs font-semibold text-rose-800 underline self-start"
              >
                Coba Lagi
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 3. Action Section by Attendance State */}

      {/* STATE 1: NOT CHECKED IN */}
      {attendanceState === "NOT_CHECKED_IN" && (
        <section className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="attendance-note"
              className="text-xs font-semibold text-slate-700"
            >
              Keterangan Hari Ini (Opsional)
            </label>
            <textarea
              id="attendance-note"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: Bekerja di Divisi Tech, Lantai 3..."
              className="w-full text-sm p-3 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400 transition"
            />
          </div>

          <button
            type="button"
            onClick={handleClockIn}
            disabled={geoStatus === "loading" || isSubmitting}
            className="w-full h-13 min-h-[52px] bg-blue-600 hover:bg-blue-700 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 text-white font-semibold text-base rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            {isSubmitting ? (
              <RefreshCw className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <span>Clock In Sekarang</span>
                <ArrowRight className="h-4 w-4 stroke-[2.5]" />
              </>
            )}
          </button>

          {geoStatus === "loading" && (
            <p className="text-[11px] text-center text-slate-400 font-medium">
              Menunggu akurasi GPS sebelum dapat melakukan absensi...
            </p>
          )}
        </section>
      )}

      {/* STATE 2: CHECKED IN (BELUM PULANG) */}
      {attendanceState === "CHECKED_IN" && (
        <section className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                Status Kehadiran
              </span>
              <span className="text-base font-bold text-slate-900 mt-0.5">
                Jam Masuk: {record?.checkInTime} WIB
              </span>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Sudah Masuk
            </span>
          </div>

          {record?.notes && (
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs text-slate-600">
              <span className="font-semibold text-slate-700">Catatan: </span>
              {record.notes}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label
              htmlFor="checkout-note"
              className="text-xs font-semibold text-slate-700"
            >
              Catatan Sebelum Pulang (Opsional)
            </label>
            <textarea
              id="checkout-note"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ringkasan pekerjaan yang selesai hari ini..."
              className="w-full text-sm p-3 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-800 placeholder:text-slate-400 transition"
            />
          </div>

          <button
            type="button"
            onClick={handleClockOut}
            disabled={geoStatus === "loading" || isSubmitting}
            className="w-full h-13 min-h-[52px] bg-slate-900 hover:bg-black active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 text-white font-semibold text-base rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            {isSubmitting ? (
              <RefreshCw className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <span>Clock Out Pulang</span>
                <Clock className="h-4 w-4" />
              </>
            )}
          </button>
        </section>
      )}

      {/* STATE 3: COMPLETED (SELESAI HARI INI) */}
      {attendanceState === "COMPLETED" && (
        <section className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-2.5 text-emerald-700 bg-emerald-50/80 border border-emerald-200/70 p-3 rounded-xl">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold">
                Kehadiran Hari Ini Selesai
              </span>
              <span className="text-[11px] text-emerald-800/80">
                Data kehadiran dan jam kerja Anda telah tersimpan rapi.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-400 font-medium block">
                Jam Masuk
              </span>
              <span className="text-sm font-bold text-slate-800">
                {record?.checkInTime} WIB
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-400 font-medium block">
                Jam Pulang
              </span>
              <span className="text-sm font-bold text-slate-800">
                {record?.checkOutTime} WIB
              </span>
            </div>
          </div>

          <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
              Total Durasi Kerja:
            </span>
            <span className="text-sm font-bold text-blue-600 font-mono">
              {calculateWorkHours()}
            </span>
          </div>
        </section>
      )}
    </div>
  );
}

