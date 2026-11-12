/**
 * Shared Asia/Jakarta date, time, and work duration formatting helpers.
 */

const JAKARTA_TIMEZONE = "Asia/Jakarta";

/**
 * Returns today's date in YYYY-MM-DD format based on Asia/Jakarta timezone.
 */
export function getJakartaTodayDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: JAKARTA_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/**
 * Returns current time in HH:mm:ss format based on Asia/Jakarta timezone.
 */
export function getJakartaCurrentTime(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: JAKARTA_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

/**
 * Formats an ISO timestamp into HH:mm WIB.
 */
export function formatTimeWIB(isoString?: string | null): string {
  if (!isoString) return "-";
  try {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return "-";
    const formatted = date.toLocaleTimeString("id-ID", {
      timeZone: JAKARTA_TIMEZONE,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return `${formatted} WIB`;
  } catch {
    return "-";
  }
}

/**
 * Formats YYYY-MM-DD into readable Indonesian date.
 */
export function formatDateIndo(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Calculates compact work duration label from clock-in and clock-out timestamps.
 */
export function calculateDurationLabel(
  clockIn?: string | null,
  clockOut?: string | null
): string {
  if (!clockIn) return "-";
  if (!clockOut) return "Aktif";
  const start = new Date(clockIn).getTime();
  const end = new Date(clockOut).getTime();
  const diffMs = Math.max(0, end - start);
  const totalMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}j ${minutes}m`;
}

