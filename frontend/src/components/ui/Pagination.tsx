import type { Pagination as PaginationType } from "@/types/api.types";
import { Button } from "@/components/ui/Button";

export function Pagination({
  pagination,
  onPage,
}: {
  pagination?: PaginationType;
  onPage: (page: number) => void;
}) {
  if (!pagination || pagination.totalPages <= 1) return null;
  return (
    <div className="mt-6 flex items-center justify-between gap-3">
      <p className="text-sm text-muted">
        Page {pagination.page} of {pagination.totalPages}
      </p>
      <div className="flex gap-2">
        <Button variant="surface" size="sm" disabled={pagination.page <= 1} onClick={() => onPage(pagination.page - 1)}>
          Previous
        </Button>
        <Button
          variant="surface"
          size="sm"
          disabled={pagination.page >= pagination.totalPages}
          onClick={() => onPage(pagination.page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
