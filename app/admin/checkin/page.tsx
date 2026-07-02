"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Script from "next/script";

// ─── Types ────────────────────────────────────────────────────────────────────
type Result = {
  full_name: string;
  visits: number;
} | null;

declare global {
  interface Window {
    Html5Qrcode: any;
  }
}

const CYCLE = 10;

function rewardStatus(visits: number) {
  const inCycle = visits % CYCLE;
  if (inCycle === 0 && visits > 0) return { label: "25% OFF unlocked — cycle reset", tone: "gold" as const };
  if (inCycle >= 5) return { label: "10% OFF unlocked", tone: "gold" as const };
  return { label: `${5 - inCycle} more visit${5 - inCycle === 1 ? "" : "s"} to 10% OFF`, tone: "muted" as const };
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function StaffCheckinPage() {
  const [scriptReady, setScriptReady] = useState(false);
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result>(null);

  const scannerRef = useRef<any>(null);
  const readerId = "qr-reader";

  // Restore PIN for this browser session so staff don't retype it between scans
  useEffect(() => {
    const saved = sessionStorage.getItem("nbj_staff_pin");
    if (saved) {
      setPin(saved);
      setUnlocked(true);
    }
  }, []);

  useEffect(() => {
    return () => {
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    if (!pin.trim()) return;
    sessionStorage.setItem("nbj_staff_pin", pin);
    setUnlocked(true);
  }

  function handleLock() {
    stopScanner();
    sessionStorage.removeItem("nbj_staff_pin");
    setPin("");
    setUnlocked(false);
    setResult(null);
    setError("");
  }

  async function startScanner() {
    if (!scriptReady || !window.Html5Qrcode) return;
    setError("");
    setResult(null);
    setScanning(true);

    try {
      const scanner = new window.Html5Qrcode(readerId);
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        async (decodedText: string) => {
          await stopScanner();
          setScanning(false);
          submitCode(decodedText);
        },
        () => {
          // per-frame decode failures — ignore, expected while aiming camera
        }
      );
    } catch {
      setError("Couldn't access the camera. Check browser permissions, or use manual entry below.");
      setScanning(false);
    }
  }

  async function stopScanner() {
    const scanner = scannerRef.current;
    if (scanner) {
      try {
        await scanner.stop();
        scanner.clear();
      } catch {
        // already stopped
      }
      scannerRef.current = null;
    }
  }

  async function submitCode(code: string) {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, pin }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          handleLock();
          setError("Staff PIN was rejected. Please sign in again.");
        } else {
          setError(data.error || "Check-in failed.");
        }
        return;
      }

      setResult(data.profile);
      setManualCode("");
    } catch {
      setError("Network error — check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!manualCode.trim()) return;
    submitCode(manualCode.trim());
  }

  return (
    <>
      <Script
        src="https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js"
        strategy="afterInteractive"
        onReady={() => setScriptReady(true)}
        onLoad={() => setScriptReady(true)}
      />
      <GlobalStyles />

      <div style={{ minHeight: "100vh", background: "var(--nude)", position: "relative" }}>
        <div style={{ position: "absolute", top: -160, right: -160, width: 480, height: 480, borderRadius: "50%", background: "radial-gradient(circle, var(--nude3) 0%, transparent 70%)", pointerEvents: "none" }} />

        {/* Nav */}
        <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 32px", position: "relative", zIndex: 2, borderBottom: "1px solid rgba(201,169,110,.18)" }}>
          <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
            <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.3rem", fontWeight: 500, lineHeight: 1.1 }}>
              Nails by Jordan
              <span style={{ display: "block", fontFamily: "'DM Sans', sans-serif", fontSize: ".58rem", letterSpacing: ".22em", textTransform: "uppercase", color: "var(--gold)", marginTop: 2, fontWeight: 400 }}>
                Staff Check-In
              </span>
            </div>
          </Link>
          {unlocked && (
            <button onClick={handleLock} style={lockBtnStyle}>Lock</button>
          )}
        </nav>

        <main style={{ maxWidth: 520, margin: "0 auto", padding: "56px 24px 80px", position: "relative", zIndex: 1 }}>
          {!unlocked ? (
            <PinGate pin={pin} setPin={setPin} onSubmit={handleUnlock} />
          ) : (
            <>
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: ".68rem", letterSpacing: ".2em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 8, fontWeight: 500 }}>
                  Ready to scan
                </div>
                <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.9rem", fontWeight: 300, color: "var(--ink)" }}>
                  Scan a client&apos;s <em style={{ fontStyle: "italic", fontFamily: "'Playfair Display', Georgia, serif", color: "var(--gold)" }}>QR code</em>
                </h1>
              </div>

              {/* Scanner card */}
              <div style={{ background: "var(--white)", borderRadius: "var(--radius-lg)", border: "1px solid rgba(201,169,110,.15)", padding: 24, marginBottom: 20 }}>
                <div
                  id={readerId}
                  style={{
                    width: "100%", minHeight: scanning ? 280 : 0, borderRadius: 16, overflow: "hidden",
                    background: scanning ? "var(--black)" : "transparent",
                  }}
                />
                {!scanning && (
                  <button onClick={startScanner} disabled={!scriptReady} className="btn-gold-shimmer" style={scanBtnStyle}>
                    {scriptReady ? "Start Camera Scan" : "Loading scanner…"}
                  </button>
                )}
                {scanning && (
                  <button onClick={() => { stopScanner(); setScanning(false); }} style={stopBtnStyle}>
                    Stop Camera
                  </button>
                )}
              </div>

              {/* Manual fallback */}
              <details style={{ marginBottom: 20 }}>
                <summary style={{ fontSize: ".78rem", color: "var(--muted)", cursor: "pointer", letterSpacing: ".04em" }}>
                  Camera not working? Enter code manually
                </summary>
                <form onSubmit={handleManualSubmit} style={{ display: "flex", gap: 10, marginTop: 12 }}>
                  <input
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="NBJ-LOYALTY:xxxxxxxx-xxxx-…"
                    style={{ flex: 1, padding: "12px 14px", borderRadius: 10, border: "1.5px solid rgba(201,169,110,.25)", fontSize: ".85rem", fontFamily: "monospace", outline: "none" }}
                  />
                  <button type="submit" style={{ background: "var(--black)", color: "var(--white)", border: "none", borderRadius: 10, padding: "0 20px", fontSize: ".8rem", fontWeight: 500, cursor: "pointer" }}>
                    Submit
                  </button>
                </form>
              </details>

              {loading && (
                <div style={{ textAlign: "center", padding: "20px 0", color: "var(--muted)", fontSize: ".85rem" }}>
                  <span className="spinner-lg" style={{ marginBottom: 10 }} /><br />
                  Recording visit…
                </div>
              )}

              {error && (
                <div style={{ background: "rgba(192,97,107,.08)", border: "1px solid rgba(192,97,107,.3)", borderRadius: 12, padding: "14px 18px", fontSize: ".85rem", color: "var(--error)", marginBottom: 20 }}>
                  ⚠️ {error}
                </div>
              )}

              {result && <ResultCard result={result} />}
            </>
          )}
        </main>
      </div>
    </>
  );
}

