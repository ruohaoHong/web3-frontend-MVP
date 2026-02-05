"use client";

import React, { useMemo, useState } from "react";

type AccentThemeId = "" | "sunset_coral" | "cool_graphite" | "mint_haze";
type Density = "compact" | "normal" | "roomy";
type Mode = "light" | "dark";

const ACCENT_THEMES: Record<
  Exclude<AccentThemeId, "">,
  { name: string; accent: string }
> = {
  sunset_coral: { name: "sunset coral", accent: "#E38B7A" },
  cool_graphite: { name: "cool graphite", accent: "#64748B" },
  mint_haze: { name: "mint haze", accent: "#76B8A7" },
};

function isValidHexColor(input: string) {
  const v = input.trim();
  return /^#([0-9a-fA-F]{6})$/.test(v);
}

function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return { r, g, b };
}

function pickAccentContrast(accentHex: string) {
  const { r, g, b } = hexToRgb(accentHex);
  // Relative luminance (sRGB)
  const srgb = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  const L = 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
  return L > 0.55 ? "#0B0F14" : "#FFFFFF";
}

function spacesForDensity(density: Density) {
  // keep consistent, 8-based feel
  if (density === "compact") return { s1: 6, s2: 10, s3: 14, s4: 20 };
  if (density === "roomy") return { s1: 10, s2: 16, s3: 22, s4: 32 };
  return { s1: 8, s2: 12, s3: 16, s4: 24 };
}

