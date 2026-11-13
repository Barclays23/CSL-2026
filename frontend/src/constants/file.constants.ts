export const PHOTO_MAX_SIZE_MB = 2;
export const PHOTO_MAX_BYTES = PHOTO_MAX_SIZE_MB * 1024 * 1024;

export const PHOTO_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

export type SupportedPhotoMimeType = (typeof PHOTO_MIME_TYPES)[number];

export const PHOTO_MIME_LABELS: Record<SupportedPhotoMimeType, string> = {
  "image/jpeg": "JPG",
  "image/png": "PNG",
  "image/webp": "WEBP",
  "image/avif": "AVIF",
};

const formatSupportedTypes = (): string => {
  const labels = PHOTO_MIME_TYPES.map((mime) => PHOTO_MIME_LABELS[mime]);
  if (labels.length <= 1) return labels[0] ?? "";
  return `${labels.slice(0, -1).join(", ")} or ${labels[labels.length - 1]}`;
};

export const PHOTO_VALIDATION_MESSAGES = {
  INVALID_TYPE: `Use a ${formatSupportedTypes()} image`,
  FILE_TOO_LARGE: `Image must be ${PHOTO_MAX_SIZE_MB} MB or smaller`,
} as const;