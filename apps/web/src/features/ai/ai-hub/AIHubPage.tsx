"use client";

import { useState, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { ArrowRight, Buildings, FingerprintSimple, LightbulbFilament, RocketLaunch, Sparkle, UsersThree } from "@phosphor-icons/react";
import BlurText from "@/components/react-bits/BlurText";
import CountUp from "@/components/react-bits/CountUp";
import FadeContent from "@/components/react-bits/FadeContent";
import SpotlightCard from "@/components/react-bits/SpotlightCard";
import { collaborationMatchingDummy } from "@/dummy/ai/collaboration-matching-dummy";
import { innovationProfileDummy } from "@/dummy/ai/innovation-profile-dummy";
import { innovationWorkspaceDummy } from "@/dummy/ai/innovation-workspace-dummy";
import { aiHistoryDummy } from "@/dummy/ai/ai-history-dummy";
import { searchItems } from "@/dummy/registry";
import { returningUserSubscription } from "@/dummy/subscription-fixtures";
import { aiFeatureCatalog } from "../ai-feature-catalog";
import type { AIFeatureId } from "../types";
import { AILimitationNotice } from "../shared/AILimitationNotice";
import { AIHistorySection } from "./AIHistorySection";

const headline = "Analisis yang dapat dijelaskan, bukan sekadar jawaban.";
const cta: Record<AIFeatureId, string> = { "collaboration-matching": "Mulai pencocokan", "innovation-profile": "Analisis profil", "innovation-workspace": "Buka workspace", "research-gap": "Temukan gap riset", "novelty-checker": "Cek indikasi kebaruan", "industry-matching": "Cari mitra industri", "funding-recommendation": "Temukan pendanaan", commercialization: "Susun jalur komersialisasi" };
const icons = [LightbulbFilament, FingerprintSimple, Buildings, Sparkle, RocketLaunch];
const people = searchItems.filter((item) => item.scope === "people").slice(0, 3);

function ActivePreview({ selected }: { selected: AIFeatureId }) {
  if (selected === "collaboration-matching") {
    const match = collaborationMatchingDummy[0];
    return <div className="ai-preview-content"><div className="ai-preview-heading"><span>Kandidat teratas</span><strong>Confidence {match.confidence.label}</strong></div><div className="ai-preview-candidates">{people.map((person, index) => <div key={person.id}><b>0{index + 1}</b><span><strong>{person.title}</strong><small>{person.owner} · {person.evidence[0]}</small></span>{index === 0 ? <em>{match.score.value}/100</em> : <em>Review</em>}</div>)}</div><div className="ai-preview-gap"><span>Gap yang perlu ditinjau</span><strong>{match.gaps[0].description}</strong></div></div>;
  }
  if (selected === "innovation-profile") {
    const insight = innovationProfileDummy[0];
    return <div className="ai-preview-content"><div className="ai-score-strip"><div><span>Profile strength</span><strong>64/100</strong></div><div><span>Evidence coverage</span><strong>58/100</strong></div><div><span>Confidence</span><strong>{insight.confidence.label}</strong></div></div><div className="ai-preview-matrix"><div><b>Kompetensi</b><b>Evidence</b><b>Status</b></div><div><span>{insight.title}</span><span>{insight.evidence[0].title}</span><em>Perlu review</em></div></div><div className="ai-preview-gap"><span>Gap utama</span><strong>{insight.gaps[0].description}</strong></div></div>;
  }
  const workspace = innovationWorkspaceDummy[0];
  return <div className="ai-preview-content"><div className="ai-score-strip"><div><span>Readiness</span><strong>62%</strong></div><div><span>Confidence</span><strong>{workspace.confidence.label}</strong></div></div><div className="ai-mini-timeline"><div><b>Milestone terdekat</b><span>Review evidence uji lapangan · 28 Jul 2026</span></div><div><b>Blocker utama</b><span>{workspace.reason}</span></div><div className="active"><b>Next action</b><span>{workspace.nextAction.label}</span></div></div></div>;
}

function SpotlightPreview({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion();
  return reducedMotion ? <div className="ai-active-preview">{children}</div> : <SpotlightCard className="ai-active-preview" spotlightColor="rgba(7, 95, 247, 0.12)">{children}</SpotlightCard>;
}

export function AIHubPage() {
  const mvp = aiFeatureCatalog.filter((item) => item.maturity === "mvp");
  const advanced = aiFeatureCatalog.filter((item) => item.maturity !== "mvp");
  const [selected, setSelected] = useState<AIFeatureId>(mvp[0].id);
  const [open, setOpen] = useState<AIFeatureId>(advanced[0].id);
  const active = aiFeatureCatalog.find((item) => item.id === selected)!;
  const usage = returningUserSubscription.ai.usage;
  const remaining = usage.limit === null ? null : Math.max(0, usage.limit - usage.used);

  return <div className="ai-page ai-hub-redesign">
    <header className="ai-hub-split"><div><p className="ai-hub-hero__eyebrow">AI TautIn</p><h1 aria-label={headline}><BlurText text={headline} animateBy="words" direction="bottom" delay={55} stepDuration={0.28} /></h1><p>Gunakan konteks, evidence, confidence, dan batasan yang terlihat sebelum mengambil keputusan.</p><div className="ai-hub-access"><strong>Pro Individual</strong><span>Status aktif · {remaining === null ? "Tanpa batas" : <CountUp to={remaining} duration={1.1} />} analisis tersisa</span></div><a className="button primary" href="#mvp-showcase">Jelajahi fitur AI <ArrowRight size={17} /></a></div><div className="ai-explainable-flow"><p>Analisis aktif · AquaLoop</p>{[["01", "Context", "Kebutuhan data engineer"], ["02", "Evidence", "Field dataset v2"], ["03", "Confidence", "Sedang"], ["04", "Recommendation", "Tinjau kandidat"]].map(([number, title, detail]) => <div key={title}><b>{number}</b><span><strong>{title}</strong><small>{detail}</small></span></div>)}<small>Confidence bukan jaminan hasil; keputusan tetap pada pengguna.</small></div></header>

    <FadeContent duration={420} translateY={12} blur={false} threshold={0.1}><section className="ai-section" id="mvp-showcase"><div className="ai-section__heading"><div><p>Tiga fitur utama</p><h2>Satu alur, tiga cara untuk bergerak maju</h2></div><span>Pilih fitur untuk melihat data aktif, workflow, dan batasannya.</span></div><div className="ai-mvp-showcase"><div className="ai-mvp-tabs" role="tablist">{mvp.map((item) => <button key={item.id} className={selected === item.id ? "active" : ""} onClick={() => setSelected(item.id)} role="tab" aria-selected={selected === item.id}><UsersThree size={22} /><span><strong>{item.title}</strong><small>{item.description}</small></span><ArrowRight size={17} /></button>)}</div><SpotlightPreview><ActivePreview selected={selected} /></SpotlightPreview><aside className="ai-mvp-workflow"><p>Workflow</p><h2>{active.title}</h2><ol><li>Lengkapi konteks</li><li>Tinjau evidence</li><li>Bandingkan hasil dan batasan</li></ol><dl><div><dt>Confidence</dt><dd>{selected === "collaboration-matching" ? collaborationMatchingDummy[0].confidence.label : selected === "innovation-profile" ? innovationProfileDummy[0].confidence.label : innovationWorkspaceDummy[0].confidence.label}</dd></div><div><dt>Limitation</dt><dd>{active.limitationSummary}</dd></div></dl><a className="button primary" href={`${active.route}?source=ai-hub`}>{cta[active.id]}</a></aside></div></section></FadeContent>

    <FadeContent duration={420} translateY={12} blur={false} threshold={0.1}><section className="ai-section"><div className="ai-section__heading"><div><p>Advanced tools</p><h2>Direktori analisis lanjutan</h2></div><span>Prototype simulasi untuk keputusan berikutnya.</span></div><div className="ai-tool-directory">{advanced.map((item, index) => { const Icon = icons[index]; return <div className={open === item.id ? "active" : ""} key={item.id}><button onClick={() => setOpen(item.id)}><Icon size={23} /><span><strong>{item.title}</strong><small>{item.description}</small></span><em>{item.access.tiers.length === 1 ? "ORGANIZATION" : "PRO"} · PROTOTYPE</em><ArrowRight size={17} /></button>{open === item.id ? <section><p><b>Planned flow:</b> konteks → evidence → prioritas tindakan.</p><p><b>Limitation:</b> {item.limitationSummary}</p><a href={`${item.route}?source=ai-hub`}>{cta[item.id]} →</a></section> : null}</div>; })}</div></section></FadeContent>

    <AIHistorySection items={aiHistoryDummy} />
    <div className="ai-hub-limitation"><AILimitationNotice limitation={{ id: "ai-hub-local-data", title: "Prototype dengan data lokal", description: "Hasil prototype memakai dummy data lokal dan tidak terhubung ke model, API AI, atau database real-time. Evidence dan confidence membantu penilaian, tetapi keputusan tetap perlu diverifikasi pengguna." }} /></div>
  </div>;
}
