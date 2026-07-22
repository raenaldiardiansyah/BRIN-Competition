"use client";

import React, { useState, useEffect } from "react";
import { Dialog } from "@base-ui/react/dialog";

// --- Billing Toggle ---

export type BillingCycleSelection = "monthly" | "yearly";

export function BillingCycleToggle({
  value,
  onChange,
}: {
  value: BillingCycleSelection;
  onChange: (value: BillingCycleSelection) => void;
}) {
  return (
    <div className="tw:inline-flex tw:bg-slate-100 tw:p-1 tw:rounded-xl tw:border tw:border-slate-200" role="group" aria-label="Siklus penagihan">
      <button
        type="button"
        onClick={() => onChange("monthly")}
        aria-pressed={value === "monthly"}
        className={`tw:min-h-10 tw:px-5 tw:py-1.5 tw:text-sm tw:font-semibold tw:rounded-lg tw:transition-all tw:outline-none focus-visible:tw:ring-2 focus-visible:tw:ring-indigo-500 focus-visible:tw:ring-offset-2 ${
          value === "monthly"
            ? "tw:bg-indigo-600 tw:text-white tw:shadow-sm"
            : "tw:text-slate-600 hover:tw:text-slate-900"
        }`}
      >
        Bulanan
      </button>
      <button
        type="button"
        onClick={() => onChange("yearly")}
        aria-pressed={value === "yearly"}
        className={`tw:min-h-10 tw:px-5 tw:py-1.5 tw:text-sm tw:font-semibold tw:rounded-lg tw:transition-all tw:outline-none focus-visible:tw:ring-2 focus-visible:tw:ring-indigo-500 focus-visible:tw:ring-offset-2 ${
          value === "yearly"
            ? "tw:bg-indigo-600 tw:text-white tw:shadow-sm"
            : "tw:text-slate-600 hover:tw:text-slate-900"
        }`}
      >
        Tahunan
      </button>
    </div>
  );
}

// --- Upgrade Dialog ---

export function UpgradeDialog({
  trigger,
  onConfirm,
  monthlyPrice,
}: {
  trigger: React.ReactElement;
  onConfirm: () => void;
  monthlyPrice: string;
}) {
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalRoot(document.getElementById("pl-ui-portal-root"));
  }, []);

  return (
    <Dialog.Root>
      <Dialog.Trigger render={trigger} />
      {portalRoot ? (
        <Dialog.Portal container={portalRoot} className="pl-ui-scope">
          <Dialog.Backdrop className="tw:fixed tw:inset-0 tw:bg-slate-900/40 tw:backdrop-blur-sm tw:z-50 tw:transition-opacity" />
          <div className="tw:fixed tw:inset-0 tw:z-50 tw:flex tw:items-center tw:justify-center tw:p-4">
            <Dialog.Popup className="tw:bg-white tw:rounded-xl tw:shadow-xl tw:border tw:border-slate-200 tw:w-full tw:max-w-md tw:p-6 tw:outline-none">
              <Dialog.Title className="tw:text-xl tw:font-bold tw:text-slate-900 tw:mb-2">
                Upgrade ke Pro Individual
              </Dialog.Title>
              <Dialog.Description className="tw:text-sm tw:text-slate-600 tw:mb-6 tw:leading-relaxed">
                Anda akan meng-upgrade paket ke Pro Individual seharga {monthlyPrice}. Ini adalah simulasi purwarupa, Anda tidak akan ditagih biaya nyata.
              </Dialog.Description>
              
              <div className="tw:flex tw:justify-end tw:gap-3">
                <Dialog.Close className="tw:px-4 tw:py-2 tw:text-sm tw:font-medium tw:text-slate-700 tw:bg-slate-100 tw:rounded-lg hover:tw:bg-slate-200 tw:transition-colors tw:outline-none focus-visible:tw:ring-2 focus-visible:tw:ring-slate-400">
                  Batal
                </Dialog.Close>
                <Dialog.Close 
                  onClick={onConfirm}
                  className="tw:px-4 tw:py-2 tw:text-sm tw:font-medium tw:text-white tw:bg-slate-900 tw:rounded-lg hover:tw:bg-slate-800 tw:transition-colors tw:outline-none focus-visible:tw:ring-2 focus-visible:tw:ring-slate-400"
                >
                  Konfirmasi Upgrade
                </Dialog.Close>
              </div>
            </Dialog.Popup>
          </div>
        </Dialog.Portal>
      ) : null}
    </Dialog.Root>
  );
}

