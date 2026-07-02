"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────
type FormState = {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  confirm_password: string;
};
type FieldError = Partial<Record<keyof FormState, string>>;

// ─── Validation ───────────────────────────────────────────────────────────────
function validate(form: FormState): FieldError {
  const e: FieldError = {};
  if (!form.full_name.trim()) e.full_name = "Full name is required";
  if (!form.email.trim()) e.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email";
  if (!form.password) e.password = "Password is required";
  else if (form.password.length < 6) e.password = "Minimum 6 characters";
  if (!form.confirm_password) e.confirm_password = "Please confirm your password";
  else if (form.confirm_password !== form.password) e.confirm_password = "Passwords don't match";
  return e;
}

// ─── Password strength ────────────────────────────────────────────────────────
function passwordStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: "", color: "transparent" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { label: "Weak",    color: "#c0616b" },
    { label: "Fair",    color: "#d4935a" },
    { label: "Good",    color: "#c9a96e" },
    { label: "Strong",  color: "#7aab6e" },
    { label: "Perfect", color: "#5a9a8e" },
  ];
  return { score, ...map[score] };
}

// ─── Eye icon ─────────────────────────────────────────────────────────────────
function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

// ─── Check icon ───────────────────────────────────────────────────────────────
function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    full_name: "", email: "", phone: "", password: "", confirm_password: "",
  });
  const [errors, setErrors] = useState<FieldError>({});
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState(false);

  const strength = passwordStrength(form.password);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name as keyof FormState]) setErrors((p) => ({ ...p, [name]: undefined }));
    if (submitError) setSubmitError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fieldErrors = validate(form);
    if (Object.keys(fieldErrors).length > 0) { setErrors(fieldErrors); return; }

    setLoading(true);
    setSubmitError("");

    try {
      // 1. Sign up with Supabase Auth — profile is auto-created via DB trigger
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.full_name,
            phone: form.phone || null,
          },
        },
      });

      if (error) throw error;

      // 2. If email confirmation is disabled in Supabase, user is signed in immediately
      if (data.session) {
        router.push("/dashboard");
      } else {
        // Email confirmation required — show success state
        setSuccess(true);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setSubmitError(msg);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <>
        <GlobalStyles />
        <div style={{ minHeight: "100vh", background: "var(--nude)", display: "flex", alignItems: "center", justifyContent: "center", padding: 32 }}>
          <div style={{ maxWidth: 420, textAlign: "center" }}>
            <div style={{ width: 72, height: 72, background: "linear-gradient(135deg, var(--gold), var(--gold2))", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 28px", fontSize: "1.8rem" }}>
              ✨
            </div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "2.4rem", fontWeight: 300, marginBottom: 16 }}>
              You&apos;re almost in!
            </h1>
            <p style={{ color: "var(--muted)", lineHeight: 1.7, marginBottom: 28, fontSize: ".9rem" }}>
              We sent a confirmation link to <strong style={{ color: "var(--ink)" }}>{form.email}</strong>. Check your inbox and click the link to activate your loyalty account.
            </p>
            <Link href="/login" style={{ background: "var(--black)", color: "var(--white)", padding: "14px 32px", borderRadius: 100, textDecoration: "none", fontSize: ".85rem", fontWeight: 500, letterSpacing: ".06em" }}>
              Back to Sign In
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <GlobalStyles />

      <div style={{ minHeight: "100vh", display: "grid", gridTemplateColumns: "1fr 1fr", position: "relative", zIndex: 1 }}>

        {/* ── Left panel ── */}
        <div
          className="left-panel"
          style={{ background: "linear-gradient(160deg, #1a1412 0%, #2e2320 50%, #3d2e29 100%)", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "52px 56px", position: "relative", overflow: "hidden" }}
        >
          {/* Orbs */}
          {[
            { size: 300, top: "10%",  left: "15%",  op: .06 },
            { size: 160, top: "65%",  left: "70%",  op: .08 },
            { size: 80,  top: "80%",  left: "10%",  op: .09 },
          ].map((o, i) => (
            <div key={i} style={{ position: "absolute", top: o.top, left: o.left, width: o.size, height: o.size, borderRadius: "50%", background: `radial-gradient(circle, rgba(201,169,110,${o.op}) 0%, transparent 70%)`, border: `1px solid rgba(201,169,110,${o.op * 1.5})`, pointerEvents: "none" }} />
          ))}

          {/* Logo */}
          <Link href="/" style={{ textDecoration: "none", position: "relative", zIndex: 2 }}>
            <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.5rem", fontWeight: 400, color: "var(--white)", letterSpacing: ".04em", lineHeight: 1.1 }}>
              Nails by Jordan
              <span style={{ display: "block", fontFamily: "'DM Sans', sans-serif", fontSize: ".6rem", letterSpacing: ".22em", textTransform: "uppercase", color: "var(--gold)", marginTop: 3 }}>Luxury Nail Studio</span>
            </div>
          </Link>

          {/* Perks */}
          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={{ width: 40, height: 1, background: "var(--gold)", marginBottom: 28, opacity: .6 }} />
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.6rem, 2.8vw, 2.4rem)", fontWeight: 300, color: "var(--white)", lineHeight: 1.2, marginBottom: 36 }}>
              Join and start earning<br />
              <em style={{ fontStyle: "italic", fontFamily: "'Playfair Display', Georgia, serif", color: "var(--gold2)" }}>beautiful rewards</em>
            </h2>

            {[
              { icon: "💅", text: "Instant digital loyalty card with QR code" },
              { icon: "✨", text: "10% off after just 5 visits" },
              { icon: "👑", text: "25% off after 10 visits — forever cycling" },
              { icon: "📱", text: "Track progress from your phone anytime" },
            ].map((perk) => (
              <div key={perk.icon} style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 18 }}>
                <div style={{ width: 32, height: 32, background: "rgba(201,169,110,.12)", border: "1px solid rgba(201,169,110,.2)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".9rem", flexShrink: 0 }}>{perk.icon}</div>
                <p style={{ fontSize: ".85rem", color: "rgba(253,250,248,.65)", lineHeight: 1.5, paddingTop: 5, fontWeight: 300 }}>{perk.text}</p>
              </div>
            ))}
          </div>

          {/* Bottom note */}
          <p style={{ fontSize: ".7rem", color: "rgba(253,250,248,.25)", position: "relative", zIndex: 2 }}>
            Free to join · No credit card required
          </p>
        </div>

        {/* ── Right panel — form ── */}
        <div style={{ background: "var(--nude)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 32px", position: "relative", overflow: "hidden" }}>
          {/* bg orbs */}
          <div style={{ position: "absolute", top: -80, right: -80, width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, var(--nude3) 0%, transparent 70%)", pointerEvents: "none" }} />

          <div style={{ width: "100%", maxWidth: 440, position: "relative", zIndex: 1 }}>

            {/* Mobile logo */}
            <Link href="/" className="mobile-logo" style={{ textDecoration: "none", display: "none", marginBottom: 28 }}>
              <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.3rem", color: "var(--ink)" }}>
                Nails by Jordan
                <span style={{ display: "block", fontSize: ".58rem", letterSpacing: ".2em", textTransform: "uppercase", color: "var(--gold)", marginTop: 2 }}>Luxury Nail Studio</span>
              </div>
            </Link>

            {/* Header */}
            <div style={{ marginBottom: 36 }}>
              <div style={{ fontSize: ".7rem", letterSpacing: ".2em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 10, display: "flex", alignItems: "center", gap: 8, fontWeight: 500 }}>
                <span style={{ display: "inline-block", width: 20, height: 1, background: "var(--gold)" }} />
                New member
              </div>
              <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(1.9rem, 3.5vw, 2.6rem)", fontWeight: 300, lineHeight: 1.1, color: "var(--ink)" }}>
                Create your<br />
                <em style={{ fontStyle: "italic", fontFamily: "'Playfair Display', Georgia, serif", color: "var(--gold)" }}>loyalty account</em>
              </h1>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 18 }}>

              {/* Full name */}
              <Field label="Full Name" error={errors.full_name}>
                <input name="full_name" type="text" value={form.full_name} onChange={handleChange} placeholder="Sophia Williams" autoComplete="name"
                  style={inputStyle(!!errors.full_name)} />
              </Field>

              {/* Email */}
              <Field label="Email Address" error={errors.email}>
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com" autoComplete="email"
                  style={inputStyle(!!errors.email)} />
              </Field>

              {/* Phone */}
              <Field label="Phone Number" hint="Optional">
                <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+27 82 000 0000" autoComplete="tel"
                  style={inputStyle(false)} />
              </Field>

              {/* Password */}
              <Field label="Password" error={errors.password}>
                <div style={{ position: "relative", display: "flex", alignItems: "center", background: "var(--white)", border: `1.5px solid ${errors.password ? "var(--error)" : "rgba(201,169,110,.25)"}`, borderRadius: 12, transition: "border-color .2s, box-shadow .2s" }} className="input-focus-wrap">
                  <input name="password" type={showPw ? "text" : "password"} value={form.password} onChange={handleChange} placeholder="Min. 6 characters" autoComplete="new-password"
                    style={{ flex: 1, padding: "14px 16px", background: "transparent", border: "none", outline: "none", fontSize: ".9rem", color: "var(--ink)", fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }} />
                  <button type="button" onClick={() => setShowPw(v => !v)} style={{ padding: "0 14px", background: "none", border: "none", cursor: "pointer", color: "var(--muted)", display: "flex" }} aria-label="Toggle password">
                    <EyeIcon open={showPw} />
                  </button>
                </div>
                {/* Strength bar */}
                {form.password && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                      {[1, 2, 3, 4].map((s) => (
                        <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: s <= strength.score ? strength.color : "rgba(201,169,110,.15)", transition: "background .3s" }} />
                      ))}
                    </div>
                    <span style={{ fontSize: ".65rem", color: strength.color, fontWeight: 500 }}>{strength.label}</span>
                  </div>
                )}
              </Field>

              {/* Confirm password */}
              <Field label="Confirm Password" error={errors.confirm_password}>
                <div style={{ position: "relative", display: "flex", alignItems: "center", background: "var(--white)", border: `1.5px solid ${errors.confirm_password ? "var(--error)" : "rgba(201,169,110,.25)"}`, borderRadius: 12, transition: "border-color .2s, box-shadow .2s" }} className="input-focus-wrap">
                  <input name="confirm_password" type={showConfirm ? "text" : "password"} value={form.confirm_password} onChange={handleChange} placeholder="Repeat password" autoComplete="new-password"
                    style={{ flex: 1, padding: "14px 16px", background: "transparent", border: "none", outline: "none", fontSize: ".9rem", color: "var(--ink)", fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }} />
                  {form.confirm_password && form.confirm_password === form.password && (
                    <div style={{ paddingRight: 14, color: "#7aab6e" }}><CheckIcon /></div>
                  )}
                  <button type="button" onClick={() => setShowConfirm(v => !v)} style={{ padding: "0 14px", background: "none", border: "none", cursor: "pointer", color: "var(--muted)", display: "flex" }} aria-label="Toggle confirm password">
                    <EyeIcon open={showConfirm} />
                  </button>
                </div>
              </Field>

              {/* Submit error */}
              {submitError && (
                <div style={{ background: "rgba(192,97,107,.08)", border: "1px solid rgba(192,97,107,.3)", borderRadius: 10, padding: "12px 16px", fontSize: ".8rem", color: "var(--error)", display: "flex", alignItems: "center", gap: 8 }}>
                  <span>⚠️</span> {submitError}
                </div>
              )}

              {/* Submit */}
              <button type="submit" disabled={loading} className="btn-gold-shimmer"
                style={{ width: "100%", padding: "16px", border: "none", borderRadius: 12, cursor: loading ? "not-allowed" : "pointer", fontSize: ".85rem", fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--black)", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 4 }}>
                {loading ? (
                  <><span className="spinner" /> Creating your account…</>
                ) : "Create Account — It's Free"}
              </button>

              {/* Sign in link */}
              <p style={{ textAlign: "center", fontSize: ".82rem", color: "var(--muted)", fontWeight: 300, marginTop: 4 }}>
                Already have an account?{" "}
                <Link href="/login" style={{ color: "var(--ink)", fontWeight: 500, textDecoration: "none", borderBottom: "1px solid rgba(201,169,110,.5)", paddingBottom: 1 }}>Sign in</Link>
              </p>

            </form>

            {/* Back */}
            <div style={{ marginTop: 32, textAlign: "center" }}>
              <Link href="/" style={{ fontSize: ".68rem", letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(122,106,99,.5)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 7 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .left-panel { display: none !important; }
          [style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
          .mobile-logo { display: block !important; }
        }
        .input-focus-wrap:focus-within {
          border-color: rgba(201,169,110,.7) !important;
          box-shadow: 0 0 0 3px rgba(201,169,110,.1);
        }
      `}</style>
    </>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function Field({ label, children, error, hint }: { label: string; children: React.ReactNode; error?: string; hint?: string }) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <label style={{ fontSize: ".68rem", letterSpacing: ".14em", textTransform: "uppercase", color: "var(--muted)", fontWeight: 500 }}>{label}</label>
        {hint && <span style={{ fontSize: ".65rem", color: "rgba(122,106,99,.5)", letterSpacing: ".06em" }}>{hint}</span>}
      </div>
      {children}
      {error && <p style={{ fontSize: ".7rem", color: "var(--error)", marginTop: 6, display: "flex", alignItems: "center", gap: 5 }}><span>⚠</span> {error}</p>}
    </div>
  );
}

function inputStyle(hasError: boolean): React.CSSProperties {
  return {
    width: "100%", padding: "14px 16px",
    background: "var(--white)",
    border: `1.5px solid ${hasError ? "var(--error)" : "rgba(201,169,110,.25)"}`,
    borderRadius: 12, outline: "none",
    fontSize: ".9rem", color: "var(--ink)",
    fontFamily: "'DM Sans', sans-serif", fontWeight: 300,
    transition: "border-color .2s, box-shadow .2s",
  };
}

function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400&family=DM+Sans:wght@300;400;500&family=Playfair+Display:ital,wght@1,400&display=swap');
      :root {
        --nude:#f5ede6;--nude2:#eeddd3;--nude3:#e8cfc2;
        --gold:#c9a96e;--gold2:#e8c98a;--gold-dim:#b8935a;
        --black:#1a1412;--ink:#2e2320;--muted:#7a6a63;
        --white:#fdfaf8;--error:#c0616b;
      }
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
      html{height:100%}
      body{font-family:'DM Sans','Segoe UI',sans-serif;background:var(--nude);min-height:100vh;overflow-x:hidden}
      body::before{content:'';position:fixed;inset:0;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");background-size:200px 200px;pointer-events:none;z-index:0}
      @keyframes spin{to{transform:rotate(360deg)}}
      .spinner{width:16px;height:16px;border:2px solid rgba(26,20,18,.2);border-top-color:var(--black);border-radius:50%;animation:spin .7s linear infinite;display:inline-block}
      .btn-gold-shimmer{background:linear-gradient(105deg,var(--gold-dim) 0%,var(--gold2) 40%,var(--gold) 50%,var(--gold2) 60%,var(--gold-dim) 100%);background-size:200% auto;transition:background-position .6s ease,transform .2s,box-shadow .2s}
      .btn-gold-shimmer:hover:not(:disabled){background-position:right center;transform:translateY(-2px);box-shadow:0 12px 36px rgba(201,169,110,.4)}
      .btn-gold-shimmer:disabled{opacity:.75;cursor:not-allowed}
      input:focus{border-color:rgba(201,169,110,.7) !important;box-shadow:0 0 0 3px rgba(201,169,110,.1)}
    `}</style>
  );
}