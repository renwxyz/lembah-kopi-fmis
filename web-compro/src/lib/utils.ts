export function formatWhatsAppUrl(
  phone?: string | null,
  text?: string
): string | null {
  if (!phone) return null;
  let cleaned = phone.replace(/[^0-9]/g, "");
  if (!cleaned) return null;
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.slice(1);
  }
  const query = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${cleaned}${query}`;
}

export function formatPhoneDisplay(phone?: string | null): string {
  if (!phone) return "";
  let cleaned = phone.replace(/[^0-9]/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.slice(1);
  }
  return `+${cleaned}`;
}