// ─── PIN gate ─────────────────────────────────────────────────────────────────
function PinGate({ pin, setPin, onSubmit }: { pin: string; setPin: (v: string) => void; onSubmit: (e: React.FormEvent) => void }) {
  return (
    <div style={{ maxWidth: 340, margin: "60px auto 0", textAlign: "center" }}>
      <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg, var(--gold), var(--gold2))", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: "1.4rem" }}>
        🔒
      </div>
      <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.7rem", fontWeight: 300, marginBottom: 8 }}>
        Staff access
      </h1>
      <p style={{ fontSize: ".82rem", color: "var(--muted)", marginBottom: 24 }}>
        Enter the studio PIN to open the check-in scanner.
      </p>
      <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <input
          type="password"
          inputMode="numeric"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="Staff PIN"
          autoFocus
          style={{ padding: "14px 16px", borderRadius: 12, border: "1.5px solid rgba(201,169,110,.25)", fontSize: "1rem", textAlign: "center", letterSpacing: ".2em", outline: "none" }}
        />
        <button type="submit" className="btn-gold-shimmer" style={{ padding: "14px", border: "none", borderRadius: 12, fontSize: ".82rem", fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--black)", cursor: "pointer" }}>
          Unlock Scanner
        </button>
      </form>
    </div>
  );
}

