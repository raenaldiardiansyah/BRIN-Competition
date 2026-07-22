"use client";

import { useState } from "react";
import { useReducedMotion } from "motion/react";
import BlurText from "@/components/react-bits/BlurText";
import CountUp from "@/components/react-bits/CountUp";
import FadeContent from "@/components/react-bits/FadeContent";
import { aiHistoryDummy } from "@/dummy/ai/ai-history-dummy";
import { aiFeatureCatalog } from "../ai-feature-catalog";
import { AIQuotaIndicator } from "../shared/AIQuotaIndicator";
import { AILimitationNotice } from "../shared/AILimitationNotice";
import { AIFeatureCard } from "./AIFeatureCard";
import { AIHistorySection } from "./AIHistorySection";

const headline = "Analisis yang dapat dijelaskan, bukan sekadar jawaban";

function AnimatedMetric({ value }: { value: number }) {
  const reducedMotion = useReducedMotion();
  return reducedMotion ? <>{value}</> : <CountUp to={value} duration={1.15} />;
}

export function AIHubPage() {
  const [selected, setSelected] = useState(aiFeatureCatalog[0].id);
  const [headlineReady, setHeadlineReady] = useState(false);
  const active = aiFeatureCatalog.find((item) => item.id === selected)!;
  const mvpFeatures = aiFeatureCatalog.filter((item) => item.maturity === "mvp");
  const advancedFeatures = aiFeatureCatalog.filter((item) => item.maturity !== "mvp");
  const quotaUsed = 3;
  const quotaLimit = 10;

  return (
    <div className="ai-page">
      <header className="ai-hub-hero">
        <p className="ai-hub-hero__eyebrow">AI TautIn</p>
        <h1 className="ai-hub-hero__title" aria-label={headline}>
          <span
            className={`ai-hub-hero__fallback${headlineReady ? " is-hidden" : ""}`}
            aria-hidden="true"
          >
            {headline}
          </span>
          <BlurText
            text={headline}
            animateBy="words"
            direction="bottom"
            delay={55}
            stepDuration={0.28}
            className="ai-hub-hero__animated-title"
            onAnimationComplete={() => setHeadlineReady(true)}
          />
        </h1>
        <p className="ai-hub-hero__description">
          Delapan alat simulasi membantu membaca evidence, gap, confidence, dan langkah berikutnya
          tanpa membuat klaim otomatis.
        </p>

        <div className="ai-hub-metrics" aria-label="Ringkasan penggunaan AI">
          <article>
            <strong><AnimatedMetric value={quotaLimit - quotaUsed} /></strong>
            <span>Sisa analisis</span>
          </article>
          <article>
            <strong><AnimatedMetric value={aiFeatureCatalog.length} /></strong>
            <span>Alat AI tersedia</span>
          </article>
          <article>
            <strong><AnimatedMetric value={mvpFeatures.length} /></strong>
            <span>MVP utama</span>
          </article>
        </div>
      </header>

      <AIQuotaIndicator used={quotaUsed} limit={quotaLimit} tier="free" />

      <FadeContent duration={460} translateY={14} blur={false} threshold={0.12}>
        <section className="ai-section" aria-labelledby="ai-mvp-title">
          <div className="ai-section__heading">
            <div>
              <p>Mulai dari sini</p>
              <h2 id="ai-mvp-title">Tiga MVP utama</h2>
            </div>
            <span>Pilih satu alat untuk melihat preview aktif.</span>
          </div>
          <div className="ai-feature-grid ai-feature-grid--mvp">
            {mvpFeatures.map((item) => (
              <AIFeatureCard
                key={item.id}
                feature={item}
                selected={selected === item.id}
                onSelect={() => setSelected(item.id)}
              />
            ))}
          </div>
        </section>
      </FadeContent>

      <aside className="ai-detail-panel" aria-live="polite">
        <p>Fitur dipilih</p>
        <h2>{active.title}</h2>
        <span>{active.description}</span>
        <a className="button primary" href={active.route}>Mulai simulasi</a>
      </aside>

      <FadeContent duration={440} translateY={12} blur={false} threshold={0.1}>
        <section className="ai-section" aria-labelledby="ai-advanced-title">
          <div className="ai-section__heading">
            <div>
              <p>Direktori lanjutan</p>
              <h2 id="ai-advanced-title">Advanced prototype</h2>
            </div>
            <span>Lima alat eksplorasi untuk kebutuhan Pro dan organisasi.</span>
          </div>
          <div className="ai-feature-grid">
            {advancedFeatures.map((item) => (
              <AIFeatureCard
                key={item.id}
                feature={item}
                selected={selected === item.id}
                onSelect={() => setSelected(item.id)}
              />
            ))}
          </div>
        </section>
      </FadeContent>

      <FadeContent duration={420} translateY={10} blur={false} threshold={0.08}>
        <AIHistorySection items={aiHistoryDummy} />
      </FadeContent>

      <AILimitationNotice limitation={{
        id: "hub-limit",
        title: "Prototype frontend",
        description: "Seluruh hasil memakai dummy data lokal dan tidak terhubung ke model, API, atau database nyata.",
      }} />
    </div>
  );
}
