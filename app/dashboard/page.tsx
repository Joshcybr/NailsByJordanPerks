"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────
type Profile = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  visits: number;
};

// ─── Constants ────────────────────────────────────────────────────────────────
const CYCLE = 10; // visits per full reward cycle
const CARD_DOTS = Array.from({ length: CYCLE }, (_, i) => i + 1);
const TOKEN_TTL_SECONDS = 90; // how long each QR code stays valid
const REFRESH_BUFFER_SECONDS = 15; // regenerate a bit before it actually expires

function tierInfo(totalVisits: number) {
  const visitsInCycle = totalVisits % CYCLE;
  const cycleNumber = Math.floor(totalVisits / CYCLE);

  if (visitsInCycle >= 5 && visitsInCycle < CYCLE) {
    return {
      visitsInCycle,
      cycleNumber,
      unlockedLabel: "10% OFF unlocked",
      nextLabel: "25% OFF",
      toNext: CYCLE - visitsInCycle,
      progressPct: (visitsInCycle / CYCLE) * 100,
    };
  }
  if (visitsInCycle === 0 && totalVisits > 0) {
    return {
      visitsInCycle: 0,
      cycleNumber,
      unlockedLabel: "25% OFF unlocked",
      nextLabel: "10% OFF",
      toNext: 5,
      progressPct: 0,
    };
  }
  return {
    visitsInCycle,
    cycleNumber,
    unlockedLabel: null as string | null,
    nextLabel: "10% OFF",
    toNext: 5 - visitsInCycle,
    progressPct: (visitsInCycle / 5) * 100,
  };
}

