export function formatNumber(
  value: number | null | undefined,
  maxFraction = 1,
): string {
  if (value == null) return "—";
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: maxFraction,
  }).format(value);
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatAllocation(status: string): string {
  switch (status) {
    case "UNPROCESSED":
      return "Belum Dialokasikan";
    case "PARTIAL":
      return "Dialokasikan Sebagian";
    case "FULLY_BATCHED":
      return "Dialokasikan Penuh";
    default:
      return status;
  }
}

export function formatSeverity(sev: string): string {
  switch (sev) {
    case "RINGAN":
      return "Ringan";
    case "SEDANG":
      return "Sedang";
    case "BERAT":
      return "Berat";
    default:
      return sev;
  }
}

export function formatHandlingStatus(status: string): string {
  switch (status) {
    case "TERDETEKSI":
      return "Perlu Tindakan";
    case "DALAM_PENANGANAN":
      return "Dalam Penanganan";
    case "TERKENDALI":
      return "Terkendali";
    default:
      return status;
  }
}
