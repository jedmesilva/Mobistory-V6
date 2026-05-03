const nf0 = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });
const nf1 = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 1 });
const nf2 = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

function toNumber(value: number | string | null | undefined) {
  if (value == null || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const normalized = value.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

export function formatMoney(value: number | string | null | undefined) {
  const n = toNumber(value);
  return n == null ? "" : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);
}

export function formatQuantity(value: number | string | null | undefined, unit: string, decimals = 2) {
  const n = toNumber(value);
  if (n == null) return "";
  const formatter = decimals === 0 ? nf0 : decimals === 1 ? nf1 : nf2;
  return `${formatter.format(n)} ${unit}`;
}

export function formatLiquidFuel(value: number | string | null | undefined) {
  return formatQuantity(value, "L", 3);
}

export function formatGaseousFuel(value: number | string | null | undefined) {
  return formatQuantity(value, "m³", 2);
}

export function formatElectricEnergy(value: number | string | null | undefined) {
  return formatQuantity(value, "kWh", 2);
}

export function formatOdometer(value: number | string | null | undefined) {
  return formatQuantity(value, "km", 0);
}

export function formatMileage(value: number | string | null | undefined) {
  return formatQuantity(value, "mi", 0);
}

export function formatRpm(value: number | string | null | undefined) {
  return formatQuantity(value, "rpm", 0);
}

export function formatWeightKg(value: number | string | null | undefined) {
  return formatQuantity(value, "kg", 2);
}

export function formatWeightG(value: number | string | null | undefined) {
  return formatQuantity(value, "g", 0);
}

export function formatPressure(value: number | string | null | undefined, unit = "psi") {
  return formatQuantity(value, unit, 1);
}

export function formatTemperatureC(value: number | string | null | undefined) {
  return formatQuantity(value, "°C", 1);
}

export function formatTemperatureF(value: number | string | null | undefined) {
  return formatQuantity(value, "°F", 1);
}

export function parseDecimalInput(value: string) {
  const n = toNumber(value);
  return n;
}

export function formatDecimalInput(value: string, decimals = 2) {
  const n = parseDecimalInput(value);
  if (n == null) return "";
  return new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: decimals }).format(n);
}

export function formatFuelInput(value: string, type: "liquid" | "gaseous" | "electric" = "liquid") {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  const decimals = type === "electric" ? 3 : 2;
  const whole = digits.length > decimals ? digits.slice(0, -decimals) : "0";
  const frac = digits.slice(-decimals).padStart(decimals, "0");
  const separator = decimals > 0 ? "," : "";
  return `${new Intl.NumberFormat("pt-BR").format(Number(whole))}${separator}${decimals > 0 ? frac : ""}`;
}

export function getFuelUnit(type: string) {
  if (type === "diesel" || type === "diesel_s10" || type === "gasolina_comum" || type === "gasolina_aditivada" || type === "etanol") return "L";
  if (type === "gnv") return "m³";
  if (type === "eletrico") return "kWh";
  return "L";
}

export function getFuelInputMode(type: string) {
  if (type === "gnv") return "gaseous" as const;
  if (type === "eletrico") return "electric" as const;
  return "liquid" as const;
}