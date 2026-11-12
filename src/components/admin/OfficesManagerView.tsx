"use client";

import { useState, useTransition } from "react";
import {
  MapPin,
  Plus,
  Save,
  Crosshair,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
} from "lucide-react";
import { getAdminOffices, upsertOfficeAction } from "@/actions/admin";
import type { Office } from "@/types/database";

export function OfficesManagerView({
  initialOffices,
  isHrAdmin,
  initialError,
}: {
  initialOffices: Office[];
  isHrAdmin: boolean;
  initialError?: string;
}) {
  const [offices, setOffices] = useState<Office[]>(initialOffices);
  const [editingId, setEditingId] = useState<string | null>(
    initialOffices[0]?.id || null
  );
  const [name, setName] = useState<string>(
    initialOffices[0]?.name || "Kantor Utama CUBE"
  );
  const [latitude, setLatitude] = useState<string>(
    initialOffices[0] ? String(initialOffices[0].latitude) : "-6.9703801"
  );
  const [longitude, setLongitude] = useState<string>(
    initialOffices[0] ? String(initialOffices[0].longitude) : "107.6302057"
  );
  const [radiusMeters, setRadiusMeters] = useState<string>(
    initialOffices[0] ? String(initialOffices[0].radius_meters) : "200"
  );
  const [workStart, setWorkStart] = useState<string>(
    initialOffices[0]?.work_start_time?.slice(0, 5) || "08:00"
  );
  const [workEnd, setWorkEnd] = useState<string>(
    initialOffices[0]?.work_end_time?.slice(0, 5) || "17:00"
  );
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(
    initialError ? { type: "error", message: initialError } : null
  );
  const [isPending, startTransition] = useTransition();

  const selectOffice = (office: Office) => {
    setEditingId(office.id);
    setName(office.name);
    setLatitude(String(office.latitude));
    setLongitude(String(office.longitude));
    setRadiusMeters(String(office.radius_meters));
    setWorkStart(office.work_start_time.slice(0, 5));
    setWorkEnd(office.work_end_time.slice(0, 5));
    setFeedback(null);
  };

  const prepareNewOffice = () => {
    setEditingId(null);
    setName("");
    setLatitude("");
    setLongitude("");
    setRadiusMeters("200");
    setWorkStart("08:00");
    setWorkEnd("17:00");
    setFeedback(null);
  };

  const fillWithCurrentGps = () => {
    if (!navigator.geolocation) {
      setFeedback({
        type: "error",
        message: "Browser tidak mendukung fitur Geolocation.",
      });
      return;
    }

    setIsLocating(true);
    setFeedback(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(7));
        setLongitude(pos.coords.longitude.toFixed(7));
        setIsLocating(false);
        setFeedback({
          type: "success",
          message: "Koordinat GPS saat ini berhasil diisi.",
        });
      },
      () => {
        setIsLocating(false);
        setFeedback({
          type: "error",
          message: "Gagal mengambil GPS. Pastikan izin lokasi browser aktif.",
        });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    const parsedLat = Number(latitude);
    const parsedLng = Number(longitude);
    const parsedRadius = Number(radiusMeters);

    startTransition(async () => {
      const res = await upsertOfficeAction({
        id: editingId || undefined,
        name,
        latitude: parsedLat,
        longitude: parsedLng,
        radius_meters: parsedRadius,
        work_start_time: workStart,
        work_end_time: workEnd,
      });

      if (res.error) {
        setFeedback({ type: "error", message: res.error });
        return;
      }

      const fresh = await getAdminOffices();
      setOffices(fresh.offices);
      if (res.office) {
        selectOffice(res.office);
      }
      setFeedback({
        type: "success",
        message: "Konfigurasi lokasi kantor berhasil disimpan.",
      });
    });
  };

  const hasValidPreview =
    latitude.trim() !== "" &&
    longitude.trim() !== "" &&
    Number.isFinite(Number(latitude)) &&
    Number.isFinite(Number(longitude));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-[#060057] tracking-tight">
            Pengaturan Kantor & Geofence
          </h1>
          <p className="text-xs text-[#060057]/60 mt-0.5">
            Tentukan titik koordinat GPS kantor, radius aman presensi, dan jam kerja
          </p>
        </div>

        {isHrAdmin && (
          <button
            type="button"
            onClick={prepareNewOffice}
            className="h-9 px-3.5 rounded-xl bg-[#D74D0D] hover:bg-[#b83f09] text-white text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Kantor</span>
          </button>
        )}
      </div>

      {!isHrAdmin && (
        <div className="p-3.5 rounded-xl bg-[#E9B501]/20 border border-[#E9B501]/60 text-xs font-semibold text-[#060057]">
          Mode baca saja: hanya role HR Admin yang dapat mengubah titik kantor atau jam kerja.
        </div>
      )}

      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-[#C92121]/10 border-[#C92121]/30 text-[#C92121]"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Office List */}
        <div className="bg-white border border-[#060057]/10 rounded-2xl p-4 shadow-xs flex flex-col gap-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#060057]/55">
            Daftar Kantor ({offices.length})
          </h2>

          {offices.length === 0 ? (
            <div className="p-6 text-center bg-[#F6F8F1] rounded-xl border border-dashed border-[#060057]/15">
              <Building2 className="h-6 w-6 text-[#060057]/30 mx-auto mb-2" />
              <p className="text-xs font-semibold text-[#060057]/70">
                Belum ada kantor di database. Simpan form di samping untuk membuat kantor pertama.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {offices.map((office) => {
                const selected = editingId === office.id;
                return (
                  <button
                    key={office.id}
                    type="button"
                    onClick={() => selectOffice(office)}
                    className={`text-left p-3 rounded-xl border transition-all ${
                      selected
                        ? "bg-[#060057] text-white border-[#060057]"
                        : "bg-[#F6F8F1] text-[#060057] border-[#060057]/10 hover:border-[#060057]/30"
                    }`}
                  >
                    <p className="text-sm font-bold">{office.name}</p>
                    <p
                      className={`text-[11px] font-mono mt-1 ${
                        selected ? "text-white/80" : "text-[#060057]/60"
                      }`}
                    >
                      Radius {office.radius_meters}m • {office.work_start_time.slice(0, 5)} - {office.work_end_time.slice(0, 5)} WIB
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Office Form */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-2 bg-white border border-[#060057]/10 rounded-2xl p-5 shadow-xs flex flex-col gap-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#060057]/10">
            <h2 className="text-sm font-bold text-[#060057] flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#D74D0D]" />
              <span>
                {editingId ? "Edit Konfigurasi Kantor" : "Tambah Kantor Baru"}
              </span>
            </h2>

            {isHrAdmin && (
              <button
                type="button"
                onClick={fillWithCurrentGps}
                disabled={isLocating}
                className="px-3 py-1.5 rounded-xl bg-[#E9B501]/20 border border-[#E9B501]/60 text-xs font-bold text-[#060057] hover:bg-[#E9B501]/30 flex items-center gap-1.5 transition-colors"
              >
                <Crosshair className="h-3.5 w-3.5 text-[#D74D0D]" />
                <span>
                  {isLocating ? "Mengambil GPS..." : "Ambil GPS Lokasi Saya"}
                </span>
              </button>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-[#060057] mb-1.5">
              Nama Kantor
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!isHrAdmin}
              required
              placeholder="Kantor Utama Cube Studio"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F8F1] border border-[#060057]/15 text-sm font-medium text-[#060057] disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[#D74D0D]/30"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#060057] mb-1.5">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                disabled={!isHrAdmin}
                required
                placeholder="-6.9703801"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F8F1] border border-[#060057]/15 text-sm font-mono text-[#060057] disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[#D74D0D]/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#060057] mb-1.5">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                disabled={!isHrAdmin}
                required
                placeholder="107.6302057"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F8F1] border border-[#060057]/15 text-sm font-mono text-[#060057] disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[#D74D0D]/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#060057] mb-1.5">
                Radius Aman (Meter)
              </label>
              <input
                type="number"
                min={10}
                step={10}
                value={radiusMeters}
                onChange={(e) => setRadiusMeters(e.target.value)}
                disabled={!isHrAdmin}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F6F8F1] border border-[#060057]/15 text-sm font-mono text-[#060057] disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[#D74D0D]/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#060057] mb-1.5">
                Jam Masuk (Batas Tepat Waktu WIB)
              </label>
              <div className="flex items-center bg-[#F6F8F1] border border-[#060057]/15 rounded-xl px-3.5 py-2.5">
                <Clock className="h-4 w-4 text-[#D74D0D] mr-2 shrink-0" />
                <input
                  type="time"
                  value={workStart}
                  onChange={(e) => setWorkStart(e.target.value)}
                  disabled={!isHrAdmin}
                  required
                  className="w-full text-sm font-mono font-bold text-[#060057] bg-transparent focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#060057] mb-1.5">
                Jam Pulang (WIB)
              </label>
              <div className="flex items-center bg-[#F6F8F1] border border-[#060057]/15 rounded-xl px-3.5 py-2.5">
                <Clock className="h-4 w-4 text-[#060057]/60 mr-2 shrink-0" />
                <input
                  type="time"
                  value={workEnd}
                  onChange={(e) => setWorkEnd(e.target.value)}
                  disabled={!isHrAdmin}
                  required
                  className="w-full text-sm font-mono font-bold text-[#060057] bg-transparent focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            {hasValidPreview ? (
              <a
                href={`https://www.google.com/maps?q=${latitude},${longitude}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-[#060057] hover:text-[#D74D0D] inline-flex items-center gap-1.5 underline"
              >
                <span>Cek Titik di Google Maps</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : (
              <span />
            )}

            {isHrAdmin && (
              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2.5 rounded-xl bg-[#060057] hover:bg-[#060057]/90 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>{isPending ? "Menyimpan..." : "Simpan Konfigurasi"}</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

