"use client";

import * as Dialog from "@radix-ui/react-dialog";

export function ConfirmDialog({
  trigger,
  title,
  body,
  confirmLabel = "Confirm",
  onConfirm,
}: {
  trigger: React.ReactNode;
  title: string;
  body: string;
  confirmLabel?: string;
  onConfirm: () => void;
}) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-ink/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[81] w-[min(92vw,440px)] -translate-x-1/2 -translate-y-1/2 rounded-card bg-white p-6 shadow-soft">
          <Dialog.Title className="text-xl font-bold text-ink">{title}</Dialog.Title>
          <Dialog.Description className="mt-2 text-slate">{body}</Dialog.Description>
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <Dialog.Close className="min-h-11 rounded-full px-4 font-semibold text-ink">Cancel</Dialog.Close>
            <Dialog.Close className="min-h-11 rounded-full bg-[#9e2a2a] px-4 font-semibold text-white" onClick={onConfirm}>
              {confirmLabel}
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