// ─── Result card ──────────────────────────────────────────────────────────────
function ResultCard({ result }: { result: NonNullable<Result> }) {
  const reward = rewardStatus(result.visits);
  return (
    <div style={{ background: "linear-gradient(140deg, #1a1412 0%, #2e2320 100%)", borderRadius: "var(--radius-lg)", padding: "28px 26px", color: "var(--white)", textAlign: "center" }}>
      <div style={{ fontSize: "1.6rem", marginBottom: 10 }}>✨</div>
      <div style={{ fontSize: ".68rem", letterSpacing: ".18em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 6 }}>Visit recorded</div>
      <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.6rem", marginBottom: 4 }}>{result.full_name}</div>
      <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "2.6rem", color: "var(--gold2)", lineHeight: 1, margin: "10px 0" }}>{result.visits}</div>
      <div style={{ fontSize: ".62rem", letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(253,250,248,.45)", marginBottom: 16 }}>total visits</div>
      <div style={{
        display: "inline-block", background: "rgba(201,169,110,.15)", border: "1px solid rgba(201,169,110,.3)",
        borderRadius: 100, padding: "6px 16px", fontSize: ".72rem", color: "var(--gold2)",
      }}>
        {reward.label}
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const lockBtnStyle: React.CSSProperties = {
  background: "none", border: "1px solid rgba(201,169,110,.4)", borderRadius: 100,
  padding: "8px 18px", fontSize: ".7rem", letterSpacing: ".1em", textTransform: "uppercase",
  color: "var(--muted)", cursor: "pointer", fontWeight: 500,
};
const scanBtnStyle: React.CSSProperties = {
  width: "100%", marginTop: 16, padding: "14px", border: "none", borderRadius: 12,
  fontSize: ".82rem", fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase",
  color: "var(--black)", cursor: "pointer",
};
const stopBtnStyle: React.CSSProperties = {
  width: "100%", marginTop: 16, padding: "14px", border: "1px solid rgba(192,97,107,.4)",
  borderRadius: 12, fontSize: ".82rem", fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase",
  color: "var(--error)", background: "none", cursor: "pointer",
};

// ─── Global styles ────────────────────────────────────────────────────────────
function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400&family=DM+Sans:wght@300;400;500&family=Playfair+Display:ital,wght@1,400&display=swap');
      :root {
        --nude:#f5ede6;--nude2:#eeddd3;--nude3:#e8cfc2;
        --gold:#c9a96e;--gold2:#e8c98a;--gold-dim:#b8935a;
        --black:#1a1412;--ink:#2e2320;--muted:#7a6a63;
        --white:#fdfaf8;--error:#c0616b;
        --radius:18px;--radius-lg:24px;
      }
      *,*::before,*::after{box-sizing:border-box}
      body{font-family:'DM Sans','Segoe UI',sans-serif;color:var(--ink)}
      @keyframes spin{to{transform:rotate(360deg)}}
      .spinner-lg{width:24px;height:24px;border:3px solid rgba(201,169,110,.2);border-top-color:var(--gold);border-radius:50%;animation:spin .8s linear infinite;display:inline-block}
      .btn-gold-shimmer{background:linear-gradient(105deg,var(--gold-dim) 0%,var(--gold2) 40%,var(--gold) 50%,var(--gold2) 60%,var(--gold-dim) 100%);background-size:200% auto;transition:background-position .6s ease}
      .btn-gold-shimmer:hover:not(:disabled){background-position:right center}
      .btn-gold-shimmer:disabled{opacity:.6;cursor:not-allowed}
      #qr-reader video { border-radius: 16px; }
    `}</style>
  );
}