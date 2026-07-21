"use client";

import React, { useState, useEffect } from "react";
import { Toast } from "@base-ui/react/toast";

export type AIUsageState = "normal" | "near_limit" | "limit_reached";

function ToastNotifier({
  usageState,
  plan,
  used,
  limit,
  portalRoot,
}: {
  usageState: AIUsageState;
  plan: string;
  used: number;
  limit: number | null;
  portalRoot: HTMLElement;
}) {
  const toastManager = Toast.useToastManager<{ ctaLabel: string; ctaAnchor: string }>();
  const [shownStates, setShownStates] = useState<Set<AIUsageState>>(new Set<AIUsageState>(["normal"]));

  useEffect(() => {
    if (usageState !== "normal" && !shownStates.has(usageState)) {
      if (usageState === "near_limit") {
        toastManager.add({
          id: "ai-usage-near-limit",
          title: "Kuota AI hampir habis",
          description: `Tersisa ${limit ? limit - used : 0} dari ${limit} penggunaan bulan ini.`,
          data: {
            ctaLabel: plan === "free" ? "Lihat Pro" : "Lihat penggunaan",
            ctaAnchor: plan === "free" ? "#plans" : "#ai-usage",
          },
        });
      } else if (usageState === "limit_reached") {
        toastManager.add({
          id: "ai-usage-limit-reached",
          title: "Kuota AI bulan ini telah habis",
          description: "Fitur AI tambahan tersedia kembali pada awal siklus berikutnya.",
          data: {
            ctaLabel: plan === "free" ? "Lihat Pro" : "Lihat detail",
            ctaAnchor: plan === "free" ? "#plans" : "#ai-usage",
          },
        });
      }
      
      setShownStates((prev) => new Set(prev).add(usageState));
    }
  }, [usageState, shownStates, plan, used, limit, toastManager]);

  return (
    <Toast.Portal container={portalRoot} className="pl-ui-scope">
      {toastManager.toasts.map((toast) => (
        <Toast.Root 
          key={toast.id} 
          toast={toast}
          className="tw:fixed tw:bottom-4 tw:left-4 tw:right-4 tw:md:top-20 tw:md:bottom-auto tw:md:left-auto tw:md:right-4 tw:md:w-96 tw:bg-white tw:border tw:border-slate-200 tw:shadow-lg tw:rounded-xl tw:p-4 tw:z-50 tw:flex tw:flex-col tw:gap-3 tw:outline-none focus-visible:tw:ring-2 focus-visible:tw:ring-slate-400 tw:transition-all data-[state=open]:tw:animate-in data-[state=closed]:tw:animate-out data-[state=closed]:tw:fade-out-0 data-[state=open]:tw:fade-in-0 data-[state=closed]:tw:zoom-out-95 data-[state=open]:tw:zoom-in-95 data-[swipe=move]:tw:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:tw:translate-x-0 data-[swipe=cancel]:tw:transition-[transform_200ms_ease-out] data-[swipe=end]:tw:animate-out data-[swipe=end]:tw:slide-out-to-right-full"
        >
          <div>
            <Toast.Title className="tw:text-sm tw:font-bold tw:text-slate-900 tw:mb-1">
              {toast.title}
            </Toast.Title>
            <Toast.Description className="tw:text-sm tw:text-slate-600">
              {toast.description}
            </Toast.Description>
          </div>
          <div className="tw:flex tw:justify-end tw:gap-3 tw:mt-1">
            <Toast.Close className="tw:px-3 tw:py-1.5 tw:text-xs tw:font-medium tw:text-slate-700 tw:bg-slate-100 tw:rounded hover:tw:bg-slate-200 tw:transition-colors tw:outline-none focus-visible:tw:ring-2 focus-visible:tw:ring-slate-400">
              Tutup
            </Toast.Close>
            {toast.data && (
              <button 
                onClick={() => {
                  toastManager.close(toast.id);
                  const el = document.querySelector(toast.data!.ctaAnchor) as HTMLElement;
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth' });
                    el.focus();
                  }
                }}
                className="tw:px-3 tw:py-1.5 tw:text-xs tw:font-medium tw:text-white tw:bg-slate-900 tw:rounded hover:tw:bg-slate-800 tw:transition-colors tw:outline-none focus-visible:tw:ring-2 focus-visible:tw:ring-slate-400"
              >
                {toast.data.ctaLabel}
              </button>
            )}
          </div>
        </Toast.Root>
      ))}
      <Toast.Viewport className="tw:fixed tw:inset-0 tw:pointer-events-none tw:z-50" />
    </Toast.Portal>
  );
}

export function SubscriptionNotifications({
  usageState,
  plan,
  used,
  limit,
}: {
  usageState: AIUsageState;
  plan: "free" | "pro" | string;
  used: number;
  limit: number | null;
}) {
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalRoot(document.getElementById("pl-ui-portal-root"));
  }, []);

  if (!portalRoot) return null;

  return (
    <Toast.Provider>
      <ToastNotifier 
        usageState={usageState} 
        plan={plan} 
        used={used} 
        limit={limit} 
        portalRoot={portalRoot} 
      />
    </Toast.Provider>
  );
}
