import React from "react";
import { Check, Info, X, Buildings } from "@phosphor-icons/react";
import { tierMatrix, AI_FEATURE_MATRIX } from "@/data/subscription-tiers";
import { returningUserSubscription } from "@/dummy/subscription-fixtures";

export function SubscriptionPage() {
  const currentPlan = returningUserSubscription;
  const currentTier = tierMatrix[currentPlan.plan === "none" ? "free" : currentPlan.plan];
  const isMonthly = currentPlan.billingCycle === "monthly";

  // AI Usage calculations
  const aiUsed = currentPlan.ai.usage.used;
  const aiLimit = currentPlan.ai.usage.limit || 1;
  const aiPercentage = Math.min(100, Math.round((aiUsed / aiLimit) * 100));

  // 7 Canonical AI Features
  const features = Object.values(AI_FEATURE_MATRIX);

  return (
    <div className="pl-ui-scope">
      {/* Prototype Notice - subtle */}
      <div className="tw:bg-slate-50 tw:border-b tw:border-slate-200 tw:text-slate-600 tw:px-4 tw:py-2 tw:text-xs tw:text-center tw:font-medium">
        Mode Prototype: Data simulasi. Perubahan paket belum diproses secara nyata pada tahap ini.
      </div>

      <div className="tw:max-w-5xl tw:mx-auto tw:px-4 tw:py-8 tw:md:py-12">
        
        {/* Hero */}
        <section className="tw:text-center tw:mb-12">
          <h1 className="tw:text-4xl tw:md:text-5xl tw:font-bold tw:text-slate-900 tw:mb-3 tw:leading-tight">
            Tingkatkan Kapasitas Kolaborasi
          </h1>
          <p className="tw:text-sm tw:md:text-base tw:text-slate-600 tw:max-w-2xl tw:mx-auto tw:leading-relaxed">
            Free Core tetap gratis selamanya. Paket Pro memberikan analitik mendalam dan kuota AI ekstra.
            Status berlangganan tidak memengaruhi kredibilitas atau ranking profil Anda.
          </p>
        </section>

        {/* Current Plan Card */}
        <section className="tw:bg-white tw:rounded-xl tw:border tw:border-slate-200 tw:p-6 tw:mb-12 tw:shadow-sm">
          <div className="tw:flex tw:flex-col tw:md:flex-row tw:md:items-center tw:justify-between tw:gap-8">
            {/* Left side: Plan info */}
            <div className="tw:flex-1">
              <div className="tw:flex tw:items-center tw:gap-3 tw:mb-2">
                <p className="tw:text-sm tw:font-semibold tw:text-slate-500 tw:uppercase tw:tracking-wider">Paket Saat Ini</p>
                <span className="tw:inline-flex tw:items-center tw:px-2 tw:py-0.5 tw:rounded tw:text-xs tw:font-bold tw:bg-green-100 tw:text-green-800">
                  AKTIF
                </span>
              </div>
              <h2 className="tw:text-2xl tw:font-bold tw:text-slate-900 tw:mb-1">
                {currentTier.label}
              </h2>
              <p className="tw:text-sm tw:text-slate-600">
                Siklus {isMonthly ? "Bulanan" : "Tahunan"}. Perpanjangan pada {new Date(currentPlan.renewalDate!).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}.
              </p>
            </div>
            
            {/* Right side: AI usage & Action */}
            <div className="tw:flex-1 tw:flex tw:flex-col tw:gap-4">
              <div className="tw:bg-slate-50 tw:rounded-lg tw:border tw:border-slate-200 tw:p-4">
                <div className="tw:flex tw:justify-between tw:items-center tw:mb-2">
                  <span className="tw:text-sm tw:font-semibold tw:text-slate-900">Kuota AI</span>
                  <span className="tw:text-sm tw:font-medium tw:text-slate-600">{aiUsed} dari {aiLimit} ({aiPercentage}%)</span>
                </div>
                <div className="tw:w-full tw:bg-slate-200 tw:rounded-full tw:h-2">
                  <div 
                    className="tw:bg-slate-900 tw:h-2 tw:rounded-full" 
                    style={{ width: `${aiPercentage}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="tw:flex tw:flex-col tw:gap-2">
                <button 
                  disabled 
                  className="tw:w-full tw:md:w-auto tw:bg-slate-100 tw:text-slate-500 tw:border tw:border-slate-200 tw:text-sm tw:font-semibold tw:min-h-[44px] tw:px-6 tw:rounded-lg tw:inline-flex tw:items-center tw:justify-center tw:cursor-not-allowed"
                >
                  Kelola paket
                </button>
                <p className="tw:text-xs tw:text-slate-500 tw:text-center tw:md:text-left">
                  Simulasi pengelolaan tersedia pada Phase 3B.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="tw:mb-16">
          <div className="tw:grid tw:md:grid-cols-2 tw:gap-6 tw:max-w-4xl tw:mx-auto">
            
            {/* Free Core */}
            <div className="tw:bg-white tw:rounded-xl tw:border tw:border-slate-200 tw:p-6 tw:shadow-sm tw:flex tw:flex-col">
              <h3 className="tw:text-xl tw:font-bold tw:text-slate-900">{tierMatrix.free.label}</h3>
              <p className="tw:text-sm tw:text-slate-600 tw:mt-1 tw:mb-4 tw:min-h-[40px]">{tierMatrix.free.tagline}</p>
              
              <div className="tw:mb-6">
                <span className="tw:text-3xl tw:font-bold tw:text-slate-900">Rp0</span>
                <span className="tw:text-sm tw:text-slate-500">/bulan</span>
                <p className="tw:text-xs tw:text-slate-500 tw:mt-1">{tierMatrix.free.pricing.label}</p>
              </div>
              
              <ul className="tw:space-y-3 tw:mb-6 tw:flex-grow">
                {tierMatrix.free.features.map(f => (
                  <li key={f} className="tw:flex tw:items-start tw:gap-2 tw:text-sm tw:text-slate-700">
                    <Check className="tw:w-4 tw:h-4 tw:text-slate-900 tw:shrink-0 tw:mt-0.5" weight="bold" />
                    <span>{f}</span>
                  </li>
                ))}
                {tierMatrix.free.limitations.map(l => (
                  <li key={l} className="tw:flex tw:items-start tw:gap-2 tw:text-sm tw:text-slate-500">
                    <X className="tw:w-4 tw:h-4 tw:text-slate-400 tw:shrink-0 tw:mt-0.5" weight="bold" />
                    <span>{l}</span>
                  </li>
                ))}
              </ul>
              
              <div className="tw:flex tw:flex-col tw:gap-2">
                <button disabled className="tw:w-full tw:bg-slate-100 tw:text-slate-500 tw:border tw:border-slate-200 tw:text-sm tw:font-semibold tw:min-h-[44px] tw:px-4 tw:rounded-lg tw:inline-flex tw:items-center tw:justify-center tw:cursor-not-allowed">
                  {tierMatrix.free.ctaLabel}
                </button>
                <p className="tw:text-xs tw:text-slate-500 tw:text-center">Simulasi Phase 3B</p>
              </div>
            </div>

            {/* Pro Individual */}
            <div className="tw:bg-slate-50 tw:rounded-xl tw:border-2 tw:border-slate-900 tw:p-6 tw:shadow-md tw:flex tw:flex-col tw:relative">
              <div className="tw:absolute tw:-top-3 tw:left-6 tw:bg-slate-900 tw:text-white tw:px-3 tw:py-1 tw:rounded-md tw:text-xs tw:font-bold tw:uppercase tw:tracking-wider">
                Paket Anda
              </div>
              <h3 className="tw:text-xl tw:font-bold tw:text-slate-900">{tierMatrix.pro.label}</h3>
              <p className="tw:text-sm tw:text-slate-600 tw:mt-1 tw:mb-4 tw:min-h-[40px]">{tierMatrix.pro.tagline}</p>
              
              <div className="tw:mb-6">
                <span className="tw:text-3xl tw:font-bold tw:text-slate-900">Rp99.000</span>
                <span className="tw:text-sm tw:text-slate-500">/bulan</span>
                <p className="tw:text-xs tw:text-slate-500 tw:mt-1">{tierMatrix.pro.pricing.label}</p>
              </div>
              
              <ul className="tw:space-y-3 tw:mb-6 tw:flex-grow">
                {tierMatrix.pro.features.map(f => (
                  <li key={f} className="tw:flex tw:items-start tw:gap-2 tw:text-sm tw:text-slate-800">
                    <Check className="tw:w-4 tw:h-4 tw:text-slate-900 tw:shrink-0 tw:mt-0.5" weight="bold" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              
              <div className="tw:flex tw:flex-col tw:gap-2">
                <button disabled className="tw:w-full tw:bg-slate-100 tw:text-slate-500 tw:border tw:border-slate-200 tw:text-sm tw:font-semibold tw:min-h-[44px] tw:px-4 tw:rounded-lg tw:inline-flex tw:items-center tw:justify-center tw:cursor-not-allowed">
                  {tierMatrix.pro.ctaLabel}
                </button>
                <p className="tw:text-xs tw:text-slate-500 tw:text-center">Simulasi Phase 3B</p>
              </div>
            </div>

          </div>
        </section>

        {/* AI Capabilities Preview */}
        <section className="tw:mb-16">
          <div className="tw:text-center tw:mb-8">
            <h2 className="tw:text-2xl tw:font-bold tw:text-slate-900 tw:mb-2">Kemampuan AI ProjectLink</h2>
            <p className="tw:text-sm tw:text-slate-600 tw:max-w-2xl tw:mx-auto">Alat cerdas untuk menganalisis kandidat, merangkum dokumen, dan merekomendasikan peran kolaborasi terbaik.</p>
          </div>
          
          <div className="tw:rounded-xl tw:border tw:border-slate-200 tw:bg-white tw:overflow-hidden">
            {/* Desktop Table Header */}
            <div className="tw:hidden tw:md:grid tw:grid-cols-5 tw:bg-slate-50 tw:border-b tw:border-slate-200 tw:p-4">
              <div className="tw:col-span-3 tw:text-xs tw:font-semibold tw:text-slate-500 tw:uppercase tw:tracking-wider">Fitur AI</div>
              <div className="tw:col-span-1 tw:text-xs tw:font-semibold tw:text-slate-900 tw:uppercase tw:tracking-wider tw:text-center">Free Core</div>
              <div className="tw:col-span-1 tw:text-xs tw:font-semibold tw:text-slate-900 tw:uppercase tw:tracking-wider tw:text-center">Pro Individual</div>
            </div>
            
            {/* Features List */}
            <div className="tw:flex tw:flex-col tw:divide-y tw:divide-slate-200">
              {features.map((feature) => (
                <div key={feature.name} className="tw:grid tw:grid-cols-1 tw:md:grid-cols-5 tw:p-4 tw:gap-4 tw:md:gap-0 tw:items-center">
                  
                  {/* Feature Name & Description */}
                  <div className="tw:col-span-1 tw:md:col-span-3">
                    <div className="tw:flex tw:items-center tw:gap-1.5 tw:mb-1">
                      <span className="tw:text-sm tw:font-semibold tw:text-slate-900">{feature.name}</span>
                      <Info className="tw:w-4 tw:h-4 tw:text-slate-400" />
                    </div>
                    <p className="tw:text-sm tw:text-slate-600 tw:leading-relaxed">{feature.description}</p>
                  </div>
                  
                  {/* Mobile & Desktop Access Status */}
                  <div className="tw:grid tw:grid-cols-2 tw:gap-2 tw:md:contents">
                    {/* Free */}
                    <div className="tw:col-span-1 tw:flex tw:flex-col tw:md:flex-row tw:justify-center tw:items-start tw:md:items-center tw:gap-1">
                      <span className="tw:text-xs tw:text-slate-500 tw:md:hidden tw:mb-1">Free Core</span>
                      {feature.access.free === "available" ? (
                        <span className="tw:inline-flex tw:items-center tw:px-2.5 tw:py-1 tw:rounded-md tw:text-xs tw:font-medium tw:bg-green-50 tw:text-green-700 tw:border tw:border-green-200">Tersedia</span>
                      ) : feature.access.free === "limited" ? (
                        <span className="tw:inline-flex tw:items-center tw:px-2.5 tw:py-1 tw:rounded-md tw:text-xs tw:font-medium tw:bg-slate-100 tw:text-slate-700 tw:border tw:border-slate-200">Terbatas</span>
                      ) : (
                        <span className="tw:inline-flex tw:items-center tw:px-2.5 tw:py-1 tw:rounded-md tw:text-xs tw:font-medium tw:bg-slate-50 tw:text-slate-400 tw:border tw:border-slate-100">Tidak tersedia</span>
                      )}
                    </div>
                    
                    {/* Pro */}
                    <div className="tw:col-span-1 tw:flex tw:flex-col tw:md:flex-row tw:justify-center tw:items-start tw:md:items-center tw:gap-1">
                      <span className="tw:text-xs tw:text-slate-500 tw:md:hidden tw:mb-1">Pro Individual</span>
                      {feature.access.pro === "available" ? (
                        <span className="tw:inline-flex tw:items-center tw:px-2.5 tw:py-1 tw:rounded-md tw:text-xs tw:font-medium tw:bg-green-50 tw:text-green-700 tw:border tw:border-green-200">Tersedia</span>
                      ) : (
                        <span className="tw:inline-flex tw:items-center tw:px-2.5 tw:py-1 tw:rounded-md tw:text-xs tw:font-medium tw:bg-slate-100 tw:text-slate-700 tw:border tw:border-slate-200">Terbatas</span>
                      )}
                    </div>
                  </div>
                  
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Organization Teaser */}
        <section className="tw:bg-slate-50 tw:border tw:border-slate-200 tw:rounded-xl tw:p-6 tw:md:p-8 tw:mb-16">
          <div className="tw:flex tw:flex-col tw:md:flex-row tw:items-center tw:justify-between tw:gap-6">
            <div className="tw:flex-1 tw:text-center tw:md:text-left">
              <div className="tw:inline-flex tw:items-center tw:justify-center tw:w-10 tw:h-10 tw:rounded-lg tw:bg-slate-200 tw:text-slate-700 tw:mb-4">
                <Buildings className="tw:w-5 tw:h-5" weight="fill" />
              </div>
              <h2 className="tw:text-xl tw:font-bold tw:text-slate-900 tw:mb-2">Paket untuk Tim dan Institusi</h2>
              <p className="tw:text-sm tw:text-slate-600 tw:max-w-xl tw:leading-relaxed">
                Tersedia paket <strong>Organization</strong> dan <strong>Enterprise</strong> dengan fitur seat management, shared shortlists, kendali akses penuh (RBAC), serta organization AI context.
              </p>
            </div>
            <div className="tw:w-full tw:md:w-auto tw:shrink-0">
              <a 
                href="/plans/organization" 
                className="tw:w-full tw:bg-white tw:border tw:border-slate-300 tw:text-slate-900 tw:text-sm tw:font-semibold tw:min-h-[44px] tw:px-6 tw:rounded-lg tw:inline-flex tw:items-center tw:justify-center tw:hover:bg-slate-50 tw:transition-colors"
              >
                Lihat paket organisasi
              </a>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="tw:mb-16 tw:max-w-3xl tw:mx-auto">
          <h2 className="tw:text-2xl tw:font-bold tw:text-slate-900 tw:mb-8 tw:text-center">Pertanyaan Umum</h2>
          <div className="tw:space-y-6">
            <div className="tw:border-b tw:border-slate-100 tw:pb-6">
              <h3 className="tw:text-base tw:font-semibold tw:text-slate-900 tw:mb-2">Apa perbedaan utama Free Core dan Pro?</h3>
              <p className="tw:text-sm tw:text-slate-600 tw:leading-relaxed">
                Free Core memberikan akses selamanya ke fungsi jaringan, pencarian, dan kolaborasi dasar. Pro ditujukan bagi profesional yang butuh analitik mendalam, penyimpanan riwayat yang lebih panjang, serta batas penggunaan kueri AI yang jauh lebih besar.
              </p>
            </div>
            <div className="tw:border-b tw:border-slate-100 tw:pb-6">
              <h3 className="tw:text-base tw:font-semibold tw:text-slate-900 tw:mb-2">Apakah paket berbayar meningkatkan ranking profil saya?</h3>
              <p className="tw:text-sm tw:text-slate-600 tw:leading-relaxed">
                Tidak. Pembayaran sama sekali tidak memengaruhi kredibilitas, verifikasi, atau ranking visibilitas Anda di platform kami. Sistem matching beroperasi secara objektif murni berdasarkan bukti (evidence) portofolio Anda.
              </p>
            </div>
            <div className="tw:border-b tw:border-slate-100 tw:pb-6">
              <h3 className="tw:text-base tw:font-semibold tw:text-slate-900 tw:mb-2">Bagaimana sistem kuota AI bekerja?</h3>
              <p className="tw:text-sm tw:text-slate-600 tw:leading-relaxed">
                Batas penggunaan AI (seperti ekstraksi dokumen PDF dan analisis kecocokan profil) dihitung dan direfresh setiap awal siklus bulan. Penggunaan yang gagal karena kesalahan sistem internal kami tidak akan mengurangi kuota Anda.
              </p>
            </div>
            <div className="tw:pb-2">
              <h3 className="tw:text-base tw:font-semibold tw:text-slate-900 tw:mb-2">Apakah ada pembayaran nyata yang ditagihkan?</h3>
              <p className="tw:text-sm tw:text-slate-600 tw:leading-relaxed">
                Tidak. Saat ini platform dalam tahap simulasi purwarupa (Prototype Phase). Semua transisi pembayaran yang ditampilkan di tahap ini adalah simulasi antarmuka saja tanpa ada integrasi payment gateway.
              </p>
            </div>
          </div>
        </section>
        
        {/* Final CTA */}
        <section className="tw:text-center tw:bg-slate-900 tw:rounded-2xl tw:p-8 tw:md:p-12">
          <h2 className="tw:text-2xl tw:font-bold tw:text-white tw:mb-3">Mulai kolaborasi tanpa hambatan</h2>
          <p className="tw:text-sm tw:text-slate-300 tw:mb-8 tw:max-w-xl tw:mx-auto">
            Pilih kapasitas yang sesuai dengan kebutuhan kolaborasimu dan rasakan dukungan asisten AI dalam mencari kandidat yang tepat.
          </p>
          <div className="tw:flex tw:flex-col tw:sm:flex-row tw:justify-center tw:gap-4">
            <a 
              href="/register" 
              className="tw:w-full tw:sm:w-auto tw:bg-white tw:text-slate-900 tw:text-sm tw:font-semibold tw:min-h-[44px] tw:px-8 tw:rounded-lg tw:inline-flex tw:items-center tw:justify-center tw:hover:bg-slate-100 tw:transition-colors"
            >
              Mulai gratis
            </a>
            <a 
              href="/plans/organization" 
              className="tw:w-full tw:sm:w-auto tw:bg-transparent tw:border tw:border-slate-600 tw:text-white tw:text-sm tw:font-semibold tw:min-h-[44px] tw:px-8 tw:rounded-lg tw:inline-flex tw:items-center tw:justify-center tw:hover:bg-slate-800 tw:transition-colors"
            >
              Lihat paket organisasi
            </a>
          </div>
        </section>

      </div>
    </div>
  );
}
