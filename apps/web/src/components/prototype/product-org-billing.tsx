"use client";

import { Buildings, Receipt, ShieldCheck, UsersThree, WarningCircle, Sparkle } from "@phosphor-icons/react";
import { SubscriptionData, deriveAIUsageStatus } from "../../types/domain/subscription";
import "../../styles/product-org-billing.css";

export function ProductOrganizationBilling({ 
  subscription,
  canManageBilling
}: { 
  subscription: SubscriptionData;
  canManageBilling: boolean;
}) {
  if (!subscription || (subscription.plan !== "organization" && subscription.plan !== "enterprise")) {
    return null; // Fallback for invalid state
  }

  const isEnterprise = subscription.plan === "enterprise";
  const org = subscription.organization;
  
  if (!org && !isEnterprise) return null; // Safety check

  const aiStatus = deriveAIUsageStatus(subscription.ai.usage);
  const aiUsed = subscription.ai.usage.used;
  const aiLimit = subscription.ai.usage.limit;
  const isAiUnlimited = aiLimit === null;
  const aiPercentage = isAiUnlimited || !aiLimit ? 0 : Math.min(100, Math.round((aiUsed / aiLimit) * 100));

  const seatsUsed = org?.seatsUsed || 0;
  const seatsLimit = org?.seatsLimit || (isEnterprise ? 1000 : 15);
  const seatsPercentage = isEnterprise ? 0 : Math.min(100, Math.round((seatsUsed / seatsLimit) * 100));
  const isSeatsNearLimit = !isEnterprise && (seatsLimit - seatsUsed <= 2);

  const isPastDue = subscription.status === "past_due" || subscription.paymentStatus === "failed";
  const isCanceledAtPeriodEnd = subscription.status === "canceled" && subscription.cancelAtPeriodEnd;

  const formatDate = (isoStr?: string) => isoStr ? new Date(isoStr).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' }) : "-";

  return (
    <div className="pl-ui-scope pl-org-billing-page tw:min-h-screen tw:bg-slate-50 tw:py-8">
      <div className="tw:max-w-4xl tw:mx-auto tw:px-4 md:tw:px-6">
        
        {/* Prototype Header */}
        <div className="tw:mb-8 tw:pb-6 tw:border-b tw:border-slate-200">
          <p className="tw:text-xs tw:font-bold tw:text-blue-600 tw:uppercase tw:tracking-widest tw:mb-2">Prototype Workspace</p>
          <h1 className="tw:text-2xl tw:font-bold tw:text-slate-900">Billing & Usage Organisasi</h1>
          {!canManageBilling && (
            <div className="tw:mt-3 tw:inline-flex tw:items-center tw:gap-2 tw:bg-amber-50 tw:text-amber-800 tw:px-3 tw:py-1.5 tw:rounded-lg tw:text-sm tw:font-medium">
              <WarningCircle size={18} weight="fill" />
              Tampilan Member: Anda tidak memiliki akses untuk mengelola tagihan.
            </div>
          )}
        </div>

        {/* Canceled Warning */}
        {isCanceledAtPeriodEnd && (
          <div className="tw:bg-amber-50 tw:border tw:border-amber-200 tw:rounded-xl tw:p-4 tw:mb-6 tw:flex tw:items-start tw:gap-3">
            <WarningCircle size={24} className="tw:text-amber-600 tw:shrink-0" weight="fill" />
            <div>
              <h3 className="tw:text-sm tw:font-bold tw:text-amber-900 tw:mb-1">Paket Berhenti di Akhir Periode</h3>
              <p className="tw:text-sm tw:text-amber-800">
                Organisasi Anda telah membatalkan langganan. Akses dan kuota akan tetap tersedia hingga {formatDate(subscription.currentPeriodEnd || subscription.cancelDate)}.
              </p>
            </div>
          </div>
        )}

        {/* Past Due Warning */}
        {isPastDue && (
          <div className="tw:bg-red-50 tw:border tw:border-red-200 tw:rounded-xl tw:p-4 tw:mb-6 tw:flex tw:items-start tw:gap-3">
            <WarningCircle size={24} className="tw:text-red-600 tw:shrink-0" weight="fill" />
            <div>
              <h3 className="tw:text-sm tw:font-bold tw:text-red-900 tw:mb-1">Pembayaran Gagal</h3>
              <p className="tw:text-sm tw:text-red-800">
                Tagihan terakhir organisasi gagal diproses. Segera perbarui metode pembayaran untuk menghindari gangguan akses.
              </p>
              {canManageBilling && (
                <a href="#billing-status" className="tw:inline-block tw:mt-3 tw:text-sm tw:font-semibold tw:text-red-700 tw:bg-red-100 hover:tw:bg-red-200 tw:px-3 tw:py-1.5 tw:rounded-lg tw:transition-colors">
                  Lihat Status Tagihan
                </a>
              )}
            </div>
          </div>
        )}

        <div className="tw:grid md:tw:grid-cols-3 tw:gap-6 tw:mb-8">
          {/* Current Plan Card */}
          <div className="md:tw:col-span-2 tw:bg-white tw:rounded-2xl tw:shadow-sm tw:border tw:border-slate-200 tw:p-6">
            <h2 className="tw:text-sm tw:font-bold tw:text-slate-500 tw:uppercase tw:tracking-widest tw:mb-6">Paket Saat Ini</h2>
            <div className="tw:flex tw:items-center tw:justify-between tw:mb-6">
              <div className="tw:flex tw:items-center tw:gap-4">
                <div className={`tw:p-3 tw:rounded-xl ${isEnterprise ? 'tw:bg-slate-900 tw:text-blue-400' : 'tw:bg-blue-50 tw:text-blue-600'}`}>
                  {isEnterprise ? <ShieldCheck size={32} weight="duotone" /> : <Buildings size={32} weight="duotone" />}
                </div>
                <div>
                  <h3 className="tw:text-xl tw:font-bold tw:text-slate-900">{isEnterprise ? "Enterprise" : "Organization"}</h3>
                  <p className="tw:text-sm tw:text-slate-500">
                    {subscription.billingCycle === "yearly" ? "Ditagih tahunan" : "Ditagih bulanan"}
                  </p>
                </div>
              </div>
              <div className="tw:text-right">
                <span className="tw:inline-flex tw:items-center tw:px-2.5 tw:py-1 tw:rounded-md tw:text-xs tw:font-medium tw:bg-emerald-100 tw:text-emerald-800 tw:mb-1">
                  Active
                </span>
                <p className="tw:text-xs tw:text-slate-500">
                  Pembaruan: {formatDate(subscription.renewalDate)}
                </p>
              </div>
            </div>
            
            {canManageBilling && (
              <div className="tw:pt-6 tw:border-t tw:border-slate-100 tw:flex tw:gap-3">
                <a href="/plans/organization" className="tw:text-sm tw:font-semibold tw:text-blue-600 hover:tw:bg-blue-50 tw:px-4 tw:py-2 tw:rounded-lg tw:transition-colors">
                  Ubah Paket
                </a>
              </div>
            )}
          </div>

          {/* Contact Card */}
          <div className="tw:bg-white tw:rounded-2xl tw:shadow-sm tw:border tw:border-slate-200 tw:p-6">
            <h2 className="tw:text-sm tw:font-bold tw:text-slate-500 tw:uppercase tw:tracking-widest tw:mb-4">Kontak Tagihan</h2>
            <div className="tw:mb-6">
              <p className="tw:text-sm tw:text-slate-500 tw:italic">Tidak ada kontak tagihan utama yang diatur.</p>
            </div>
          </div>
        </div>

        <div className="tw:grid md:tw:grid-cols-2 tw:gap-6 tw:mb-8">
          {/* Seat Usage */}
          <div className="tw:bg-white tw:rounded-2xl tw:shadow-sm tw:border tw:border-slate-200 tw:p-6">
            <div className="tw:flex tw:items-center tw:gap-2 tw:mb-6">
              <UsersThree size={20} className="tw:text-slate-400" />
              <h2 className="tw:text-sm tw:font-bold tw:text-slate-900">Penggunaan Kursi (Seats)</h2>
            </div>
            
            <div className="tw:mb-2 tw:flex tw:justify-between tw:items-end">
              <div>
                <span className="tw:text-3xl tw:font-bold tw:text-slate-900">{seatsUsed}</span>
                <span className="tw:text-sm tw:text-slate-500"> / {isEnterprise ? "∞" : seatsLimit}</span>
              </div>
              {!isEnterprise && isSeatsNearLimit && (
                <span className="tw:text-xs tw:font-medium tw:text-amber-700 tw:bg-amber-100 tw:px-2 tw:py-0.5 tw:rounded">Sisa {seatsLimit - seatsUsed}</span>
              )}
            </div>

            {!isEnterprise && (
              <div 
                className="tw:h-2.5 tw:w-full tw:bg-slate-100 tw:rounded-full tw:overflow-hidden tw:mb-6"
                role="progressbar"
                aria-valuenow={seatsUsed}
                aria-valuemin={0}
                aria-valuemax={seatsLimit}
                aria-label="Penggunaan kursi anggota"
              >
                <div 
                  className={`tw:h-full tw:rounded-full tw:transition-all ${isSeatsNearLimit ? 'tw:bg-amber-500' : 'tw:bg-blue-600'}`}
                  style={{ width: `${seatsPercentage}%` }}
                />
              </div>
            )}
            
            <p className="tw:text-xs tw:text-slate-500 tw:mb-6">
              Anggota yang diundang menempati kursi aktif di workspace ini.
            </p>
          </div>

          {/* AI Usage */}
          <div className="tw:bg-white tw:rounded-2xl tw:shadow-sm tw:border tw:border-slate-200 tw:p-6">
            <div className="tw:flex tw:items-center tw:gap-2 tw:mb-6">
              <Sparkle size={20} className="tw:text-blue-500" weight="duotone" />
              <h2 className="tw:text-sm tw:font-bold tw:text-slate-900">Penggunaan AI Organisasi</h2>
            </div>
            
            <div className="tw:mb-2 tw:flex tw:justify-between tw:items-end">
              <div>
                <span className="tw:text-3xl tw:font-bold tw:text-slate-900">{aiUsed}</span>
                <span className="tw:text-sm tw:text-slate-500"> / {isAiUnlimited ? "∞" : aiLimit}</span>
              </div>
              {aiStatus === "near_limit" && (
                <span className="tw:text-xs tw:font-medium tw:text-amber-700 tw:bg-amber-100 tw:px-2 tw:py-0.5 tw:rounded">Hampir Habis</span>
              )}
              {aiStatus === "limit_reached" && (
                <span className="tw:text-xs tw:font-medium tw:text-red-700 tw:bg-red-100 tw:px-2 tw:py-0.5 tw:rounded">Batas Tercapai</span>
              )}
            </div>

            {!isAiUnlimited && (
              <div 
                className="tw:h-2.5 tw:w-full tw:bg-slate-100 tw:rounded-full tw:overflow-hidden tw:mb-6"
                role="progressbar"
                aria-valuenow={aiUsed}
                aria-valuemin={0}
                aria-valuemax={aiLimit}
                aria-label="Penggunaan AI gabungan"
              >
                <div 
                  className={`tw:h-full tw:rounded-full tw:transition-all ${aiStatus === 'limit_reached' ? 'tw:bg-red-500' : aiStatus === 'near_limit' ? 'tw:bg-amber-500' : 'tw:bg-blue-600'}`}
                  style={{ width: `${aiPercentage}%` }}
                />
              </div>
            )}
            
            <p className="tw:text-xs tw:text-slate-500">
              Direset secara otomatis pada {formatDate(subscription.ai.usage.resetAt)}.
            </p>
          </div>
        </div>

        {/* Invoice History */}
        <div id="billing-status" className="tw:bg-white tw:rounded-2xl tw:shadow-sm tw:border tw:border-slate-200 tw:p-6 tw:scroll-mt-6">
          <div className="tw:flex tw:items-center tw:gap-2 tw:mb-6">
            <Receipt size={20} className="tw:text-slate-400" />
            <h2 className="tw:text-sm tw:font-bold tw:text-slate-900">Riwayat Tagihan</h2>
          </div>
          
          <div className="tw:text-center tw:py-8 tw:border-2 tw:border-dashed tw:border-slate-200 tw:rounded-xl">
            <p className="tw:text-sm tw:text-slate-500">Belum ada riwayat invoice pada prototype ini.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