function qrImageUrl(data: string, size = 300) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=12&color=1a1412&bgcolor=fdfaf8&data=${encodeURIComponent(data)}`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [signingOut, setSigningOut] = useState(false);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData?.user) {
        router.replace("/login");
        return;
      }

      const { data: profileRow, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone, visits")
        .eq("id", userData.user.id)
        .single();

      if (profileError) throw profileError;

      setProfile({
        id: profileRow.id,
        full_name: profileRow.full_name ?? "Member",
        email: profileRow.email ?? userData.user.email ?? "",
        phone: profileRow.phone ?? null,
        visits: profileRow.visits ?? 0,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Couldn't load your loyalty account.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  async function handleSignOut() {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <>
      <GlobalStyles />

      <div style={{ minHeight: "100vh", background: "var(--nude)", position: "relative" }}>
        <div style={{ position: "absolute", top: -160, right: -160, width: 480, height: 480, borderRadius: "50%", background: "radial-gradient(circle, var(--nude3) 0%, transparent 70%)", pointerEvents: "none" }} />

        <nav style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "22px 32px", position: "relative", zIndex: 2,
          borderBottom: "1px solid rgba(201,169,110,.18)",
        }}>
          <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
            <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.35rem", fontWeight: 500, lineHeight: 1.1 }}>
              Nails by Jordan
              <span style={{ display: "block", fontFamily: "'DM Sans', sans-serif", fontSize: ".6rem", letterSpacing: ".22em", textTransform: "uppercase", color: "var(--gold)", marginTop: 2, fontWeight: 400 }}>
                Luxury Nail Studio
              </span>
            </div>
          </Link>

          <button
            onClick={handleSignOut}
            disabled={signingOut}
            style={{
              background: "none", border: "1px solid rgba(201,169,110,.4)", borderRadius: 100,
              padding: "9px 20px", fontSize: ".72rem", letterSpacing: ".1em", textTransform: "uppercase",
              color: "var(--muted)", cursor: signingOut ? "not-allowed" : "pointer", fontWeight: 500,
            }}
          >
            {signingOut ? "Signing out…" : "Sign Out"}
          </button>
        </nav>

        <main style={{ maxWidth: 1080, margin: "0 auto", padding: "56px 32px 80px", position: "relative", zIndex: 1 }}>
          {loading && <LoadingState />}
          {!loading && error && <ErrorState message={error} onRetry={loadProfile} />}
          {!loading && !error && profile && <DashboardContent profile={profile} />}
        </main>
      </div>
    </>
  );
}

// ─── Dashboard content ─────────────────────────────────────────────────────────
function DashboardContent({ profile }: { profile: Profile }) {
  const tier = tierInfo(profile.visits);

  return (
    <>
      <div className="fade-in" style={{ marginBottom: 44 }}>
        <div style={{ fontSize: ".7rem", letterSpacing: ".2em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 10, display: "flex", alignItems: "center", gap: 8, fontWeight: 500 }}>
          <span style={{ display: "inline-block", width: 20, height: 1, background: "var(--gold)" }} />
          Welcome back
        </div>
        <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 300, color: "var(--ink)", lineHeight: 1.1 }}>
          Hello, <em style={{ fontStyle: "italic", fontFamily: "'Playfair Display', Georgia, serif", color: "var(--gold)" }}>{profile.full_name.split(" ")[0]}</em>
        </h1>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }} className="dash-grid">
        {/* ── Left: loyalty card + progress ── */}
        <div className="fade-in" style={{ animationDelay: ".05s" }}>
          <div className="loyalty-card">
            <div className="card-brand">
              Nails by
              <strong>Jordan</strong>
            </div>

            <div className="card-dots">
              {CARD_DOTS.map((n) => (
                <div key={n} className={`dot${n <= (tier.visitsInCycle === 0 && profile.visits > 0 ? CYCLE : tier.visitsInCycle) ? " filled" : ""}`} data-n={n} />
              ))}
            </div>

            <div className="card-name">Member</div>
            <div className="card-customer">{profile.full_name}</div>

            <div className="card-visits-row">
              <div>
                <div className="card-visits-label">Total Visits</div>
                <div className="card-visits-val">{profile.visits}</div>
              </div>
              <div className="card-badge">
                {tier.unlockedLabel ? tier.unlockedLabel : `${tier.toNext} to ${tier.nextLabel}`}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 24, background: "var(--white)", borderRadius: 18, padding: "22px 24px", border: "1px solid rgba(201,169,110,.15)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
              <span style={{ fontSize: ".68rem", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--muted)", fontWeight: 500 }}>
                Progress to {tier.nextLabel}
              </span>
              <span style={{ fontSize: ".78rem", color: "var(--gold)", fontWeight: 500 }}>
                {tier.unlockedLabel ? "Cycle complete ✦" : `${tier.toNext} visit${tier.toNext === 1 ? "" : "s"} to go`}
              </span>
            </div>
            <div style={{ background: "rgba(201,169,110,.15)", borderRadius: 100, height: 6, overflow: "hidden" }}>
              <div style={{ width: `${tier.progressPct}%`, height: "100%", background: "linear-gradient(90deg, var(--gold), var(--gold2))", borderRadius: 100, transition: "width .5s ease" }} />
            </div>
          </div>
        </div>

        {/* ── Right: rotating QR ── */}
        <div className="fade-in" style={{ animationDelay: ".1s" }}>
          <RotatingQrCard clientId={profile.id} />
        </div>
      </div>

      <div className="fade-in" style={{ animationDelay: ".15s", marginTop: 28, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }} data-tier-grid>
        {[
          { icon: "💅", label: "5 Visits", value: "10% OFF" },
          { icon: "👑", label: "10 Visits", value: "25% OFF" },
          { icon: "🔄", label: "Every Cycle", value: "Repeats Forever" },
        ].map((t) => (
          <div key={t.label} style={{ background: "var(--white)", borderRadius: 16, padding: "20px", textAlign: "center", border: "1px solid rgba(201,169,110,.15)" }}>
            <div style={{ fontSize: "1.4rem", marginBottom: 8 }}>{t.icon}</div>
            <div style={{ fontSize: ".65rem", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 4 }}>{t.label}</div>
            <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.3rem", color: "var(--gold)" }}>{t.value}</div>
          </div>
        ))}
      </div>
    </>
  );
}

// ─── Rotating QR card ───────────────────────────────────────────────────────────
function RotatingQrCard({ clientId }: { clientId: string }) {
  const [token, setToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(TOKEN_TTL_SECONDS);
  const [genError, setGenError] = useState("");
  const [generating, setGenerating] = useState(true);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const generateToken = useCallback(async () => {
    setGenerating(true);
    setGenError("");
    try {
      const expiry = new Date(Date.now() + TOKEN_TTL_SECONDS * 1000);
      const { data, error } = await supabase
        .from("checkin_tokens")
        .insert({ client_id: clientId, expires_at: expiry.toISOString() })
        .select("token, expires_at")
        .single();

      if (error) throw error;

      setToken(data.token);
      setExpiresAt(new Date(data.expires_at).getTime());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Couldn't generate a check-in code.";
      setGenError(msg);
    } finally {
      setGenerating(false);
    }
  }, [clientId]);

  // Generate the first token on mount
  useEffect(() => {
    generateToken();
  }, [generateToken]);

  // Live countdown + auto-refresh shortly before expiry
  useEffect(() => {
    if (!expiresAt) return;

    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.round((expiresAt - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining <= REFRESH_BUFFER_SECONDS && remaining > 0) {
        if (tickRef.current) clearInterval(tickRef.current);
        generateToken();
      } else if (remaining === 0) {
        if (tickRef.current) clearInterval(tickRef.current);
        generateToken();
      }
    }, 1000);

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [expiresAt, generateToken]);

  const payload = token ? `NBJ-CHECKIN:${token}` : "";
  const pct = Math.max(0, Math.min(100, (secondsLeft / TOKEN_TTL_SECONDS) * 100));

  return (
    <div style={{
      background: "var(--white)", borderRadius: "var(--radius-lg)", padding: "36px 32px",
      border: "1px solid rgba(201,169,110,.15)", textAlign: "center", height: "100%",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{ fontSize: ".7rem", letterSpacing: ".18em", textTransform: "uppercase", color: "var(--gold)", fontWeight: 500, marginBottom: 8 }}>
        Your Check-In Code
      </div>
      <p style={{ fontSize: ".82rem", color: "var(--muted)", marginBottom: 24, maxWidth: 300, lineHeight: 1.6, fontWeight: 300 }}>
        Show this at the front desk. It refreshes automatically every {TOKEN_TTL_SECONDS} seconds and can only be scanned once.
      </p>

      <div style={{
        background: "var(--nude)", borderRadius: 20, padding: 18,
        border: "1px solid rgba(201,169,110,.2)", marginBottom: 16,
        width: 260, height: 260, display: "flex", alignItems: "center", justifyContent: "center",
        position: "relative",
      }}>
        {generating && !token && (
          <span className="spinner-lg" />
        )}
        {genError && !generating && (
          <div style={{ padding: 20 }}>
            <p style={{ fontSize: ".78rem", color: "var(--error)", marginBottom: 12 }}>⚠️ {genError}</p>
            <button onClick={generateToken} style={{ background: "var(--black)", color: "var(--white)", border: "none", borderRadius: 100, padding: "8px 18px", fontSize: ".72rem", cursor: "pointer" }}>
              Retry
            </button>
          </div>
        )}
        {token && !genError && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={qrImageUrl(payload, 260)}
            alt="Your rotating loyalty check-in QR code"
            width={224}
            height={224}
            style={{ display: "block", borderRadius: 10 }}
          />
        )}
      </div>

      {token && !genError && (
        <>
          <div style={{ width: "100%", maxWidth: 224, marginBottom: 6 }}>
            <div style={{ background: "rgba(201,169,110,.15)", borderRadius: 100, height: 4, overflow: "hidden" }}>
              <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg, var(--gold), var(--gold2))", borderRadius: 100, transition: "width 1s linear" }} />
            </div>
          </div>
          <div style={{ fontSize: ".68rem", color: "var(--muted)", letterSpacing: ".04em" }}>
            Refreshes in {secondsLeft}s
          </div>
        </>
      )}
    </div>
  );
}

// ─── States ─────────────────────────────────────────────────────────────────
function LoadingState() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "100px 0", gap: 16 }}>
      <span className="spinner-lg" />
      <span style={{ fontSize: ".8rem", color: "var(--muted)", letterSpacing: ".06em" }}>Loading your loyalty account…</span>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div style={{ maxWidth: 460, margin: "80px auto", textAlign: "center" }}>
      <div style={{ fontSize: "1.6rem", marginBottom: 16 }}>⚠️</div>
      <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.6rem", fontWeight: 400, marginBottom: 10 }}>
        Something went wrong
      </h2>
      <p style={{ color: "var(--muted)", fontSize: ".85rem", lineHeight: 1.6, marginBottom: 24 }}>{message}</p>
      <button
        onClick={onRetry}
        style={{ background: "var(--black)", color: "var(--white)", border: "none", padding: "12px 28px", borderRadius: 100, fontSize: ".8rem", letterSpacing: ".06em", textTransform: "uppercase", fontWeight: 500, cursor: "pointer" }}
      >
        Try Again
      </button>
    </div>
  );
}

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
        --radius:18px;--radius-lg:28px;
      }
      *,*::before,*::after{box-sizing:border-box}
      body{font-family:'DM Sans','Segoe UI',sans-serif;color:var(--ink)}

      @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
      .fade-in{animation:fadeUp .5s ease both}

      @keyframes spin{to{transform:rotate(360deg)}}
      .spinner-lg{width:32px;height:32px;border:3px solid rgba(201,169,110,.2);border-top-color:var(--gold);border-radius:50%;animation:spin .8s linear infinite;display:inline-block}

      .loyalty-card {
        background: linear-gradient(140deg, #1a1412 0%, #2e2320 60%, #3d2e29 100%);
        border-radius: 24px;
        padding: 32px 28px;
        width: 100%;
        max-width: 380px;
        box-shadow: 0 32px 80px rgba(26,20,18,.28), 0 0 0 1px rgba(201,169,110,.12);
        position: relative;
        overflow: hidden;
      }
      .loyalty-card::before {
        content:'';position:absolute;top:-60px;right:-60px;width:200px;height:200px;
        background: radial-gradient(circle, rgba(201,169,110,.18), transparent 70%);
        border-radius:50%;
      }
      .card-brand{font-family:'Cormorant Garamond',Georgia,serif;font-size:1.1rem;font-weight:400;color:rgba(253,250,248,.7);letter-spacing:.08em;margin-bottom:28px}
      .card-brand strong{color:var(--gold2);display:block;font-size:1.3rem}
      .card-dots{display:flex;gap:8px;margin-bottom:24px;flex-wrap:wrap}
      .dot{width:28px;height:28px;border-radius:50%;border:1.5px solid rgba(201,169,110,.3);display:flex;align-items:center;justify-content:center;font-size:.58rem;color:rgba(253,250,248,.35)}
      .dot.filled{background:var(--gold);border-color:var(--gold);color:var(--black)}
      .dot.filled::after{content:'✓';font-size:.65rem;font-weight:700}
      .dot:not(.filled)::after{content:attr(data-n)}
      .card-name{font-size:.7rem;letter-spacing:.14em;text-transform:uppercase;color:rgba(253,250,248,.45);margin-bottom:4px}
      .card-customer{font-family:'Cormorant Garamond',Georgia,serif;font-size:1.3rem;color:var(--white);letter-spacing:.04em}
      .card-visits-row{display:flex;justify-content:space-between;align-items:flex-end;margin-top:20px;padding-top:16px;border-top:1px solid rgba(201,169,110,.15)}
      .card-visits-label{font-size:.65rem;letter-spacing:.15em;text-transform:uppercase;color:rgba(253,250,248,.4)}
      .card-visits-val{font-family:'Cormorant Garamond',Georgia,serif;font-size:2rem;color:var(--gold2);line-height:1}
      .card-badge{background:rgba(201,169,110,.15);border:1px solid rgba(201,169,110,.3);border-radius:100px;padding:5px 12px;font-size:.6rem;letter-spacing:.08em;color:var(--gold2);text-align:right;max-width:150px}

      @media (max-width: 860px) {
        .dash-grid{grid-template-columns:1fr !important}
        [data-tier-grid]{grid-template-columns:1fr !important}
      }
    `}</style>
  );
}