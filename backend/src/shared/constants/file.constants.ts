export const SUPPORTED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

export type SupportedImageMimeType = (typeof SUPPORTED_IMAGE_MIME_TYPES)[number];

export const IMAGE_MIME_LABELS: Record<SupportedImageMimeType, string> = {
  "image/jpeg": "JPG",
  "image/png": "PNG",
  "image/webp": "WEBP",
  "image/avif": "AVIF",
};

const formatSupportedTypes = (): string => {
  const labels = SUPPORTED_IMAGE_MIME_TYPES.map((mime) => IMAGE_MIME_LABELS[mime]);
  if (labels.length <= 1) return labels[0] ?? "";
  return `${labels.slice(0, -1).join(", ")} or ${labels[labels.length - 1]}`;
};

export const IMAGE_UPLOAD_LIMITS = {
  MAX_SIZE_MB: 2,
  MAX_SIZE_BYTES: 2 * 1024 * 1024,
  MAX_FILES: 1,
} as const;

export const FILE_UPLOAD_MESSAGES = {
  INVALID_IMAGE_TYPE: `Only ${formatSupportedTypes()} images are allowed`,
  FILE_TOO_LARGE: `Image must be ${IMAGE_UPLOAD_LIMITS.MAX_SIZE_MB} MB or smaller`,
} as const;
