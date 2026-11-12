import { createContext, useContext, useState, type ReactNode } from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { Button } from "@/components/ui/Button";

interface ConfirmOptions {
  title: string;
  description: string;
  confirmLabel?: string;
  danger?: boolean;
}

const ConfirmContext = createContext<(options: ConfirmOptions) => Promise<boolean>>(async () => false);

export function useConfirm() {
  return useContext(ConfirmContext);
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);

  const confirm = (next: ConfirmOptions) =>
    new Promise<boolean>((resolve) => {
      setOptions(next);
      setResolver(() => resolve);
    });

  const close = (value: boolean) => {
    resolver?.(value);
    setResolver(null);
    setOptions(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AlertDialog.Root open={Boolean(options)} onOpenChange={(open) => !open && close(false)}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-50 bg-bg/70 backdrop-blur-sm" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(100%-1.5rem,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-card border border-line bg-glass-strong p-5 shadow-glass">
            <AlertDialog.Title className="font-display text-2xl text-fg">{options?.title}</AlertDialog.Title>
            <AlertDialog.Description className="mt-2 text-sm text-muted">{options?.description}</AlertDialog.Description>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="surface" onClick={() => close(false)}>
                Cancel
              </Button>
              <Button variant={options?.danger ? "danger" : "primary"} onClick={() => close(true)}>
                {options?.confirmLabel ?? "Confirm"}
              </Button>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </ConfirmContext.Provider>
  );
}
