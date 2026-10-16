/** Motoko Time.now() values are nanosecond bigints. */
export function timestampToDate(timestamp: bigint): Date | null {
  const date = new Date(Number(timestamp / 1_000_000n));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** HH:MM:SS in the viewer's local time, or a fallback when invalid. */
export function formatClockTime(timestamp: bigint): string {
  const date = timestampToDate(timestamp);
  if (!date) return "--:--:--";
  return date.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

/** Group a numeric string with thin separators for large balances. */
export function formatAmount(value: bigint): string {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}