// --- Cancel Dialog ---

export function CancelDialog({
  trigger,
  onConfirm,
  currentPeriodEnd,
}: {
  trigger: React.ReactElement;
  onConfirm: (reason: string | null) => void;
  currentPeriodEnd?: string;
}) {
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const [reason, setReason] = useState("");

  useEffect(() => {
    setPortalRoot(document.getElementById("pl-ui-portal-root"));
  }, []);

  const handleConfirm = () => {
    onConfirm(reason.trim() || null);
    setReason("");
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setReason(""); // Reset reason when closed without confirming
    }
  };

  const endDate = currentPeriodEnd 
    ? new Date(currentPeriodEnd).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })
    : "akhir periode";

  return (
    <Dialog.Root onOpenChange={handleOpenChange}>
      <Dialog.Trigger render={trigger} />
      {portalRoot ? (
        <Dialog.Portal container={portalRoot} className="pl-ui-scope">
          <Dialog.Backdrop className="tw:fixed tw:inset-0 tw:bg-slate-900/40 tw:backdrop-blur-sm tw:z-50 tw:transition-opacity" />
          <div className="tw:fixed tw:inset-0 tw:z-50 tw:flex tw:items-center tw:justify-center tw:p-4">
            <Dialog.Popup className="tw:bg-white tw:rounded-xl tw:shadow-xl tw:border tw:border-slate-200 tw:w-full tw:max-w-md tw:p-6 tw:outline-none">
              <Dialog.Title className="tw:text-xl tw:font-bold tw:text-slate-900 tw:mb-2">
                Batalkan Paket
              </Dialog.Title>
              <Dialog.Description className="tw:text-sm tw:text-slate-600 tw:mb-4 tw:leading-relaxed">
                Akses Pro Individual Anda akan tetap aktif hingga <strong>{endDate}</strong>. Setelah itu, akun Anda akan dikembalikan ke paket Free Core.
              </Dialog.Description>
              
              <div className="tw:mb-6">
                <label htmlFor="cancel-reason" className="tw:block tw:text-sm tw:font-medium tw:text-slate-700 tw:mb-2">
                  Alasan pembatalan (opsional)
                </label>
                <textarea 
                  id="cancel-reason"
                  maxLength={300}
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="tw:w-full tw:border tw:border-slate-300 tw:rounded-lg tw:p-3 tw:text-sm tw:text-slate-900 placeholder:tw:text-slate-400 focus:tw:outline-none focus:tw:ring-2 focus:tw:ring-slate-900"
                  placeholder="Beritahu kami mengapa Anda membatalkan..."
                />
                <p className="tw:text-xs tw:text-slate-500 tw:mt-1 tw:text-right">
                  {reason.length}/300
                </p>
              </div>

              <div className="tw:flex tw:justify-end tw:gap-3">
                <Dialog.Close className="tw:px-4 tw:py-2 tw:text-sm tw:font-medium tw:text-slate-700 tw:bg-slate-100 tw:rounded-lg hover:tw:bg-slate-200 tw:transition-colors tw:outline-none focus-visible:tw:ring-2 focus-visible:tw:ring-slate-400">
                  Kembali
                </Dialog.Close>
                <Dialog.Close 
                  onClick={handleConfirm}
                  className="tw:px-4 tw:py-2 tw:text-sm tw:font-medium tw:text-white tw:bg-red-600 tw:rounded-lg hover:tw:bg-red-700 tw:transition-colors tw:outline-none focus-visible:tw:ring-2 focus-visible:tw:ring-red-400"
                >
                  Ya, Batalkan
                </Dialog.Close>
              </div>
            </Dialog.Popup>
          </div>
        </Dialog.Portal>
      ) : null}
    </Dialog.Root>
  );
}
