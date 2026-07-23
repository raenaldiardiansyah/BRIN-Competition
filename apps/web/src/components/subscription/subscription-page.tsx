"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, Info, WarningCircle, CaretDown } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";
import { tierMatrix, AI_FEATURE_MATRIX } from "@/data/subscription-tiers";
import { SubscriptionData, SubscriptionSessionOverride, AIUsageStatus } from "@/types/domain/subscription";
import { CancelDialog } from "./subscription-controls";
import { SubscriptionNotifications } from "./subscription-notifications";
import Ferrofluid from "@/components/react-bits/Ferrofluid";
import BlurText from "@/components/react-bits/BlurText";
import FadeContent from "@/components/react-bits/FadeContent";
import SpotlightCard from "@/components/react-bits/SpotlightCard";

const SUBSCRIPTION_FERRO_COLORS = ["#315CF6", "#6D4AFF", "#16B8A6"];

type AICapabilityView = "summary" | "comparison";

function AnimatedUsageProgress({
  value,
  status,
}: {
  value: number;
  status: AIUsageStatus;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <div
      className="tw:w-full tw:bg-slate-200 tw:rounded-full tw:h-2.5 tw:mb-2"
      role="progressbar"
      aria-label="Penggunaan kuota AI"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
    >
      <motion.div
        className={`tw:h-2.5 tw:rounded-full ${status === "limit_reached" ? "tw:bg-red-600" : status === "near_limit" ? "tw:bg-amber-500" : "tw:bg-indigo-600"}`}
        initial={{ width: reducedMotion ? `${value}%` : 0 }}
        whileInView={{ width: `${value}%` }}
        viewport={{ once: true, amount: 0.6 }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

function CapabilityStatus({ status }: { status: "available" | "limited" | "locked" }) {
  const label = status === "available" ? "Tersedia" : status === "limited" ? "Terbatas" : "Tidak tersedia";
  const tone = status === "available"
    ? "tw:bg-emerald-50 tw:text-emerald-700 tw:border-emerald-200"
    : status === "limited"
      ? "tw:bg-amber-50 tw:text-amber-700 tw:border-amber-200"
      : "tw:bg-slate-100 tw:text-slate-500 tw:border-slate-200";

  return <span className={`tw:inline-flex tw:items-center tw:justify-center tw:px-3 tw:py-1 tw:rounded-full tw:text-xs tw:font-semibold tw:border ${tone}`}>{label}</span>;
}

export function SubscriptionPage({ 
  subscription, 
  onOverrideChange 
}: { 
  subscription?: SubscriptionData;
  onOverrideChange?: (patch: Partial<SubscriptionSessionOverride>) => void;
}) {
  // Graceful fallback if opened outside prototype demo wiring
  if (!subscription) return null;

  const currentPlan = subscription;
  const currentTier = tierMatrix[currentPlan.plan === "none" ? "free" : currentPlan.plan];
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") === "manage" ? "manage" : "compare";
  const isManageMode = mode === "manage";
  const requestedPlan = searchParams.get("plan");
  const initialSelectedPlan = requestedPlan && requestedPlan in tierMatrix
    ? requestedPlan as keyof typeof tierMatrix
    : "pro";
  
  // Local state for billing cycle pricing display & FAQ dropdown accordion
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [aiView, setAiView] = useState<AICapabilityView>("summary");
  const [selectedPlan, setSelectedPlan] = useState<keyof typeof tierMatrix>(initialSelectedPlan);
  const [selectionMessage, setSelectionMessage] = useState("");
  const selectedTier = tierMatrix[selectedPlan];

  // AI Usage calculations
  const aiUsed = currentPlan.ai.usage.used;
  const aiLimit = currentPlan.ai.usage.limit || 1;
  const aiPercentage = Math.min(100, Math.round((aiUsed / aiLimit) * 100));
  const aiStatus = (currentPlan.ai.usage.statusOverride || (aiUsed >= aiLimit ? "limit_reached" : (aiPercentage >= 80 ? "near_limit" : "normal"))) as AIUsageStatus;

  // 7 Canonical AI Features
  const features = Object.values(AI_FEATURE_MATRIX);
  
  // Status flags
  const isPastDue = currentPlan.status === "past_due";
  const isCanceled = currentPlan.status === "canceled";

  // Actions
  const handlePlanPreview = (plan: keyof typeof tierMatrix) => {
    setSelectedPlan(plan);
    setSelectionMessage("");
    window.history.replaceState(null, "", `/subscription?mode=${mode}&plan=${plan}`);
    requestAnimationFrame(() => document.getElementById("selected-plan-detail")?.focus());
  };

  const handlePlanPreviewKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    plan: keyof typeof tierMatrix,
  ) => {
    if (event.key !== "Enter" && event.key !== " " && event.key !== "Spacebar") return;
    event.preventDefault();
    handlePlanPreview(plan);
  };

  const handleCancelPlan = (reason: string | null) => {
    if (onOverrideChange) {
      onOverrideChange({
        cancelAtPeriodEnd: true,
        cancelReason: reason || undefined,
      });
    }
  };

  const handleAiTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const nextView: AICapabilityView = aiView === "summary" ? "comparison" : "summary";
    setAiView(nextView);
    requestAnimationFrame(() => document.getElementById(`ai-${nextView}-tab`)?.focus());
  };

  return (
    <div className="pl-ui-scope">
      {isManageMode ? (
        <SubscriptionNotifications
          usageState={aiStatus}
          plan={currentPlan.plan}
          used={aiUsed}
          limit={currentPlan.ai.usage.limit}
        />
      ) : null}

      {/* Prototype Notice - subtle */}
      <div className="tw:bg-slate-50 tw:border-b tw:border-slate-200 tw:text-slate-600 tw:px-4 tw:py-2 tw:text-xs tw:text-center tw:font-medium">
        Mode Prototype: Data simulasi. Perubahan paket belum diproses secara nyata pada tahap ini.
      </div>

      {isManageMode && isPastDue && (
        <section id="billing-status" tabIndex={-1} className="tw:bg-red-50 tw:border-b tw:border-red-200 tw:px-4 tw:py-3 tw:flex tw:items-center tw:justify-center tw:gap-2 tw:scroll-mt-20 tw:outline-none focus-visible:tw:ring-2 focus-visible:tw:ring-inset focus-visible:tw:ring-red-400">
          <WarningCircle className="tw:w-5 tw:h-5 tw:text-red-600" weight="fill" />
          <p className="tw:text-sm tw:font-medium tw:text-red-900">
            Pembayaran terakhir Anda gagal. Akses Pro akan ditangguhkan. Tinjau status tagihan pada ringkasan paket atau hubungi dukungan melalui kanal resmi.
          </p>
        </section>
      )}

      <div className="tw:max-w-[1160px] tw:mx-auto tw:px-6 tw:pt-10 tw:pb-2 md:tw:pt-16 md:tw:pb-4">
        
        {/* Hero */}
        <section className="subscription-hero tw:text-center tw:mb-14">
          <div className="subscription-hero__ferrofluid" aria-hidden="true">
            <Ferrofluid
              colors={SUBSCRIPTION_FERRO_COLORS}
              speed={0.3}
              scale={1.55}
              turbulence={0.8}
              fluidity={0.15}
              rimWidth={0.18}
              sharpness={2.3}
              shimmer={0.65}
              glow={1.4}
              flowDirection="down"
              opacity={0.32}
              mouseInteraction
              mouseStrength={0.65}
              mouseRadius={0.3}
              dpr={1.5}
            />
          </div>
          <div className="subscription-hero__overlay" aria-hidden="true" />
          <div className="subscription-hero__content">
            <h1
              aria-label={isManageMode ? "Paket dan penggunaan Anda" : "Pilih paket sesuai kebutuhan inovasi Anda"}
              className="subscription-hero__headline tw:font-extrabold tw:tracking-tight"
            >
              <span className="subscription-hero__line">
                <BlurText text={isManageMode ? "Paket dan" : "Pilih paket sesuai"} animateBy="words" direction="top" delay={80} stepDuration={0.35} className="subscription-hero__word subscription-hero__word--navy" />
              </span>
              <span className="subscription-hero__line subscription-hero__line--accent">
                <BlurText text={isManageMode ? "penggunaan Anda" : "kebutuhan inovasi Anda"} animateBy="words" direction="top" delay={80} stepDuration={0.35} className="subscription-hero__word subscription-hero__word--brand" />
              </span>
            </h1>
            <FadeContent delay={180} duration={460} translateY={14} blur threshold={0.2}>
              <p className="subscription-hero__description tw:text-base md:tw:text-lg tw:max-w-[820px] tw:mx-auto tw:leading-relaxed tw:mt-8">
                {isManageMode
                  ? "Tinjau paket aktif, penggunaan, kuota, dan preview paket lain tanpa mengubah entitlement Anda."
                  : "Bandingkan fitur dan kisaran harga prototype sebelum menentukan paket."}
              </p>
            </FadeContent>
          </div>
        </section>

        {/* Current Plan Card */}
        {isManageMode ? (
        <SpotlightCard className="tw:bg-white tw:rounded-2xl tw:border tw:border-slate-200 tw:p-8 tw:mb-14 tw:shadow-sm">
          <section aria-labelledby="current-plan-title">
          <div className="tw:grid tw:grid-cols-1 md:tw:grid-cols-2 tw:gap-8 tw:items-center">
            {/* Left side: Plan info */}
            <div>
              <div className="tw:flex tw:items-center tw:gap-3 tw:mb-3">
                <p className="tw:text-xs tw:font-bold tw:text-slate-500 tw:uppercase tw:tracking-wider">Paket Saat Ini</p>
                {isCanceled ? (
                  <span className="tw:inline-flex tw:items-center tw:px-2.5 tw:py-0.5 tw:rounded-full tw:text-xs tw:font-bold tw:bg-amber-100 tw:text-amber-800">
                    DIJADWALKAN BERHENTI
                  </span>
                ) : (
                  <span className={`tw:inline-flex tw:items-center tw:px-2.5 tw:py-0.5 tw:rounded-full tw:text-xs tw:font-bold ${isPastDue ? 'tw:bg-red-100 tw:text-red-800' : 'tw:bg-emerald-100 tw:text-emerald-800'}`}>
                    {isPastDue ? 'PAST DUE' : 'AKTIF'}
                  </span>
                )}
              </div>
              <h2 id="current-plan-title" className="tw:text-3xl tw:font-extrabold tw:text-slate-900 tw:mb-2">
                {currentTier.label}
              </h2>
              <p className="tw:text-sm tw:md:text-base tw:text-slate-600">
                {currentPlan.plan === "free" || currentPlan.plan === "none" ? (
                  <>Paket gratis aktif tanpa tanggal perpanjangan.</>
                ) : isCanceled ? (
                  <>Akses Pro Anda tetap aktif sampai <strong className="tw:text-slate-900">{new Date(currentPlan.currentPeriodEnd || currentPlan.renewalDate!).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}</strong>.</>
                ) : (
                  <>Siklus {currentPlan.billingCycle === "monthly" ? "Bulanan" : "Tahunan"}. Perpanjangan pada <strong className="tw:text-slate-900">{new Date(currentPlan.renewalDate!).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}</strong>.</>
                )}
              </p>
            </div>
            
            {/* Right side: AI usage & Action */}
            <div className="tw:flex tw:flex-col tw:gap-4">
              <div className="tw:bg-slate-50 tw:rounded-xl tw:border tw:border-slate-200/90 tw:p-5">
                <div className="tw:flex tw:justify-between tw:items-center tw:mb-2.5">
                  <span className="tw:text-sm tw:font-bold tw:text-slate-900">Kuota AI</span>
                  <span className="tw:text-xs tw:md:text-sm tw:font-semibold tw:text-slate-600">{aiUsed} dari {currentPlan.ai.usage.limit || '∞'} analisis digunakan</span>
                </div>
                <AnimatedUsageProgress value={aiPercentage} status={aiStatus} />
                <p className="tw:text-xs tw:text-slate-600 tw:font-semibold tw:mt-2">
                  {currentPlan.ai.usage.limit === null ? "Kuota tanpa batas" : `${Math.max(0, currentPlan.ai.usage.limit - aiUsed)} analisis tersisa`}
                </p>
                {/* Persistent warnings for AI Usage */}
                {aiStatus === "near_limit" && (
                  <p className="tw:text-xs tw:text-amber-700 tw:font-medium tw:mt-2">
                    Kuota AI hampir habis. Gunakan dengan bijak.
                  </p>
                )}
                {aiStatus === "limit_reached" && (
                  <p className="tw:text-xs tw:text-red-600 tw:font-medium tw:mt-2">
                    Kuota AI bulan ini telah habis. Akan di-reset bulan depan.
                  </p>
                )}
              </div>
              
              <div className="tw:flex tw:justify-end">
                {currentPlan.plan === "pro" && !isCanceled && !isPastDue && (
                  <CancelDialog 
                    trigger={
                      <button className="tw:w-full md:tw:w-auto tw:bg-white tw:text-slate-700 tw:border tw:border-slate-300 tw:text-sm tw:font-semibold tw:min-h-[44px] tw:px-6 tw:rounded-xl tw:inline-flex tw:items-center tw:justify-center tw:transition-colors hover:tw:bg-slate-50 tw:outline-none focus-visible:tw:ring-2 focus-visible:tw:ring-slate-400">
                        Batalkan Paket
                      </button>
                    }
                    onConfirm={handleCancelPlan}
                    currentPeriodEnd={currentPlan.currentPeriodEnd || currentPlan.renewalDate}
                  />
                )}
                {currentPlan.plan === "pro" && isCanceled && (
                  <button className="tw:w-full md:tw:w-auto tw:bg-slate-100 tw:text-slate-500 tw:border tw:border-slate-200 tw:text-sm tw:font-semibold tw:min-h-[44px] tw:px-6 tw:rounded-xl tw:inline-flex tw:items-center tw:justify-center tw:cursor-not-allowed">
                    Paket telah dibatalkan
                  </button>
                )}
              </div>
            </div>
          </div>
          </section>
        </SpotlightCard>
        ) : null}

        {/* Pricing Cards */}
        <section id="plans" tabIndex={-1} className="tw:mb-16 tw:scroll-mt-20 tw:outline-none focus-visible:tw:ring-2 focus-visible:tw:ring-slate-400 focus-visible:tw:rounded-2xl">
          <div className="tw:text-center tw:mb-8">
            <h2 className="tw:text-2xl tw:font-bold tw:text-slate-900">Pilih paket untuk melihat detail</h2>
            <p className="tw:text-sm tw:text-slate-600 tw:mt-2">
              {isManageMode
                ? `Pilihan ini hanya mengubah preview. Paket aktif Anda tetap ${currentTier.label}.`
                : "Pilih paket untuk memperbarui detail preview. Tidak ada paket aktif atau transaksi yang dibuat."}
            </p>
          </div>

          <div className="subscription-pricing-cards-grid tw:grid tw:grid-cols-1 md:tw:grid-cols-2 xl:tw:grid-cols-3 tw:items-stretch tw:gap-6 lg:tw:gap-8">
            {(["free", "pro", "organization"] as const).map((planId) => {
              const tier = tierMatrix[planId];
              const active = isManageMode && currentPlan.plan === planId;
              const selected = selectedPlan === planId;
              return (
                <button
                  key={planId}
                  type="button"
                  onClick={() => handlePlanPreview(planId)}
                  onKeyDown={(event) => handlePlanPreviewKeyDown(event, planId)}
                  aria-pressed={selected}
                  className={`tw:min-w-[280px] tw:w-full tw:rounded-2xl tw:border tw:p-7 tw:shadow-sm tw:flex tw:flex-col tw:text-left tw:transition-colors tw:outline-none focus-visible:tw:ring-2 focus-visible:tw:ring-indigo-500 ${
                    selected
                      ? "tw:bg-indigo-50/40 tw:border-indigo-600 tw:ring-2 tw:ring-indigo-100"
                      : "tw:bg-white tw:border-slate-200 hover:tw:border-indigo-300"
                  }`}
                >
                  <div className="tw:flex tw:flex-wrap tw:items-center tw:gap-2 tw:mb-4">
                    {active ? <span className="tw:bg-slate-900 tw:text-white tw:px-3 tw:py-1 tw:rounded-full tw:text-xs tw:font-bold tw:uppercase">Paket aktif</span> : null}
                    {planId === "pro" ? <span className="tw:bg-indigo-100 tw:text-indigo-700 tw:px-3 tw:py-1 tw:rounded-full tw:text-xs tw:font-bold tw:uppercase">Direkomendasikan</span> : null}
                    {selected && !active ? <span className="tw:bg-white tw:text-indigo-700 tw:border tw:border-indigo-200 tw:px-3 tw:py-1 tw:rounded-full tw:text-xs tw:font-bold tw:uppercase">Preview terpilih</span> : null}
                  </div>
                  <h3 className="tw:text-2xl tw:font-bold tw:text-slate-900 tw:leading-tight">{tier.label}</h3>
                  <p className="tw:text-sm tw:text-slate-600 tw:mt-3 tw:mb-5 tw:min-h-[42px]">{tier.audience}</p>
                  <div className="tw:mb-6 tw:pb-5 tw:border-b tw:border-slate-100">
                    <strong className="tw:block tw:text-2xl tw:leading-tight tw:text-slate-900">{tier.pricing.display}</strong>
                    <span className="tw:inline-flex tw:mt-2 tw:px-2.5 tw:py-1 tw:rounded-full tw:bg-amber-50 tw:text-amber-800 tw:text-xs tw:font-semibold">{tier.pricing.label}</span>
                  </div>
                  <ul className="tw:space-y-3 tw:mb-7 tw:flex-grow">
                    {tier.features.slice(0, 4).map((feature) => (
                      <li key={feature} className="tw:flex tw:items-start tw:gap-2.5 tw:text-sm tw:text-slate-700">
                        <Check className="tw:w-5 tw:h-5 tw:text-indigo-600 tw:shrink-0" weight="bold" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <span className={`tw:w-full tw:min-h-[46px] tw:px-5 tw:rounded-xl tw:inline-flex tw:items-center tw:justify-center tw:text-sm tw:font-semibold ${
                    selected ? "tw:bg-indigo-600 tw:text-white" : "tw:bg-white tw:text-slate-900 tw:border tw:border-slate-300"
                  }`}>
                    {selected ? `Sedang melihat ${tier.label}` : `Lihat detail ${tier.label}`}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => handlePlanPreview("enterprise")}
            onKeyDown={(event) => handlePlanPreviewKeyDown(event, "enterprise")}
            aria-pressed={selectedPlan === "enterprise"}
            className={`tw:w-full tw:mt-8 tw:rounded-2xl tw:border tw:p-7 md:tw:p-8 tw:text-left tw:grid md:tw:grid-cols-[1.3fr_1fr_auto] tw:gap-6 tw:items-center tw:outline-none focus-visible:tw:ring-2 focus-visible:tw:ring-indigo-500 ${
              selectedPlan === "enterprise" ? "tw:bg-slate-900 tw:text-white tw:border-slate-900 tw:ring-2 tw:ring-slate-300" : "tw:bg-slate-50 tw:border-slate-200 hover:tw:border-slate-400"
            }`}
          >
            <div>
              <span className="tw:text-xs tw:font-bold tw:uppercase tw:tracking-wider tw:text-indigo-500">Institutional roadmap</span>
              <h3 className={`tw:text-2xl tw:font-bold tw:mt-2 ${selectedPlan === "enterprise" ? "tw:text-white" : "tw:text-slate-900"}`}>Enterprise / Custom</h3>
              <p className={`tw:text-sm tw:mt-2 ${selectedPlan === "enterprise" ? "tw:text-slate-300" : "tw:text-slate-600"}`}>{tierMatrix.enterprise.audience}</p>
            </div>
            <div>
              <strong className={`tw:block tw:text-xl tw:leading-snug ${selectedPlan === "enterprise" ? "tw:text-white" : "tw:text-slate-900"}`}>{tierMatrix.enterprise.pricing.display}</strong>
              <span className="tw:inline-flex tw:mt-2 tw:px-2.5 tw:py-1 tw:rounded-full tw:bg-amber-50 tw:text-amber-800 tw:text-xs tw:font-semibold">{tierMatrix.enterprise.pricing.label}</span>
              <p className={`tw:text-sm tw:mt-3 ${selectedPlan === "enterprise" ? "tw:text-slate-300" : "tw:text-slate-600"}`}>SSO dan API · integration · custom policy · full audit · private ecosystem · SLA</p>
            </div>
            <span className={`tw:min-h-[46px] tw:px-5 tw:rounded-xl tw:inline-flex tw:items-center tw:justify-center tw:text-sm tw:font-semibold tw:whitespace-nowrap ${
              selectedPlan === "enterprise" ? "tw:bg-white tw:text-slate-900" : "tw:bg-slate-900 tw:text-white"
            }`}>
              {selectedPlan === "enterprise" ? "Sedang melihat Enterprise" : "Lihat preview Enterprise"}
            </span>
          </button>

          <section
            id="selected-plan-detail"
            tabIndex={-1}
            aria-labelledby="selected-plan-title"
            className="tw:mt-8 tw:bg-white tw:border tw:border-slate-200 tw:rounded-2xl tw:p-7 md:tw:p-9 tw:shadow-sm tw:outline-none focus-visible:tw:ring-2 focus-visible:tw:ring-indigo-500"
          >
            <div className="tw:grid lg:tw:grid-cols-[1fr_1.1fr] tw:gap-8">
              <div>
                <p className="tw:text-xs tw:font-bold tw:text-indigo-600 tw:uppercase tw:tracking-wider">Detail preview paket</p>
                <h3 id="selected-plan-title" className="tw:text-3xl tw:font-extrabold tw:text-slate-900 tw:mt-2">{selectedTier.label}</h3>
                <p className="tw:text-base tw:text-slate-600 tw:mt-3 tw:leading-relaxed">{selectedTier.audience}</p>
                <p className="tw:text-base tw:text-slate-700 tw:mt-4 tw:font-medium">{selectedTier.tagline}</p>
                <strong className="tw:block tw:text-2xl tw:text-slate-900 tw:mt-6">{selectedTier.pricing.display}</strong>
                <span className="tw:inline-flex tw:mt-2 tw:px-2.5 tw:py-1 tw:rounded-full tw:bg-amber-50 tw:text-amber-800 tw:text-xs tw:font-semibold">{selectedTier.pricing.label}</span>
                <div className="tw:mt-6 tw:p-4 tw:rounded-xl tw:bg-slate-50 tw:border tw:border-slate-200">
                  <strong className="tw:text-sm tw:text-slate-900">{isManageMode ? "Dibandingkan paket aktif" : "Preview paket netral"}</strong>
                  <p className="tw:text-sm tw:text-slate-600 tw:mt-1">
                    {isManageMode
                      ? `Paket aktif tetap ${currentTier.label}. Preview ${selectedTier.label} tidak mengubah entitlement atau memproses pembayaran.`
                      : `Anda sedang melihat ${selectedTier.label}. Compare mode tidak membaca atau mengaktifkan entitlement pengguna.`}
                  </p>
                </div>
              </div>
              <div>
                <h4 className="tw:text-lg tw:font-bold tw:text-slate-900">Capability lengkap</h4>
                <ul className="tw:grid sm:tw:grid-cols-2 tw:gap-3 tw:mt-4">
                  {selectedTier.capabilities.map((capability) => (
                    <li key={capability} className="tw:flex tw:items-start tw:gap-2.5 tw:text-sm tw:text-slate-700">
                      <Check className="tw:w-5 tw:h-5 tw:text-indigo-600 tw:shrink-0" weight="bold" />
                      <span>{capability}</span>
                    </li>
                  ))}
                </ul>
                <div className="tw:mt-6 tw:border-t tw:border-slate-200 tw:pt-5">
                  <strong className="tw:text-sm tw:text-slate-900">Batasan</strong>
                  <ul className="tw:mt-2 tw:space-y-2 tw:text-sm tw:text-slate-600">
                    {(selectedTier.limitations.length ? selectedTier.limitations : ["Pilihan ini merupakan simulasi prototype dan tidak memproses transaksi."]).map((limitation) => <li key={limitation}>{limitation}</li>)}
                  </ul>
                </div>
                <div className="tw:flex tw:flex-col sm:tw:flex-row tw:gap-3 tw:mt-7">
                  <button
                    type="button"
                    className="button primary tw:justify-center"
                    onClick={() => setSelectionMessage(
                      isManageMode
                        ? `Pilihan ${selectedTier.label} disimpan sebagai simulasi preview. Paket aktif tetap ${currentTier.label}.`
                        : `Pilihan ${selectedTier.label} disimpan sebagai simulasi preview. Tidak ada entitlement atau pembayaran yang diaktifkan.`
                    )}
                  >
                    {selectedPlan === "organization" ? "Simulasikan pilihan Organization" : `Simulasikan pilihan ${selectedTier.label}`}
                  </button>
                  {selectedPlan !== "pro" ? (
                    <button type="button" className="button secondary tw:justify-center" onClick={() => handlePlanPreview("pro")}>
                      Bandingkan dengan Pro
                    </button>
                  ) : null}
                </div>
                {selectionMessage ? <p className="tw:mt-4 tw:text-sm tw:font-medium tw:text-emerald-700" role="status">{selectionMessage}</p> : null}
              </div>
            </div>
          </section>
        </section>

        {/* AI Capabilities Preview */}
        <section id="ai-usage" tabIndex={-1} className="tw:mb-16 tw:scroll-mt-20 tw:outline-none focus-visible:tw:ring-2 focus-visible:tw:ring-slate-400 focus-visible:tw:rounded-2xl">
          <div className="tw:text-center tw:mb-8">
            <h2 className="tw:text-2xl md:tw:text-3xl tw:font-bold tw:text-slate-900 tw:mb-3">Kemampuan AI TautIn</h2>
            <p className="tw:text-base tw:text-slate-600 tw:max-w-2xl tw:mx-auto">Alat cerdas untuk menganalisis kandidat, merangkum dokumen, dan merekomendasikan peran kolaborasi terbaik.</p>
          </div>

          <div className="subscription-ai-tabs" role="tablist" aria-label="Tampilan kemampuan AI">
            <button
              id="ai-summary-tab"
              type="button"
              role="tab"
              aria-selected={aiView === "summary"}
              aria-controls="ai-summary-panel"
              tabIndex={aiView === "summary" ? 0 : -1}
              onClick={() => setAiView("summary")}
              onKeyDown={handleAiTabKeyDown}
              className={aiView === "summary" ? "active" : ""}
            >
              Ringkasan
            </button>
            <button
              id="ai-comparison-tab"
              type="button"
              role="tab"
              aria-selected={aiView === "comparison"}
              aria-controls="ai-comparison-panel"
              tabIndex={aiView === "comparison" ? 0 : -1}
              onClick={() => setAiView("comparison")}
              onKeyDown={handleAiTabKeyDown}
              className={aiView === "comparison" ? "active" : ""}
            >
              Perbandingan Lengkap
            </button>
          </div>

          {aiView === "summary" ? (
            <div id="ai-summary-panel" role="tabpanel" aria-labelledby="ai-summary-tab" className="subscription-ai-summary-grid">
              {features.slice(0, 3).map((feature, index) => (
                <FadeContent key={feature.name} delay={index * 70} duration={420} translateY={14} blur={false} threshold={0.15}>
                  <article className="subscription-ai-summary-card">
                    <div className="tw:flex tw:items-start tw:justify-between tw:gap-3 tw:mb-4">
                      <span className="subscription-ai-summary-card__index">0{index + 1}</span>
                      <CapabilityStatus status={feature.access.pro} />
                    </div>
                    <h3 className="tw:text-lg tw:font-bold tw:text-slate-900 tw:mb-2">{feature.name}</h3>
                    <p className="tw:text-sm tw:text-slate-600 tw:leading-relaxed tw:m-0">{feature.description}</p>
                  </article>
                </FadeContent>
              ))}
            </div>
          ) : (
          <div id="ai-comparison-panel" role="tabpanel" aria-labelledby="ai-comparison-tab" className="tw:rounded-2xl tw:border tw:border-slate-200 tw:bg-white tw:overflow-hidden tw:shadow-sm">
            {/* Desktop / 1024 Table (Semantic HTML Table: 58% Fitur | 21% Free | 21% Pro) */}
            <table className="subscription-ai-comparison-table tw:w-full tw:text-left tw:border-collapse">
              <thead>
                <tr className="tw:bg-slate-50 tw:border-b tw:border-slate-200">
                  <th scope="col" className="tw:py-3.5 tw:px-6 tw:text-xs tw:font-bold tw:text-slate-500 tw:uppercase tw:tracking-wider tw:w-[58%]">Fitur AI</th>
                  <th scope="col" className="tw:py-3.5 tw:px-4 tw:text-xs tw:font-bold tw:text-slate-900 tw:uppercase tw:tracking-wider tw:text-center tw:w-[21%]">Free Core</th>
                  <th scope="col" className="tw:py-3.5 tw:px-4 tw:text-xs tw:font-bold tw:text-indigo-600 tw:uppercase tw:tracking-wider tw:text-center tw:w-[21%]">Pro Individual</th>
                </tr>
              </thead>
              <tbody className="tw:divide-y tw:divide-slate-200">
                {features.map((feature) => (
                  <tr key={feature.name} className="hover:tw:bg-slate-50/50 tw:transition-colors">
                    <td className="tw:py-4 tw:px-6 tw:align-middle">
                      <div className="tw:flex tw:items-center tw:gap-2 tw:mb-1">
                        <span className="tw:text-base tw:font-bold tw:text-slate-900">{feature.name}</span>
                        <span className="tw:inline-flex" title={feature.description} aria-label={feature.description}>
                          <Info className="tw:w-4 tw:h-4 tw:text-slate-400 hover:tw:text-slate-600 tw:transition-colors" />
                        </span>
                      </div>
                      <p className="tw:text-sm tw:text-slate-600 tw:leading-relaxed tw:m-0">{feature.description}</p>
                    </td>
                    <td className="tw:py-4 tw:px-4 tw:text-center tw:align-middle">
                      {feature.access.free === "available" ? (
                        <span className="tw:inline-flex tw:items-center tw:justify-center tw:px-3 tw:py-1 tw:rounded-full tw:text-xs tw:font-semibold tw:bg-emerald-50 tw:text-emerald-700 tw:border tw:border-emerald-200">Tersedia</span>
                      ) : feature.access.free === "limited" ? (
                        <span className="tw:inline-flex tw:items-center tw:justify-center tw:px-3 tw:py-1 tw:rounded-full tw:text-xs tw:font-semibold tw:bg-amber-50 tw:text-amber-700 tw:border tw:border-amber-200">Terbatas</span>
                      ) : (
                        <span className="tw:inline-flex tw:items-center tw:justify-center tw:px-3 tw:py-1 tw:rounded-full tw:text-xs tw:font-semibold tw:bg-slate-100 tw:text-slate-400 tw:border tw:border-slate-200">Tidak tersedia</span>
                      )}
                    </td>
                    <td className="tw:py-4 tw:px-4 tw:text-center tw:align-middle">
                      {feature.access.pro === "available" ? (
                        <span className="tw:inline-flex tw:items-center tw:justify-center tw:px-3 tw:py-1 tw:rounded-full tw:text-xs tw:font-semibold tw:bg-emerald-50 tw:text-emerald-700 tw:border tw:border-emerald-200">Tersedia</span>
                      ) : (
                        <span className="tw:inline-flex tw:items-center tw:justify-center tw:px-3 tw:py-1 tw:rounded-full tw:text-xs tw:font-semibold tw:bg-amber-50 tw:text-amber-700 tw:border tw:border-amber-200">Terbatas</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile Cards (Only visible on screens < 768px) */}
            <div className="subscription-ai-mobile-cards tw:flex tw:flex-col tw:divide-y tw:divide-slate-200">
              {features.map((feature) => (
                <div key={feature.name} className="tw:p-5 tw:space-y-3">
                  <div>
                    <div className="tw:flex tw:items-center tw:gap-2 tw:mb-1">
                      <span className="tw:text-base tw:font-bold tw:text-slate-900">{feature.name}</span>
                      <Info className="tw:w-4 tw:h-4 tw:text-slate-400" />
                    </div>
                    <p className="tw:text-xs tw:text-slate-600 tw:leading-relaxed">{feature.description}</p>
                  </div>
                  <div className="tw:grid tw:grid-cols-2 tw:gap-3 tw:pt-1">
                    <div>
                      <span className="tw:text-xs tw:text-slate-500 tw:block tw:mb-1 tw:font-medium">Free Core</span>
                      {feature.access.free === "available" ? (
                        <span className="tw:inline-flex tw:items-center tw:px-3 tw:py-1 tw:rounded-full tw:text-xs tw:font-semibold tw:bg-emerald-50 tw:text-emerald-700 tw:border tw:border-emerald-200">Tersedia</span>
                      ) : feature.access.free === "limited" ? (
                        <span className="tw:inline-flex tw:items-center tw:px-3 tw:py-1 tw:rounded-full tw:text-xs tw:font-semibold tw:bg-amber-50 tw:text-amber-700 tw:border tw:border-amber-200">Terbatas</span>
                      ) : (
                        <span className="tw:inline-flex tw:items-center tw:px-3 tw:py-1 tw:rounded-full tw:text-xs tw:font-semibold tw:bg-slate-100 tw:text-slate-400 tw:border tw:border-slate-200">Tidak tersedia</span>
                      )}
                    </div>
                    <div>
                      <span className="tw:text-xs tw:text-slate-500 tw:block tw:mb-1 tw:font-medium">Pro Individual</span>
                      {feature.access.pro === "available" ? (
                        <span className="tw:inline-flex tw:items-center tw:px-3 tw:py-1 tw:rounded-full tw:text-xs tw:font-semibold tw:bg-emerald-50 tw:text-emerald-700 tw:border tw:border-emerald-200">Tersedia</span>
                      ) : (
                        <span className="tw:inline-flex tw:items-center tw:px-3 tw:py-1 tw:rounded-full tw:text-xs tw:font-semibold tw:bg-amber-50 tw:text-amber-700 tw:border tw:border-amber-200">Terbatas</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}
        </section>

        {/* FAQ (Centered 920px container with Dropdown Accordion) */}
        <section className="tw:mb-0 tw:max-w-[920px] tw:mx-auto">
          <h2 className="tw:text-2xl md:tw:text-3xl tw:font-bold tw:text-slate-900 tw:mb-8 tw:text-center">Pertanyaan Umum</h2>
          <div className="tw:space-y-3">
            {[
              {
                q: "Apa perbedaan utama Free Core dan Pro?",
                a: "Free Core memberikan akses selamanya ke fungsi jaringan, pencarian, dan kolaborasi dasar. Pro ditujukan bagi profesional yang butuh analitik mendalam, penyimpanan riwayat yang lebih panjang, serta batas penggunaan kueri AI yang jauh lebih besar."
              },
              {
                q: "Apakah paket berbayar meningkatkan ranking profil saya?",
                a: "Tidak. Pembayaran sama sekali tidak memengaruhi kredibilitas, verifikasi, atau ranking visibilitas Anda di platform kami. Sistem matching beroperasi secara objektif murni berdasarkan bukti (evidence) portofolio Anda."
              },
              {
                q: "Bagaimana sistem kuota AI bekerja?",
                a: "Batas penggunaan AI (seperti ekstraksi dokumen PDF dan analisis kecocokan profil) dihitung dan direfresh setiap awal siklus bulan. Penggunaan yang gagal karena kesalahan sistem internal kami tidak akan mengurangi kuota Anda."
              },
              {
                q: "Apakah ada pembayaran nyata yang ditagihkan?",
                a: "Tidak. Saat ini platform dalam tahap simulasi purwarupa (Prototype Phase). Semua transisi pembayaran yang ditampilkan di tahap ini adalah simulasi antarmuka saja tanpa ada integrasi payment gateway."
              }
            ].map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="tw:border tw:border-slate-200 tw:rounded-xl tw:bg-white tw:overflow-hidden tw:transition-all"
                >
                  <button
                    id={`subscription-faq-trigger-${idx}`}
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="subscription-faq-trigger tw:w-full tw:flex tw:items-center tw:justify-between tw:p-5 tw:text-left tw:font-semibold tw:text-slate-900 hover:tw:bg-slate-50 tw:transition-colors tw:outline-none focus-visible:tw:ring-2 focus-visible:tw:ring-inset focus-visible:tw:ring-indigo-500"
                    aria-expanded={isOpen}
                    aria-controls={`subscription-faq-panel-${idx}`}
                  >
                    <span className="tw:text-base md:tw:text-lg">{item.q}</span>
                    <CaretDown
                      className={`tw:w-5 tw:h-5 tw:text-slate-500 tw:shrink-0 tw:transition-transform tw:duration-200 ${isOpen ? 'tw:rotate-180 tw:text-indigo-600' : ''}`}
                    />
                  </button>
                  <div
                    id={`subscription-faq-panel-${idx}`}
                    role="region"
                    aria-labelledby={`subscription-faq-trigger-${idx}`}
                    aria-hidden={!isOpen}
                    className={`subscription-faq-panel ${isOpen ? "open" : ""}`}
                  >
                    <div>
                      <p className="tw:px-5 tw:pb-5 tw:pt-4 tw:text-base tw:text-slate-600 tw:leading-relaxed tw:border-t tw:border-slate-100 tw:m-0">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
