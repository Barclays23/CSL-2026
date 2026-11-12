export const normalizeEmail = (value?: string | null) => value?.trim().toLowerCase() || null;
export const normalizeMobile = (value: string) => value.replace(/[\\s-]/g, "").trim();
