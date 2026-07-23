"use client";

import { CheckCircle, Buildings, ShieldCheck } from "@phosphor-icons/react";
import { tierMatrix } from "@/data/subscription-tiers";
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
              Simulasi harga prototype
            </div>
            <div className="tw:flex tw:items-center tw:gap-3 tw:mb-4">
              <div className="tw:p-2 tw:bg-blue-50 tw:text-blue-600 tw:rounded-lg">
                <Buildings size={24} weight="duotone" />
              </div>
              <h2 className="tw:text-2xl tw:font-bold tw:text-slate-900">Organization</h2>
            </div>
            <div className="tw:mb-6">
              <span className="tw:text-3xl tw:font-extrabold tw:text-slate-900">{tierMatrix.organization.pricing.display}</span>
            </div>
            <p className="tw:text-slate-600 tw:mb-8 tw:text-sm">
              {tierMatrix.organization.audience}
            </p>
            <a 
              href="/subscription?mode=compare&plan=organization"
              className="tw:block tw:w-full tw:text-center tw:bg-blue-600 hover:tw:bg-blue-700 tw:text-white tw:font-semibold tw:py-3 tw:rounded-xl tw:transition-colors tw:mb-8"
            >
              Mulai dengan Organization
            </a>
            
            <div className="tw:space-y-4">
              <h4 className="tw:text-sm tw:font-bold tw:text-slate-900">Apa yang Anda dapatkan:</h4>
              <ul className="tw:space-y-3 tw:text-sm tw:text-slate-700">
                <li className="tw:flex tw:items-start tw:gap-3">
                  <CheckCircle size={20} className="tw:text-emerald-500 tw:shrink-0" weight="fill" />
                  <span>Seat dan permission untuk workspace tim</span>
                </li>
                <li className="tw:flex tw:items-start tw:gap-3">
                  <CheckCircle size={20} className="tw:text-emerald-500 tw:shrink-0" weight="fill" />
                  <span>Penggunaan AI bersama sesuai kebijakan prototype</span>
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
              <span className="tw:text-2xl tw:font-extrabold tw:text-white">{tierMatrix.enterprise.pricing.display}</span>
            </div>
            <p className="tw:text-slate-400 tw:mb-8 tw:text-sm">
              {tierMatrix.enterprise.audience}
            </p>
            <a
              href="/subscription?mode=compare&plan=enterprise"
              className="tw:flex tw:items-center tw:justify-center tw:w-full tw:px-6 tw:py-3 tw:text-sm tw:font-semibold tw:text-slate-900 tw:bg-slate-50 tw:border-2 tw:border-slate-200 tw:rounded-xl"
            >
              Lihat preview Enterprise
            </a>
            <p className="tw:text-xs tw:text-slate-500 tw:text-center tw:mt-2">
              Kontak Enterprise akan tersedia pada integrasi berikutnya
            </p>
            
            <div className="tw:space-y-4">
              <h4 className="tw:text-sm tw:font-bold tw:text-white">Segala di Organization, ditambah:</h4>
              <ul className="tw:space-y-3 tw:text-sm tw:text-slate-300">
                <li className="tw:flex tw:items-start tw:gap-3">
                  <CheckCircle size={20} className="tw:text-blue-400 tw:shrink-0" weight="fill" />
                  <span>Konfigurasi seat sesuai kebutuhan</span>
                </li>
                <li className="tw:flex tw:items-start tw:gap-3">
                  <CheckCircle size={20} className="tw:text-blue-400 tw:shrink-0" weight="fill" />
                  <span>Kebijakan penggunaan AI kustom</span>
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
              <p className="tw:text-slate-600 tw:text-sm">Setiap pengguna yang diundang menempati satu seat sesuai peran dan permission workspace. Jumlah seat final belum ditetapkan pada prototype.</p>
            </div>
            <div>
              <h4 className="tw:font-bold tw:text-slate-900 tw:mb-2">Apakah kuota AI dibagi antar anggota?</h4>
              <p className="tw:text-slate-600 tw:text-sm">Preview memperlihatkan penggunaan bersama, tetapi batas final dan kebijakan pool belum ditetapkan pada prototype.</p>
            </div>
            <div>
              <h4 className="tw:font-bold tw:text-slate-900 tw:mb-2">Bisakah saya menambah seat?</h4>
              <p className="tw:text-slate-600 tw:text-sm">Enterprise menampilkan preview konfigurasi seat dan kebijakan kustom; tidak ada transaksi atau aktivasi nyata pada prototype.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
