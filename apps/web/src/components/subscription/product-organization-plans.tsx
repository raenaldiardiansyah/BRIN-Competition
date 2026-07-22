"use client";

import { CheckCircle, Buildings, Sparkle, ArrowRight, ShieldCheck } from "@phosphor-icons/react";
import "../../styles/product-organization-plans.css";

export function ProductOrganizationPlans() {
  return (
    <div className="pl-ui-scope pl-org-plans-page tw:min-h-screen tw:bg-slate-50 tw:py-16">
      <div className="tw:max-w-6xl tw:mx-auto tw:px-4 md:tw:px-6">
        {/* Hero */}
        <header className="tw:text-center tw:mb-16">
          <h1 className="tw:text-4xl tw:font-extrabold tw:text-slate-900 tw:mb-4">
            Paket untuk Tim dan Institusi
          </h1>
          <p className="tw:text-lg tw:text-slate-600 tw:max-w-2xl tw:mx-auto">
            Berdayakan laboratorium, perusahaan, atau organisasi Anda dengan fitur kolaborasi terpusat, analitik AI, dan kontrol administratif.
          </p>
        </header>

        {/* Pricing Cards */}
        <div className="tw:grid md:tw:grid-cols-2 tw:gap-8 tw:mb-16 tw:items-start">
          {/* Organization Plan */}
          <div className="tw:bg-white tw:rounded-2xl tw:shadow-sm tw:border tw:border-slate-200 tw:p-8 tw:relative">
            <div className="tw:absolute tw:top-0 tw:left-1/2 -tw:-translate-x-1/2 -tw:translate-y-1/2 tw:bg-blue-600 tw:text-white tw:text-xs tw:font-bold tw:uppercase tw:tracking-wider tw:py-1 tw:px-3 tw:rounded-full">
              Paling Populer
            </div>
            <div className="tw:flex tw:items-center tw:gap-3 tw:mb-4">
              <div className="tw:p-2 tw:bg-blue-50 tw:text-blue-600 tw:rounded-lg">
                <Buildings size={24} weight="duotone" />
              </div>
              <h2 className="tw:text-2xl tw:font-bold tw:text-slate-900">Organization</h2>
            </div>
            <div className="tw:mb-6">
              <span className="tw:text-4xl tw:font-extrabold tw:text-slate-900">Rp 890.000</span>
              <span className="tw:text-slate-500"> / bulan</span>
            </div>
            <p className="tw:text-slate-600 tw:mb-8 tw:text-sm">
              Untuk tim riset dan startup yang membutuhkan kolaborasi terpusat. Termasuk 15 anggota.
            </p>
            <a 
              href="/register"
              className="tw:block tw:w-full tw:text-center tw:bg-blue-600 hover:tw:bg-blue-700 tw:text-white tw:font-semibold tw:py-3 tw:rounded-xl tw:transition-colors tw:mb-8"
            >
              Mulai dengan Organization
            </a>
            
            <div className="tw:space-y-4">
              <h4 className="tw:text-sm tw:font-bold tw:text-slate-900">Apa yang Anda dapatkan:</h4>
              <ul className="tw:space-y-3 tw:text-sm tw:text-slate-700">
                <li className="tw:flex tw:items-start tw:gap-3">
                  <CheckCircle size={20} className="tw:text-emerald-500 tw:shrink-0" weight="fill" />
                  <span>Hingga 15 anggota aktif</span>
                </li>
                <li className="tw:flex tw:items-start tw:gap-3">
                  <CheckCircle size={20} className="tw:text-emerald-500 tw:shrink-0" weight="fill" />
                  <span>500 penggunaan AI secara gabungan per bulan</span>
                </li>
                <li className="tw:flex tw:items-start tw:gap-3">
                  <CheckCircle size={20} className="tw:text-emerald-500 tw:shrink-0" weight="fill" />
                  <span>Admin dashboard & role management (RBAC)</span>
                </li>
                <li className="tw:flex tw:items-start tw:gap-3">
                  <CheckCircle size={20} className="tw:text-emerald-500 tw:shrink-0" weight="fill" />
                  <span>Shared shortlists & kolaborasi pipeline</span>
                </li>
                <li className="tw:flex tw:items-start tw:gap-3">
                  <CheckCircle size={20} className="tw:text-emerald-500 tw:shrink-0" weight="fill" />
                  <span>Organization profile</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Enterprise Plan */}
          <div className="tw:bg-slate-900 tw:rounded-2xl tw:shadow-lg tw:p-8 tw:text-white">
            <div className="tw:flex tw:items-center tw:gap-3 tw:mb-4">
              <div className="tw:p-2 tw:bg-slate-800 tw:text-blue-400 tw:rounded-lg">
                <ShieldCheck size={24} weight="duotone" />
              </div>
              <h2 className="tw:text-2xl tw:font-bold tw:text-white">Enterprise</h2>
            </div>
            <div className="tw:mb-6">
              <span className="tw:text-4xl tw:font-extrabold tw:text-white">Custom</span>
            </div>
            <p className="tw:text-slate-400 tw:mb-8 tw:text-sm">
              Untuk institusi besar, universitas, atau korporasi dengan kebutuhan tak terbatas dan dukungan khusus.
            </p>
            <button 
              className="tw:flex tw:items-center tw:justify-center tw:w-full tw:px-6 tw:py-3 tw:text-sm tw:font-semibold tw:text-slate-400 tw:bg-slate-50 tw:border-2 tw:border-slate-200 tw:rounded-xl tw:cursor-not-allowed"
              aria-disabled="true"
              disabled
            >
              Hubungi Tim Sales
            </button>
            <p className="tw:text-xs tw:text-slate-500 tw:text-center tw:mt-2">
              Kontak Enterprise akan tersedia pada integrasi berikutnya
            </p>
            
            <div className="tw:space-y-4">
              <h4 className="tw:text-sm tw:font-bold tw:text-white">Segala di Organization, ditambah:</h4>
              <ul className="tw:space-y-3 tw:text-sm tw:text-slate-300">
                <li className="tw:flex tw:items-start tw:gap-3">
                  <CheckCircle size={20} className="tw:text-blue-400 tw:shrink-0" weight="fill" />
                  <span>Anggota tak terbatas (Custom seats)</span>
                </li>
                <li className="tw:flex tw:items-start tw:gap-3">
                  <CheckCircle size={20} className="tw:text-blue-400 tw:shrink-0" weight="fill" />
                  <span>Penggunaan AI tak terbatas</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="tw:max-w-3xl tw:mx-auto">
          <h3 className="tw:text-2xl tw:font-bold tw:text-slate-900 tw:mb-8 tw:text-center">FAQ Organisasi</h3>
          <div className="tw:space-y-6">
            <div>
              <h4 className="tw:font-bold tw:text-slate-900 tw:mb-2">Bagaimana cara kerja batas kursi (seats)?</h4>
              <p className="tw:text-slate-600 tw:text-sm">Paket Organization menyertakan 15 kursi. Setiap pengguna yang Anda undang ke workspace organisasi Anda akan menempati satu kursi, terlepas dari perannya (Admin atau Member).</p>
            </div>
            <div>
              <h4 className="tw:font-bold tw:text-slate-900 tw:mb-2">Apakah kuota AI dibagi antar anggota?</h4>
              <p className="tw:text-slate-600 tw:text-sm">Ya, kuota 500 penggunaan AI pada paket Organization adalah *pool* gabungan yang dapat digunakan oleh semua anggota di dalam workspace organisasi tersebut.</p>
            </div>
            <div>
              <h4 className="tw:font-bold tw:text-slate-900 tw:mb-2">Bisakah saya menambah kursi melebihi 15?</h4>
              <p className="tw:text-slate-600 tw:text-sm">Jika organisasi Anda berkembang pesat, Anda dapat beralih ke paket Enterprise untuk kursi tak terbatas dan kuota kustom.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
