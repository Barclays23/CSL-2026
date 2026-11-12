export function normalizeEmail(value?: string | null): string | null {
  return value?.trim().toLowerCase() || null;
}

export function normalizeMobile(value: string): string {
  return value.replace(/[\\s-]/g, "").trim();
}