export default function VibePage() {
  const [mode, setMode] = useState<Mode>("light");
  const [theme, setTheme] = useState<AccentThemeId>("");
  const [radius, setRadius] = useState<12 | 14 | 16>(14);
  const [density, setDensity] = useState<Density>("normal");
  const [keyword, setKeyword] = useState<string>("");
  const [customAccent, setCustomAccent] = useState<string>("");

  const [copyNotice, setCopyNotice] = useState<string | null>(null);

  const keywordIsLuxury = keyword.trim().toLowerCase() === "luxury";
  const hasTheme = theme !== "";

  const customAccentTrimmed = customAccent.trim();
  const customAccentActive = customAccentTrimmed.length > 0;
  const customAccentValid = !customAccentActive || isValidHexColor(customAccentTrimmed);

  const accent = useMemo(() => {
    if (customAccentActive && customAccentValid) return customAccentTrimmed;
    if (!hasTheme) return null;
    return ACCENT_THEMES[theme as Exclude<AccentThemeId, "">].accent;
  }, [customAccentActive, customAccentTrimmed, customAccentValid, hasTheme, theme]);

  const accentContrast = useMemo(() => {
    if (!accent) return "#FFFFFF";
    return pickAccentContrast(accent);
  }, [accent]);

  const tokenVars = useMemo(() => {
    const space = spacesForDensity(density);

    const base =
      mode === "light"
        ? {
            bg: "#F6F7F9",
            text: "#0F172A",
            muted: "rgba(15, 23, 42, 0.60)",
            surface: "rgba(255, 255, 255, 0.72)",
            shadow: "0 16px 40px rgba(2, 6, 23, 0.10)",
          }
        : {
            bg: "#0B0F14",
            text: "#E5E7EB",
            muted: "rgba(229, 231, 235, 0.62)",
            surface: "rgba(255, 255, 255, 0.07)",
            shadow: "0 18px 48px rgba(0, 0, 0, 0.45)",
          };

    const luxury = keywordIsLuxury
      ? mode === "light"
        ? {
            surface: "rgba(255, 255, 255, 0.66)",
            shadow: "0 20px 55px rgba(2, 6, 23, 0.14)",
            blur: "14px",
          }
        : {
            surface: "rgba(255, 255, 255, 0.08)",
            shadow: "0 22px 60px rgba(0, 0, 0, 0.55)",
            blur: "16px",
          }
      : { blur: "12px" };

    const computedAccent = accent ?? (mode === "light" ? "#9CA3AF" : "#94A3B8");

    return {
      "--bg": base.bg,
      "--surface": luxury.surface ?? base.surface,
      "--text": base.text,
      "--muted": base.muted,
      "--accent": computedAccent,
      "--accent-contrast": accentContrast,
      "--radius": `${radius}px`,
      "--shadow": luxury.shadow ?? base.shadow,
      "--blur": luxury.blur ?? "12px",
      "--space-1": `${space.s1}px`,
      "--space-2": `${space.s2}px`,
      "--space-3": `${space.s3}px`,
      "--space-4": `${space.s4}px`,
    } as Record<string, string>;
  }, [accent, accentContrast, density, keywordIsLuxury, mode, radius]);

  const tokensBlock = useMemo(() => {
    const keys = [
      "--bg",
      "--surface",
      "--text",
      "--muted",
      "--accent",
      "--accent-contrast",
      "--radius",
      "--shadow",
      "--blur",
      "--space-1",
      "--space-2",
      "--space-3",
      "--space-4",
    ] as const;

    const lines = keys.map((k) => `  ${k}: ${tokenVars[k]};`);
    return `:root {\n${lines.join("\n")}\n}`;
  }, [tokenVars]);

  function handleCopy() {
    setCopyNotice(null);
    const text = tokensBlock;

    // Clipboard is only available on https / localhost; fallback gracefully.
    const doAfter = (ok: boolean) => {
      setCopyNotice(ok ? "Copied tokens to clipboard." : "Copy failed. Select and copy manually.");
      window.setTimeout(() => setCopyNotice(null), 1600);
    };

    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => doAfter(true))
        .catch(() => doAfter(false));
      return;
    }

    doAfter(false);
  }

  function handleReset() {
    setMode("light");
    setTheme("");
    setRadius(14);
    setDensity("normal");
    setKeyword("");
    setCustomAccent("");
    setCopyNotice(null);
  }

  const showEmpty = !hasTheme && !customAccentActive;
  const hasValidationError = customAccentActive && !customAccentValid;

  return (
    <div className="min-h-[calc(100vh-64px)]">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Vibe — UI tokens preview</h1>
          <p className="text-sm text-black/60 dark:text-white/60">
            AI-assisted UI iteration demo: small inputs → calm, premium preview + copyable CSS variables.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
          {/* Controls */}
          <div className="space-y-6">
            <section className="rounded-2xl border border-black/10 bg-white/60 p-5 shadow-sm backdrop-blur-[6px] dark:border-white/10 dark:bg-white/5">
              <div className="mb-4">
                <div className="text-sm font-medium">Controls</div>
                <div className="text-xs text-black/60 dark:text-white/60">
                  Keep it restrained: one accent, consistent radius & spacing.
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs text-black/60 dark:text-white/60">Accent theme</label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value as AccentThemeId)}
                    className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-black/30 dark:text-white"
                  >
                    <option value="">Select a theme…</option>
                    <option value="sunset_coral">sunset coral</option>
                    <option value="cool_graphite">cool graphite</option>
                    <option value="mint_haze">mint haze</option>
                  </select>
                  <div className="text-[11px] text-black/50 dark:text-white/50">
                    Or override with a custom accent below.
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-black/60 dark:text-white/60">Custom accent (optional)</label>
                  <input
                    value={customAccent}
                    onChange={(e) => setCustomAccent(e.target.value)}
                    placeholder="#RRGGBB"
                    className={[
                      "w-full rounded-xl border bg-white px-3 py-2 text-sm font-mono outline-none transition focus:ring-2 dark:bg-black/30 dark:text-white",
                      hasValidationError
                        ? "border-red-300 focus:ring-red-200 dark:border-red-400/50"
                        : "border-black/10 focus:ring-black/10 dark:border-white/10",
                    ].join(" ")}
                    spellCheck={false}
                  />
                  {hasValidationError ? (
                    <div className="text-[11px] text-red-600 dark:text-red-300">
                      Invalid hex color. Use #RRGGBB.
                    </div>
                  ) : (
                    <div className="text-[11px] text-black/50 dark:text-white/50">
                      Validation state appears for invalid hex.
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-black/60 dark:text-white/60">Radius</label>
                    <select
                      value={radius}
                      onChange={(e) => setRadius(Number(e.target.value) as 12 | 14 | 16)}
                      className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-black/30 dark:text-white"
                    >
                      <option value={12}>12</option>
                      <option value={14}>14</option>
                      <option value={16}>16</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-black/60 dark:text-white/60">Spacing</label>
                    <select
                      value={density}
                      onChange={(e) => setDensity(e.target.value as Density)}
                      className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-black/30 dark:text-white"
                    >
                      <option value="compact">compact</option>
                      <option value="normal">normal</option>
                      <option value="roomy">roomy</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-black/60 dark:text-white/60">Keyword (optional)</label>
                    <input
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                      placeholder='Try "luxury"'
                      className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-black/30 dark:text-white"
                      spellCheck={false}
                    />
                    <div className="text-[11px] text-black/50 dark:text-white/50">
                      Only <span className="font-medium">luxury</span> is interpreted (restrained premium minimalism).
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-black/60 dark:text-white/60">Background</label>
                    <select
                      value={mode}
                      onChange={(e) => setMode(e.target.value as Mode)}
                      className="w-full rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-black/10 dark:border-white/10 dark:bg-black/30 dark:text-white"
                    >
                      <option value="light">light</option>
                      <option value="dark">dark</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm transition hover:shadow-sm active:scale-[0.99] dark:border-white/10 dark:bg-black/30 dark:text-white"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </section>

            {/* Tokens */}
            <section className="rounded-2xl border border-black/10 bg-white/60 p-5 shadow-sm backdrop-blur-[6px] dark:border-white/10 dark:bg-white/5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">Tokens</div>
                  <div className="text-xs text-black/60 dark:text-white/60">
                    Copyable CSS variables (preview is driven by these).
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="rounded-xl px-3 py-2 text-sm transition active:scale-[0.99]"
                  style={{
                    background: tokenVars["--accent"],
                    color: tokenVars["--accent-contrast"],
                    boxShadow: "0 10px 24px rgba(0,0,0,0.12)",
                  }}
                  disabled={hasValidationError}
                  title={hasValidationError ? "Fix invalid accent first" : "Copy tokens"}
                >
                  Copy
                </button>
              </div>

              {copyNotice ? (
                <div className="mb-3 rounded-xl border border-black/10 bg-white px-3 py-2 text-xs text-black/70 dark:border-white/10 dark:bg-black/30 dark:text-white/80">
                  {copyNotice}
                </div>
              ) : null}

              <pre className="overflow-x-auto rounded-2xl border border-black/10 bg-white p-4 text-xs leading-relaxed text-black/80 dark:border-white/10 dark:bg-black/30 dark:text-white/80">
{tokensBlock}
              </pre>
            </section>
          </div>

          {/* Preview */}
          <div
            className="rounded-3xl p-(--space-4)"
            style={
              {
                ...tokenVars,
                background: tokenVars["--bg"],
                color: tokenVars["--text"],
                transition: "background 160ms ease, color 160ms ease",
              } as React.CSSProperties
            }
          >
            <div className="mb-(--space-4) space-y-2">
              <div className="text-2xl font-semibold tracking-tight">
                {keywordIsLuxury ? "Restrained premium preview" : "Calm modern preview"}
              </div>
              <div className="text-sm" style={{ color: tokenVars["--muted"] }}>
                Tweak inputs on the left. Tokens update instantly, and the preview reads from CSS variables.
              </div>
            </div>

            {showEmpty ? (
              <div
                className="rounded-(--radius) p-(--space-4)"
                style={{
                  background: tokenVars["--surface"],
                  boxShadow: tokenVars["--shadow"],
                  backdropFilter: `blur(${tokenVars["--blur"]})`,
                  WebkitBackdropFilter: `blur(${tokenVars["--blur"]})`,
                }}
              >
                <div className="text-sm font-medium">Empty state</div>
                <div className="mt-1 text-sm" style={{ color: tokenVars["--muted"] }}>
                  Select an accent theme (or enter a valid custom accent) to generate a premium preview.
                </div>
                <div className="mt-(--space-3) flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-(--radius) px-4 py-2 text-sm opacity-60"
                    style={{
                      background: tokenVars["--accent"],
                      color: tokenVars["--accent-contrast"],
                      boxShadow: "0 10px 24px rgba(0,0,0,0.10)",
                    }}
                    disabled
                  >
                    Primary action
                  </button>
                  <button
                    type="button"
                    className="rounded-(--radius) px-4 py-2 text-sm opacity-60"
                    style={{
                      background: "rgba(255,255,255,0.10)",
                      color: tokenVars["--text"],
                      border: "1px solid rgba(255,255,255,0.16)",
                    }}
                    disabled
                  >
                    Secondary
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid gap-(--space-4) lg:grid-cols-2">
                {/* Card */}
                <div
                  className="rounded-(--radius) p-(--space-4)"
                  style={{
                    background: tokenVars["--surface"],
                    boxShadow: tokenVars["--shadow"],
                    backdropFilter: `blur(${tokenVars["--blur"]})`,
                    WebkitBackdropFilter: `blur(${tokenVars["--blur"]})`,
                    border: mode === "light" ? "1px solid rgba(2,6,23,0.06)" : "1px solid rgba(255,255,255,0.10)",
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-semibold tracking-tight">Product card</div>
                      <div className="mt-1 text-sm" style={{ color: tokenVars["--muted"] }}>
                        A calm surface with subtle depth, generous spacing, and a single accent.
                      </div>
                    </div>

                    <span
                      className="inline-flex items-center rounded-full px-3 py-1 text-xs"
                      style={{
                        background:
                          mode === "light"
                            ? "rgba(2,6,23,0.06)"
                            : "rgba(255,255,255,0.10)",
                        color: tokenVars["--text"],
                      }}
                    >
                      {keywordIsLuxury ? "premium" : "preview"}
                    </span>
                  </div>

                  {/* Input */}
                  <div className="mt-(--space-4) space-y-2">
                    <label className="text-xs" style={{ color: tokenVars["--muted"] }}>
                      Email
                    </label>
                    <input
                      placeholder="you@domain.com"
                      className="w-full rounded-(--radius) px-3 py-2 text-sm outline-none transition"
                      style={{
                        background: mode === "light" ? "rgba(255,255,255,0.78)" : "rgba(0,0,0,0.20)",
                        border: mode === "light" ? "1px solid rgba(2,6,23,0.08)" : "1px solid rgba(255,255,255,0.12)",
                        color: tokenVars["--text"],
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
                      }}
                    />
                    <div className="text-[11px]" style={{ color: tokenVars["--muted"] }}>
                      Label + input + muted helper text for hierarchy.
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="mt-(--space-4) flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="rounded-(--radius) px-4 py-2 text-sm transition active:scale-[0.99]"
                      style={{
                        background: tokenVars["--accent"],
                        color: tokenVars["--accent-contrast"],
                        boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget.style.transform = "translateY(-1px)");
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget.style.transform = "translateY(0px)");
                      }}
                    >
                      Primary action
                    </button>

                    <button
                      type="button"
                      className="rounded-(--radius) px-4 py-2 text-sm transition active:scale-[0.99]"
                      style={{
                        background: mode === "light" ? "rgba(2,6,23,0.04)" : "rgba(255,255,255,0.08)",
                        color: tokenVars["--text"],
                        border: mode === "light" ? "1px solid rgba(2,6,23,0.06)" : "1px solid rgba(255,255,255,0.10)",
                      }}
                    >
                      Secondary
                    </button>
                  </div>

                  {/* Badges */}
                  <div className="mt-(--space-3) flex flex-wrap gap-2">
                    <span
                      className="inline-flex items-center rounded-full px-3 py-1 text-xs"
                      style={{
                        background: mode === "light" ? "rgba(16,185,129,0.12)" : "rgba(16,185,129,0.16)",
                        color: mode === "light" ? "rgba(6,95,70,1)" : "rgba(167,243,208,1)",
                      }}
                    >
                      success
                    </span>
                    <span
                      className="inline-flex items-center rounded-full px-3 py-1 text-xs"
                      style={{
                        background:
                          mode === "light"
                            ? "rgba(59,130,246,0.10)"
                            : "rgba(59,130,246,0.16)",
                        color:
                          mode === "light"
                            ? "rgba(30,64,175,1)"
                            : "rgba(191,219,254,1)",
                      }}
                    >
                      info
                    </span>
                  </div>
                </div>

                {/* Tokens-in-preview mini panel */}
                <div
                  className="rounded-(--radius) p-(--space-4)"
                  style={{
                    background: tokenVars["--surface"],
                    boxShadow: tokenVars["--shadow"],
                    backdropFilter: `blur(${tokenVars["--blur"]})`,
                    WebkitBackdropFilter: `blur(${tokenVars["--blur"]})`,
                    border: mode === "light" ? "1px solid rgba(2,6,23,0.06)" : "1px solid rgba(255,255,255,0.10)",
                  }}
                >
                  <div className="text-sm font-medium">Live tokens</div>
                  <div className="mt-1 text-sm" style={{ color: tokenVars["--muted"] }}>
                    Small set, high leverage. Designed to feel consistent and deploy-safe.
                  </div>

                  <div className="mt-(--space-4) grid gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: tokenVars["--muted"] }}>
                        Accent
                      </span>
                      <span className="font-mono text-xs">{tokenVars["--accent"]}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: tokenVars["--muted"] }}>
                        Radius
                      </span>
                      <span className="font-mono text-xs">{tokenVars["--radius"]}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: tokenVars["--muted"] }}>
                        Blur
                      </span>
                      <span className="font-mono text-xs">{tokenVars["--blur"]}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs" style={{ color: tokenVars["--muted"] }}>
                        Space
                      </span>
                      <span className="font-mono text-xs">
                        {tokenVars["--space-1"]} / {tokenVars["--space-2"]} / {tokenVars["--space-3"]} /{" "}
                        {tokenVars["--space-4"]}
                      </span>
                    </div>
                  </div>

                  <div className="mt-(--space-4) text-[11px]" style={{ color: tokenVars["--muted"] }}>
                    {keywordIsLuxury
                      ? "Luxury keyword applies restrained premium adjustments (blur/shadow/surface)."
                      : "Tip: enter “luxury” to slightly tighten the premium feel without changing the layout."}
                  </div>
                </div>
              </div>
            )}

            {/* Soft footer */}
            <div className="mt-(--space-4) text-xs" style={{ color: tokenVars["--muted"] }}>
              No external APIs. Tokens update instantly. Built for deploy-safe UI iteration.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}