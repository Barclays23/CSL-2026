import { useState } from "react";
import { ImagePlus } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { uploadImage, type UploadPurpose } from "@/services/uploadService";
import type { Asset } from "@/types/api.types";
import { errorMessage } from "@/utils/errorHandler";

export function ImageUploader({
  label,
  value,
  purpose,
  onChange,
}: {
  label: string;
  value?: Asset | null;
  purpose: UploadPurpose;
  onChange: (asset: Asset | null) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-fg">{label}</span>
      <div className="flex items-center gap-3">
        <Avatar name={label} asset={value} className="h-16 w-16" />
        <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-line bg-glass px-4 text-sm font-semibold text-fg">
          <ImagePlus className="h-4 w-4" />
          {uploading ? "Uploading…" : value ? "Replace image" : "Upload image"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={uploading}
            onChange={async (event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (!file) return;
              setUploading(true);
              setError(null);
              try {
                const response = await uploadImage(file, purpose);
                onChange(response.data);
              } catch (reason) {
                setError(errorMessage(reason));
              } finally {
                setUploading(false);
              }
            }}
          />
        </label>
        {value ? (
          <button type="button" className="text-sm text-muted underline" onClick={() => onChange(null)}>
            Remove
          </button>
        ) : null}
      </div>
      {error ? <p className="mt-1 text-sm text-danger">{error}</p> : null}
    </div>
  );
}
