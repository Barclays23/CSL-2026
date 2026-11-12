import type { ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";

export function Modal({
  open,
  title,
  description,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-bg/70 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[92vh] w-[min(100%-1.5rem,40rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-card border border-line bg-glass-strong p-5 shadow-glass">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Dialog.Title className="font-display text-3xl leading-none text-fg">{title}</Dialog.Title>
              {description ? <Dialog.Description className="mt-2 text-sm text-muted">{description}</Dialog.Description> : null}
            </div>
            <Dialog.Close asChild>
              <IconButton aria-label="Close">
                <X className="h-4 w-4" />
              </IconButton>
            </Dialog.Close>
          </div>
          <div className="mt-5">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
