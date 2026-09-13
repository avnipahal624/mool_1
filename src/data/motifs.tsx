import React from "react";
import type { Lang, Tr } from "../lib/types";

export type MotifCategory = "flowers" | "foods" | "instruments" | "festival" | "household" | "nature";

export interface Motif {
  cat: MotifCategory;
  name: Tr;
  svg: React.ReactNode;
}

const S = { fill: "none", stroke: "#2b2822", strokeWidth: 2.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

const m = (cat: MotifCategory, en: string, as: string, bn: string, svg: React.ReactNode): Motif => ({
  cat,
  name: { en, as, bn },
  svg,
});

export const MOTIFS: Record<string, Motif> = {
  marigold: m("flowers", "Marigold", "গেন্দা ফুল", "গাঁদা ফুল", (
    <g><circle cx="32" cy="32" r="16" fill="#e8a13c" /><circle cx="32" cy="32" r="8" fill="#d9862b" />
      {[0, 60, 120, 180, 240, 300].map((a) => (<circle key={a} cx={32 + 19 * Math.cos((a * Math.PI) / 180)} cy={32 + 19 * Math.sin((a * Math.PI) / 180)} r="6" fill="#f2b65a" />))}
      <circle cx="32" cy="32" r="3.5" fill="#7a4a12" /></g>
  )),
  lotus: m("flowers", "Lotus", "পদুম ফুল", "পদ্ম ফুল", (
    <g><path d="M32 14c5 7 6 15 0 24-6-9-5-17 0-24z" fill="#e79aab" />
      <path d="M16 24c8 2 13 8 14 15-8-1-14-7-14-15z" fill="#f0b7c4" />
      <path d="M48 24c-8 2-13 8-14 15 8-1 14-7 14-15z" fill="#f0b7c4" />
      <path d="M14 42c6 8 30 8 36 0-4-4-32-4-36 0z" fill="#9db48f" /></g>
  )),
  rose: m("flowers", "Rose", "গোলাপ", "গোলাপ", (
    <g><circle cx="30" cy="28" r="14" fill="#c4674f" />
      <path d="M30 20c6 0 9 4 8 9-1 4-5 6-8 5-3-1-5-4-4-7" {...S} stroke="#f6ded4" strokeWidth={2.2} />
      <path d="M40 42l8 8M44 40c4 0 7 3 7 7-4 0-7-3-7-7z" fill="#9db48f" stroke="#3e6b4a" strokeWidth="2" /></g>
  )),
  orchid: m("flowers", "Kopou orchid", "কপৌ ফুল", "কপৌ ফুল", (
    <g><ellipse cx="32" cy="22" rx="7" ry="11" fill="#fdf6e8" stroke="#cbbf9d" strokeWidth="2" />
      <ellipse cx="22" cy="36" rx="7" ry="10" fill="#fdf6e8" stroke="#cbbf9d" strokeWidth="2" transform="rotate(-35 22 36)" />
      <ellipse cx="42" cy="36" rx="7" ry="10" fill="#fdf6e8" stroke="#cbbf9d" strokeWidth="2" transform="rotate(35 42 36)" />
      <circle cx="32" cy="34" r="5" fill="#e9cd7a" /></g>
  )),
  pitha: m("foods", "Pitha", "পিঠা", "পিঠা", (
    <g><ellipse cx="32" cy="42" rx="22" ry="9" fill="#9db48f" />
      <path d="M18 40c0-10 6-18 14-18s14 8 14 18z" fill="#d9a05b" />
      <path d="M24 36h16" stroke="#a86a2c" strokeWidth="2.4" strokeLinecap="round" /><path d="M26 30h12" stroke="#a86a2c" strokeWidth="2.4" strokeLinecap="round" /></g>
  )),
  fishcurry: m("foods", "Fish curry", "মাছৰ তৰকাৰী", "মাছের তরকারি", (
    <g><path d="M12 32h40c0 12-9 18-20 18s-20-6-20-18z" fill="#c4674f" />
      <ellipse cx="32" cy="32" rx="20" ry="5" fill="#e8a13c" />
      <path d="M22 30c5-4 15-4 20 0-5 4-15 4-20 0zM44 30l6-4v8z" fill="#f6ded4" stroke="#a3543f" strokeWidth="1.8" />
      <circle cx="26" cy="30" r="1.6" fill="#2b2822" /></g>
  )),
  laddu: m("foods", "Laddu", "লাড্ডু", "লাড্ডু", (
    <g><ellipse cx="32" cy="46" rx="20" ry="6" fill="#e5dcc4" />
      <circle cx="23" cy="36" r="9" fill="#e8a13c" /><circle cx="41" cy="36" r="9" fill="#e8a13c" /><circle cx="32" cy="25" r="9" fill="#f2b65a" />
      <circle cx="29" cy="23" r="1.4" fill="#a86a2c" /><circle cx="35" cy="27" r="1.4" fill="#a86a2c" /><circle cx="21" cy="35" r="1.4" fill="#a86a2c" /><circle cx="43" cy="37" r="1.4" fill="#a86a2c" /></g>
  )),
  teacup: m("foods", "Tea", "চাহ", "চা", (
    <g><path d="M16 26h28v10c0 8-6 14-14 14s-14-6-14-14z" fill="#fdf6e8" stroke="#8b8369" strokeWidth="2.4" />
      <path d="M44 28h4c4 0 6 3 6 6s-2 6-6 6h-5" {...S} stroke="#8b8369" />
      <path d="M24 20c-2-3 2-4 0-7M32 20c-2-3 2-4 0-7" {...S} stroke="#bcaed6" />
      <ellipse cx="30" cy="28" rx="12" ry="3" fill="#d9a05b" /></g>
  )),
  dhol: m("instruments", "Dhol drum", "ঢোল", "ঢোল", (
    <g><rect x="14" y="20" width="36" height="26" rx="10" fill="#d9a05b" />
      <ellipse cx="14" cy="33" rx="5" ry="13" fill="#f6ded4" stroke="#a86a2c" strokeWidth="2" />
      <ellipse cx="50" cy="33" rx="5" ry="13" fill="#f6ded4" stroke="#a86a2c" strokeWidth="2" />
      <path d="M18 22l28 22M46 22L18 44" stroke="#7a4a12" strokeWidth="2" /></g>
  )),
  pepa: m("instruments", "Pepa horn", "পেঁপা", "পেঁপা", (
    <g><path d="M14 46C20 30 30 20 46 16l4 6C38 26 28 36 22 50z" fill="#d9a05b" stroke="#a86a2c" strokeWidth="2.2" />
      <ellipse cx="49" cy="19" rx="5" ry="7" fill="#7a4a12" transform="rotate(40 49 19)" />
      <path d="M18 44c2-1 4-1 5 1" stroke="#7a4a12" strokeWidth="2.2" strokeLinecap="round" /></g>
  )),
  flute: m("instruments", "Flute", "বাহী", "বাঁশি", (
    <g><rect x="8" y="28" width="48" height="9" rx="4.5" fill="#e9cd7a" transform="rotate(-8 32 32)" />
      {[18, 26, 34, 42].map((x) => (<circle key={x} cx={x} cy={33 - (x - 18) * 0.14} r="2" fill="#7a5713" />))}
      <circle cx="50" cy="28.5" r="2.4" fill="#7a5713" /></g>
  )),
  dotara: m("instruments", "Dotara", "দোতৰা", "দোতারা", (
    <g><circle cx="24" cy="42" r="12" fill="#d9a05b" /><circle cx="24" cy="42" r="4" fill="#7a4a12" />
      <rect x="30" y="12" width="7" height="26" rx="3" fill="#a86a2c" transform="rotate(24 33 25)" />
      <path d="M20 38l22-22M26 44L48 22" stroke="#f6ded4" strokeWidth="1.6" /></g>
  )),
  diya: m("festival", "Diya lamp", "চাকি", "প্রদীপ", (
    <g><path d="M14 38h36c-2 10-10 14-18 14s-16-4-18-14z" fill="#c4674f" />
      <ellipse cx="32" cy="38" rx="18" ry="4.5" fill="#e8a13c" />
      <path d="M32 16c5 6 6 12 0 16-6-4-5-10 0-16z" fill="#e9cd7a" stroke="#d9862b" strokeWidth="2" />
      <path d="M32 24c2 2 2 5 0 7-2-2-2-5 0-7z" fill="#d9862b" /></g>
  )),
  jaapi: m("festival", "Jaapi hat", "জাপি", "জাপি", (
    <g><path d="M8 42c8-18 40-18 48 0z" fill="#f6ded4" stroke="#c4674f" strokeWidth="2.4" />
      <path d="M8 42c8 4 40 4 48 0-6 8-42 8-48 0z" fill="#e9cd7a" stroke="#c4674f" strokeWidth="2" />
      <path d="M26 26c2-6 10-6 12 0" fill="none" stroke="#c4674f" strokeWidth="2.6" strokeLinecap="round" /></g>
  )),
  garland: m("festival", "Garland", "ফুলৰ মালা", "ফুলের মালা", (
    <g><path d="M12 12c4 22 36 22 40 0" fill="none" stroke="#9db48f" strokeWidth="2.4" />
      {[0, 1, 2, 3, 4].map((i) => { const t = i / 4; const x = 12 + 40 * t; const y = 12 + 44 * t * (1 - t) * 1.6 + 12 * t; return (<g key={i}><circle cx={x} cy={y + 4} r="5" fill="#e8a13c" /><circle cx={x} cy={y + 4} r="2" fill="#d9862b" /></g>); })}</g>
  )),
  teapot: m("household", "Teapot", "চাহৰ পাত্ৰ", "চায়ের পাত্র", (
    <g><circle cx="30" cy="36" r="15" fill="#bcaed6" />
      <path d="M43 30c8 0 12 6 10 14-4-2-6-6-6-10" fill="#bcaed6" />
      <path d="M15 30L8 22c3-2 7-2 9 1" fill="#bcaed6" />
      <rect x="22" y="18" width="16" height="5" rx="2.5" fill="#5c4b8a" /><circle cx="30" cy="16" r="2.5" fill="#5c4b8a" />
      <circle cx="30" cy="36" r="5" fill="#ece7f4" /></g>
  )),
  bell: m("household", "Temple bell", "ঘণ্টা", "ঘণ্টা", (
    <g><path d="M32 10c3 0 4 2 4 4h-8c0-2 1-4 4-4z" fill="#e8a13c" />
      <path d="M18 40c0-14 5-22 14-22s14 8 14 22z" fill="#e9cd7a" stroke="#d9862b" strokeWidth="2.2" />
      <path d="M15 40h34c0 3-3 5-6 5H21c-3 0-6-2-6-5z" fill="#d9862b" />
      <circle cx="32" cy="50" r="4" fill="#d9862b" /></g>
  )),
  umbrella: m("household", "Umbrella", "ছাতি", "ছাতা", (
    <g><path d="M10 32c4-14 40-14 44 0-4-3-8-3-11 0-3-3-8-3-11 0-3-3-8-3-11 0-3-3-7-3-11 0z" fill="#c4674f" />
      <path d="M32 14v34c0 4-3 6-6 5" {...S} stroke="#7a4a12" />
      <circle cx="32" cy="13" r="2.4" fill="#7a4a12" /></g>
  )),
  radio: m("household", "Radio", "ৰেডিঅ'", "রেডিও", (
    <g><rect x="10" y="22" width="44" height="28" rx="6" fill="#9db48f" />
      <circle cx="24" cy="36" r="8" fill="#fdf6e8" /><circle cx="24" cy="36" r="3" fill="#57503f" />
      <rect x="38" y="28" width="10" height="4" rx="2" fill="#fdf6e8" /><rect x="38" y="35" width="10" height="4" rx="2" fill="#fdf6e8" /><rect x="38" y="42" width="10" height="3" rx="1.5" fill="#fdf6e8" />
      <path d="M14 22L44 12" stroke="#57503f" strokeWidth="2.4" strokeLinecap="round" /></g>
  )),
  leaf: m("nature", "Leaf", "পাত", "পাতা", (
    <g><path d="M16 48C16 28 30 14 50 14c0 20-14 34-34 34z" fill="#9db48f" />
      <path d="M18 46C26 36 36 26 46 18" {...S} stroke="#3e6b4a" /></g>
  )),
  butterfly: m("nature", "Butterfly", "পখিলা", "প্রজাপতি", (
    <g><ellipse cx="22" cy="26" rx="10" ry="12" fill="#bcaed6" transform="rotate(-18 22 26)" />
      <ellipse cx="42" cy="26" rx="10" ry="12" fill="#eec39a" transform="rotate(18 42 26)" />
      <ellipse cx="24" cy="42" rx="7" ry="9" fill="#eec39a" transform="rotate(15 24 42)" />
      <ellipse cx="40" cy="42" rx="7" ry="9" fill="#bcaed6" transform="rotate(-15 40 42)" />
      <rect x="29.5" y="18" width="5" height="30" rx="2.5" fill="#57503f" />
      <path d="M29 18l-5-6M35 18l5-6" stroke="#57503f" strokeWidth="2" strokeLinecap="round" /></g>
  )),
  bird: m("nature", "Bird", "চৰাই", "পাখি", (
    <g><ellipse cx="30" cy="36" rx="15" ry="12" fill="#7fa7a3" />
      <circle cx="42" cy="24" r="8" fill="#7fa7a3" />
      <path d="M49 24l7 2-7 3z" fill="#e8a13c" /><circle cx="44" cy="22.5" r="1.8" fill="#2b2822" />
      <path d="M20 34c-4 2-6 6-6 10 6 0 10-2 12-6z" fill="#5d8480" /><path d="M28 48v6M35 48v6" stroke="#e8a13c" strokeWidth="2.4" strokeLinecap="round" /></g>
  )),
  sun: m("nature", "Sun", "সূৰ্য", "সূর্য", (
    <g><circle cx="32" cy="32" r="12" fill="#e9cd7a" stroke="#d9862b" strokeWidth="2.4" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (<line key={a} x1={32 + 17 * Math.cos((a * Math.PI) / 180)} y1={32 + 17 * Math.sin((a * Math.PI) / 180)} x2={32 + 23 * Math.cos((a * Math.PI) / 180)} y2={32 + 23 * Math.sin((a * Math.PI) / 180)} stroke="#d9862b" strokeWidth="2.6" strokeLinecap="round" />))}</g>
  )),
};

export const MOTIF_IDS = Object.keys(MOTIFS);

export function motifsByCat(cat: MotifCategory): string[] {
  return MOTIF_IDS.filter((id) => MOTIFS[id].cat === cat);
}

export function MotifIcon({ id, size = 56, label }: { id: string; size?: number; label?: string }) {
  const motif = MOTIFS[id];
  if (!motif) return null;
  // With a label: meaningful image announced to screen readers.
  // Without: purely decorative — hidden from assistive tech.
  if (!label) {
    return (
      <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true" focusable="false">
        {motif.svg}
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} role="img" aria-label={label} focusable="false">
      {motif.svg}
    </svg>
  );
}

export function motifLabel(id: string, lang: Lang): string {
  const motif = MOTIFS[id];
  if (!motif) return "";
  return motif.name[lang] ?? motif.name.en;
}
