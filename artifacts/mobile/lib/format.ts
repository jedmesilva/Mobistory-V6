export function formatMoney(value: number | string | null | undefined) {
  const n = typeof value === "string" ? Number(value.replace(",", ".")) : value;
  if (!Number.isFinite(n ?? NaN)) return "";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n as number);
}

export function formatVolume(value: number | string | null | undefined) {
  const n = typeof value === "string" ? Number(value.replace(",", ".")) : value;
  if (!Number.isFinite(n ?? NaN)) return "";
  return `${new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n as number)} L`;
}

export function formatOdometer(value: number | string | null | undefined) {
  const n = typeof value === "string" ? Number(String(value).replace(/[^\d]/g, "")) : value;
  if (!Number.isFinite(n ?? NaN)) return "";
  return `${new Intl.NumberFormat("pt-BR").format(n as number)} km`;
}

export function parseDecimalInput(value: string) {
  const normalized = value.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}