"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────
type FormState = {
  email: string;
  password: string;
};

type FieldError = Partial<Record<keyof FormState, string>>;

// ─── Validation ───────────────────────────────────────────────────────────────
function validate(form: FormState): FieldError {
  const errors: FieldError = {};
  if (!form.email.trim()) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = "Please enter a valid email";
  if (!form.password) errors.password = "Password is required";
  else if (form.password.length < 6)
    errors.password = "Password must be at least 6 characters";
  return errors;
}

// ─── Eye icon (show/hide password) ───────────────────────────────────────────
function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

// ─── Decorative nail art dots ─────────────────────────────────────────────────
function NailDots() {
  const dots = [
    { size: 120, top: "8%",  left: "6%",  opacity: 0.07, delay: "0s" },
    { size: 60,  top: "18%", left: "82%", opacity: 0.09, delay: "0.4s" },
    { size: 90,  top: "68%", left: "88%", opacity: 0.06, delay: "0.8s" },
    { size: 50,  top: "75%", left: "4%",  opacity: 0.08, delay: "1.2s" },
    { size: 30,  top: "45%", left: "94%", opacity: 0.1,  delay: "0.2s" },
    { size: 75,  top: "90%", left: "50%", opacity: 0.05, delay: "1s"   },
  ];
  return (
    <>
      {dots.map((d, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: d.top, left: d.left,
            width: d.size, height: d.size,
            borderRadius: "50%",
            border: `1.5px solid rgba(201,169,110,${d.opacity * 6})`,
            background: `radial-gradient(circle, rgba(201,169,110,${d.opacity}) 0%, transparent 70%)`,
            animation: `pulse 4s ease-in-out infinite`,
            animationDelay: d.delay,
            pointerEvents: "none",
          }}
        />
      ))}
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({ email: "", password: "" });
  const [errors, setErrors] = useState<FieldError>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Trigger entrance animation after mount
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (errors[name as keyof FormState]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (submitError) setSubmitError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fieldErrors = validate(form);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    setSubmitError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });

      if (error) throw error;
      if (!data.session) throw new Error("Sign in succeeded but no session was returned.");

      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid email or password.";
      setSubmitError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400&family=DM+Sans:wght@300;400;500&family=Playfair+Display:ital,wght@1,400&display=swap');

        :root {
          --nude:     #f5ede6;
          --nude2:    #eeddd3;
          --nude3:    #e8cfc2;
          --gold:     #c9a96e;
          --gold2:    #e8c98a;
          --gold-dim: #b8935a;
          --black:    #1a1412;
          --ink:      #2e2320;
          --muted:    #7a6a63;
          --white:    #fdfaf8;
          --error:    #c0616b;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { height: 100%; }

        body {
          font-family: 'DM Sans', 'Segoe UI', sans-serif;
          background: var(--black);
          min-height: 100vh;
          overflow-x: hidden;
        }

        /* Noise grain */
        body::before {
          content: '';
          position: fixed; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
          background-size: 200px 200px;
          pointer-events: none;
          z-index: 0;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1);   opacity: 1; }
          50%       { transform: scale(1.08); opacity: 0.7; }
        }

        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }

        /* Card entrance */
        .login-card {
          animation: scaleIn .5s cubic-bezier(.22,.68,0,1.2) forwards;
        }

        .field-row { animation: fadeUp .45s ease forwards; opacity: 0; }
        .field-row:nth-child(1) { animation-delay: .18s; }
        .field-row:nth-child(2) { animation-delay: .26s; }
        .submit-row { animation: fadeUp .45s ease .34s forwards; opacity: 0; }
        .extras-row { animation: fadeUp .45s ease .42s forwards; opacity: 0; }

        /* Input focus glow */
        .input-wrap:focus-within .input-border {
          border-color: rgba(201,169,110,.7);
          box-shadow: 0 0 0 3px rgba(201,169,110,.1);
        }
        .input-wrap:focus-within label {
          color: var(--gold);
        }

        /* Gold shimmer button */
        .btn-gold-shimmer {
          background: linear-gradient(
            105deg,
            var(--gold-dim) 0%,
            var(--gold2)    40%,
            var(--gold)     50%,
            var(--gold2)    60%,
            var(--gold-dim) 100%
          );
          background-size: 200% auto;
          transition: background-position .6s ease, transform .2s, box-shadow .2s;
        }
        .btn-gold-shimmer:hover:not(:disabled) {
          background-position: right center;
          transform: translateY(-2px);
          box-shadow: 0 12px 36px rgba(201,169,110,.4);
        }
        .btn-gold-shimmer:active:not(:disabled) {
          transform: translateY(0);
        }
        .btn-gold-shimmer:disabled {
          opacity: .75;
          cursor: not-allowed;
        }

        /* Divider */
        .divider {
          display: flex; align-items: center; gap: 14px;
          color: rgba(253,250,248,.2);
          font-size: .7rem; letter-spacing: .14em; text-transform: uppercase;
        }
        .divider::before, .divider::after {
          content: ''; flex: 1; height: 1px;
          background: rgba(201,169,110,.15);
        }

        /* Error shake */
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%      { transform: translateX(-6px); }
          40%      { transform: translateX(6px); }
          60%      { transform: translateX(-4px); }
          80%      { transform: translateX(4px); }
        }
        .shake { animation: shake .35s ease; }
      `}</style>

      {/* ── Full-page layout ── */}
      <div style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        position: "relative",
        zIndex: 1,
      }}>

        {/* ── Left panel — decorative ── */}
        <div style={{
          background: "linear-gradient(160deg, #1a1412 0%, #2e2320 50%, #3d2e29 100%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "52px 56px",
          position: "relative",
          overflow: "hidden",
        }}
          className="left-panel"
        >
          <NailDots />

          {/* Big radial glow */}
          <div style={{ position: "absolute", top: "30%", left: "20%", width: 460, height: 460, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,169,110,.07) 0%, transparent 65%)", pointerEvents: "none" }} />

          {/* Logo */}
          <Link href="/" style={{ textDecoration: "none", position: "relative", zIndex: 2 }}>
            <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.5rem", fontWeight: 400, color: "var(--white)", letterSpacing: ".04em", lineHeight: 1.1 }}>
              Nails by Jordan
              <span style={{ display: "block", fontFamily: "'DM Sans', sans-serif", fontSize: ".6rem", letterSpacing: ".22em", textTransform: "uppercase", color: "var(--gold)", marginTop: 3 }}>
                Luxury Nail Studio
              </span>
            </div>
          </Link>

          {/* Centre quote */}
          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={{ width: 40, height: 1, background: "var(--gold)", marginBottom: 28, opacity: .6 }} />
            <blockquote style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.8rem, 3vw, 2.8rem)", fontWeight: 300, lineHeight: 1.2, color: "var(--white)", maxWidth: 380 }}>
              "Every detail,<br />
              <em style={{ fontStyle: "italic", fontFamily: "'Playfair Display', Georgia, serif", color: "var(--gold2)" }}>crafted</em> with care."
            </blockquote>
            <p style={{ marginTop: 20, fontSize: ".82rem", color: "rgba(253,250,248,.45)", fontWeight: 300, lineHeight: 1.7, maxWidth: 320 }}>
              Welcome back. Sign in to access your loyalty card, track your visits, and redeem your rewards.
            </p>
          </div>

          {/* Bottom loyalty card preview */}
          <div style={{ position: "relative", zIndex: 2 }}>
            {/* Mini card */}
            <div style={{
              background: "rgba(253,250,248,.04)",
              border: "1px solid rgba(201,169,110,.18)",
              borderRadius: 16,
              padding: "18px 20px",
              display: "flex",
              alignItems: "center",
              gap: 16,
              backdropFilter: "blur(10px)",
              maxWidth: 340,
            }}>
              <div style={{ flexShrink: 0 }}>
                <div style={{ fontSize: ".58rem", letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(253,250,248,.35)", marginBottom: 6 }}>Your Progress</div>
                <div style={{ display: "flex", gap: 5 }}>
                  {Array.from({ length: 10 }, (_, i) => (
                    <div key={i} style={{ width: 14, height: 14, borderRadius: "50%", background: i < 6 ? "var(--gold)" : "rgba(201,169,110,.18)", border: i < 6 ? "none" : "1px solid rgba(201,169,110,.3)" }} />
                  ))}
                </div>
              </div>
              <div style={{ borderLeft: "1px solid rgba(201,169,110,.15)", paddingLeft: 16 }}>
                <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.5rem", color: "var(--gold2)", lineHeight: 1 }}>6</div>
                <div style={{ fontSize: ".6rem", color: "rgba(253,250,248,.35)", letterSpacing: ".08em" }}>visits logged</div>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <div style={{ background: "rgba(201,169,110,.15)", border: "1px solid rgba(201,169,110,.25)", borderRadius: 100, padding: "4px 10px", fontSize: ".58rem", color: "var(--gold2)", letterSpacing: ".08em", whiteSpace: "nowrap" }}>
                  4 to reward
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right panel — form ── */}
        <div style={{
          background: "var(--nude)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 32px",
          position: "relative",
          overflow: "hidden",
        }}>

          {/* Soft bg circles */}
          <div style={{ position: "absolute", top: -80, right: -80, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, var(--nude3) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -60, left: -60, width: 240, height: 240, borderRadius: "50%", background: "radial-gradient(circle, var(--nude2) 0%, transparent 70%)", pointerEvents: "none" }} />

          <div
            className="login-card"
            style={{
              width: "100%",
              maxWidth: 420,
              position: "relative",
              zIndex: 1,
            }}
          >
            {/* Header */}
            <div style={{ marginBottom: 40 }}>
              {/* Mobile only logo */}
              <Link href="/" style={{ textDecoration: "none", display: "none" }} className="mobile-logo">
                <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.3rem", color: "var(--ink)", marginBottom: 28 }}>
                  Nails by Jordan
                  <span style={{ display: "block", fontSize: ".58rem", letterSpacing: ".2em", textTransform: "uppercase", color: "var(--gold)", marginTop: 2 }}>Luxury Nail Studio</span>
                </div>
              </Link>

              <div style={{ fontSize: ".7rem", letterSpacing: ".2em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 10, display: "flex", alignItems: "center", gap: 8, fontWeight: 500 }}>
                <span style={{ display: "inline-block", width: 20, height: 1, background: "var(--gold)" }} />
                Welcome back
              </div>
              <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(2rem, 4vw, 2.8rem)", fontWeight: 300, lineHeight: 1.08, color: "var(--ink)" }}>
                Sign in to your<br />
                <em style={{ fontStyle: "italic", fontFamily: "'Playfair Display', Georgia, serif", color: "var(--gold)" }}>loyalty account</em>
              </h1>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate>

              {/* Email */}
              <div className="field-row" style={{ marginBottom: 22 }}>
                <div className="input-wrap">
                  <label style={{ display: "block", fontSize: ".68rem", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 8, fontWeight: 500, transition: "color .2s" }}>
                    Email Address
                  </label>
                  <div className="input-border" style={{
                    position: "relative",
                    background: "var(--white)",
                    border: errors.email ? "1.5px solid var(--error)" : "1.5px solid rgba(201,169,110,.25)",
                    borderRadius: 12,
                    transition: "border-color .2s, box-shadow .2s",
                  }}>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      autoComplete="email"
                      style={{
                        width: "100%",
                        padding: "14px 16px",
                        background: "transparent",
                        border: "none",
                        outline: "none",
                        fontSize: ".9rem",
                        color: "var(--ink)",
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 300,
                      }}
                    />
                  </div>
                  {errors.email && (
                    <p style={{ fontSize: ".7rem", color: "var(--error)", marginTop: 6, display: "flex", alignItems: "center", gap: 5 }}>
                      <span>⚠</span> {errors.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Password */}
              <div className="field-row" style={{ marginBottom: 12 }}>
                <div className="input-wrap">
                  <label style={{ display: "block", fontSize: ".68rem", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 8, fontWeight: 500, transition: "color .2s" }}>
                    Password
                  </label>
                  <div className="input-border" style={{
                    position: "relative",
                    background: "var(--white)",
                    border: errors.password ? "1.5px solid var(--error)" : "1.5px solid rgba(201,169,110,.25)",
                    borderRadius: 12,
                    transition: "border-color .2s, box-shadow .2s",
                    display: "flex",
                    alignItems: "center",
                  }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      style={{
                        flex: 1,
                        padding: "14px 16px",
                        background: "transparent",
                        border: "none",
                        outline: "none",
                        fontSize: ".9rem",
                        color: "var(--ink)",
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 300,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      style={{ padding: "0 14px", background: "none", border: "none", cursor: "pointer", color: "var(--muted)", display: "flex", alignItems: "center", flexShrink: 0 }}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      <EyeIcon open={showPassword} />
                    </button>
                  </div>
                  {errors.password && (
                    <p style={{ fontSize: ".7rem", color: "var(--error)", marginTop: 6, display: "flex", alignItems: "center", gap: 5 }}>
                      <span>⚠</span> {errors.password}
                    </p>
                  )}
                </div>
              </div>

              {/* Forgot password */}
              <div style={{ textAlign: "right", marginBottom: 28 }}>
                <Link href="/forgot-password" style={{ fontSize: ".72rem", color: "var(--gold)", textDecoration: "none", letterSpacing: ".04em", transition: "color .2s" }}>
                  Forgot your password?
                </Link>
              </div>

              {/* Submit error */}
              {submitError && (
                <div className="shake" style={{
                  background: "rgba(192,97,107,.08)",
                  border: "1px solid rgba(192,97,107,.3)",
                  borderRadius: 10,
                  padding: "12px 16px",
                  marginBottom: 20,
                  fontSize: ".8rem",
                  color: "var(--error)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}>
                  <span style={{ fontSize: "1rem" }}>⚠️</span>
                  {submitError}
                </div>
              )}

              {/* Submit button */}
              <div className="submit-row">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-gold-shimmer"
                  style={{
                    width: "100%",
                    padding: "16px",
                    border: "none",
                    borderRadius: 12,
                    cursor: loading ? "not-allowed" : "pointer",
                    fontSize: ".85rem",
                    fontWeight: 600,
                    letterSpacing: ".08em",
                    textTransform: "uppercase",
                    color: "var(--black)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                  }}
                >
                  {loading ? (
                    <>
                      <span style={{ width: 16, height: 16, border: "2px solid rgba(26,20,18,.2)", borderTopColor: "var(--black)", borderRadius: "50%", animation: "spin .7s linear infinite", display: "inline-block" }} />
                      Signing you in…
                    </>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="extras-row" style={{ margin: "28px 0" }}>
              <div className="divider">or</div>
            </div>

            {/* Sign up link */}
            <div className="extras-row" style={{ textAlign: "center" }}>
              <p style={{ fontSize: ".82rem", color: "var(--muted)", fontWeight: 300 }}>
                New to Nails by Jordan?{" "}
                <Link href="/signup" style={{ color: "var(--ink)", fontWeight: 500, textDecoration: "none", borderBottom: "1px solid rgba(201,169,110,.5)", paddingBottom: 1 }}>
                  Create your free account
                </Link>
              </p>
            </div>

            {/* Back to home */}
            <div style={{ marginTop: 40, textAlign: "center" }}>
              <Link href="/" style={{ fontSize: ".68rem", letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(122,106,99,.5)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 7, transition: "color .2s" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive: hide left panel on small screens, show mobile logo */}
      <style>{`
        @media (max-width: 860px) {
          .left-panel { display: none !important; }
          [style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
          .mobile-logo { display: block !important; }
        }
        @media (max-width: 480px) {
          .login-card { padding: 0 4px; }
        }
      `}</style>
    </>
  );
}