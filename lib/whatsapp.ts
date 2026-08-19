export function buildWhatsAppLink(phone: string, message: string): string {
  const digits = phone.replace(/[^\d]/g, "");
  const normalizedPhone = digits.length === 9 && digits.startsWith("9") ? `56${digits}` : digits;

  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
}
