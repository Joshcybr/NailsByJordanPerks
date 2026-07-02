"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Testimonial {
  quote: string;
  name: string;
  label: string;
  initial: string;
}

interface Step {
  num: string;
  title: string;
  desc: string;
}

interface Reward {
  icon: string;
  visits: string;
  headline: string;
  desc: string;
  featured?: boolean;
  tag?: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const STEPS: Step[] = [
  {
    num: "01",
    title: "Create your free account",
    desc: "Sign up in under a minute with just your name and email. Your personal loyalty card is generated instantly.",
  },
  {
    num: "02",
    title: "Show your QR code",
    desc: "At every visit, your unique QR code is scanned — no cards to carry, no apps to open. Just show and go.",
  },
  {
    num: "03",
    title: "Watch your visits stack up",
    desc: "Track your progress in real time on your personal dashboard. See exactly how close you are to your next reward.",
  },
  {
    num: "04",
    title: "Redeem your reward",
    desc: "Reach 5 visits and save 10%. Hit 10 visits and unlock a luxurious 25% discount on any service.",
  },
];

const REWARDS: Reward[] = [
  {
    icon: "💅",
    visits: "5 Visits",
    headline: "10% OFF",
    desc: "Your first milestone. Reach 5 visits and enjoy an elegant 10% discount on any service of your choice.",
  },
  {
    icon: "👑",
    visits: "10 Visits",
    headline: "25% OFF",
    desc: "The ultimate reward. Ten visits unlocks a generous 25% off — our way of saying thank you for your loyalty.",
    featured: true,
    tag: "Most Loved",
  },
  {
    icon: "🔄",
    visits: "Ongoing",
    headline: "Keeps Cycling",
    desc: "After every 10 visits, your counter resets and the rewards cycle begins again — forever.",
  },
];

const TESTIMONIALS: Testimonial[] = [
  { quote: "The QR check-in is so seamless. I love seeing my progress build up — it makes every visit even more exciting.", name: "Aisha M.", label: "Member since 2024", initial: "A" },
  { quote: "Jordan's work is absolutely flawless. And now with the rewards, I feel like a VIP client every single time.", name: "Chloe R.", label: "10-visit club member", initial: "C" },
  { quote: "I've never remembered loyalty cards in my life. Having it on my phone as a QR code changed everything for me.", name: "Tanya K.", label: "Loyal client", initial: "T" },
  { quote: "Got my 25% off reward and honestly felt so celebrated. The app design is stunning too — very luxe.", name: "Nomsa B.", label: "Gold tier member", initial: "N" },
  { quote: "The dashboard is beautiful and so easy to use. I check my points after every visit — it's genuinely motivating!", name: "Lauren P.", label: "Regular client", initial: "L" },
  { quote: "Finally a nail studio that rewards loyalty properly. The whole experience feels premium from start to finish.", name: "Sara J.", label: "New member", initial: "S" },
];

const MARQUEE_ITEMS = [
  "Gel Extensions", "Loyalty Rewards", "Nail Art", "Acrylic Sets",
  "QR Check-In", "Pedicures", "Earn Points", "Luxury Experience",
];

// ─── Dot array for the loyalty card ──────────────────────────────────────────
const CARD_DOTS = Array.from({ length: 10 }, (_, i) => i + 1);

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Animated loyalty card shown in the hero */
function LoyaltyCardMockup() {
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {/* Floating badge — reward unlocked */}
      <div className="badge-float badge-1">
        <span style={{ fontSize: "1.2rem" }}>✨</span>
        <div>
          <div style={{ fontWeight: 500, fontSize: ".82rem" }}>Reward Unlocked!</div>
          <div style={{ fontSize: ".65rem", color: "var(--muted)" }}>25% off your next visit</div>
        </div>
      </div>

      {/* Main card */}
      <div className="loyalty-card">
        <div className="card-brand">
          Nails by
          <strong>Jordan</strong>
        </div>

        <div className="card-dots">
          {CARD_DOTS.map((n) => (
            <div key={n} className={`dot${n <= 6 ? " filled" : ""}`} data-n={n} />
          ))}
        </div>

        <div className="card-name">Member</div>
        <div className="card-customer">Sophia Williams</div>

        <div className="card-visits-row">
          <div>
            <div className="card-visits-label">Total Visits</div>
            <div className="card-visits-val">6</div>
          </div>
          <div className="card-badge">4 to next reward</div>
        </div>
      </div>

      {/* Floating badge — check-in success */}
      <div className="badge-float badge-2">
        <span style={{ fontSize: "1.2rem" }}>🎉</span>
        <div>
          <div style={{ fontWeight: 500, fontSize: ".82rem" }}>Check-in Success</div>
          <div style={{ fontSize: ".65rem", color: "var(--muted)" }}>+1 visit added</div>
        </div>
      </div>
    </div>
  );
}

/** Inline phone mockup used in the "How It Works" section */
function PhoneMockup() {
  return (
    <div className="how-visual">
      <div className="phone-mockup">
        <div className="phone-screen-label">Your Loyalty Card</div>
        <div className="phone-screen-name">Sophia W.</div>
        <div className="phone-dots-mini">
          {CARD_DOTS.map((n) => (
            <div key={n} className={`pdot${n <= 6 ? " f" : ""}`} />
          ))}
        </div>
        <div className="phone-progress">
          <div className="phone-progress-bar" />
        </div>
        <div className="phone-text">4 more visits to 25% OFF</div>
      </div>

      <div className="how-stat-row">
        {[
          { n: "5",  l: "Visits for\n10% off" },
          { n: "10", l: "Visits for\n25% off" },
          { n: "∞",  l: "Rewards\ncycling" },
        ].map(({ n, l }) => (
          <div key={n} className="how-stat">
            <div className="n">{n}</div>
            <div className="l" style={{ whiteSpace: "pre-line" }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Scroll-reveal hook ───────────────────────────────────────────────────────
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          const siblings = Array.from(
            el.parentElement?.querySelectorAll<HTMLElement>(".reveal") ?? []
          );
          const idx = siblings.indexOf(el);
          el.style.transitionDelay = `${idx * 0.08}s`;
          el.classList.add("visible");
          io.unobserve(el);
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [navShadow, setNavShadow] = useState(false);
  useReveal();

  /* Nav scroll shadow */
  useEffect(() => {
    const onScroll = () => setNavShadow(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* ─── Global styles injected via <style> (avoids needing a separate CSS module) */}
      <style>{`
        /* ── Tokens ── */
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
          --radius:   18px;
          --radius-lg:28px;
        }

        /* ── Reset / Base ── */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body {
          font-family: 'DM Sans', 'Segoe UI', sans-serif;
          background: var(--nude);
          color: var(--ink);
          overflow-x: hidden;
        }

        /* Noise overlay */
        body::before {
          content: '';
          position: fixed; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          background-size: 200px 200px;
          pointer-events: none;
          z-index: 0;
          opacity: .6;
        }

        /* ── Scroll Reveal ── */
        .reveal {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity .65s ease, transform .65s ease;
        }
        .reveal.visible { opacity: 1; transform: translateY(0); }

        /* ── Loyalty Card ── */
        .loyalty-card {
          background: linear-gradient(140deg, #1a1412 0%, #2e2320 60%, #3d2e29 100%);
          border-radius: 24px;
          padding: 32px 28px;
          width: 300px;
          box-shadow: 0 32px 80px rgba(26,20,18,.32), 0 0 0 1px rgba(201,169,110,.12);
          position: relative;
          overflow: hidden;
          animation: float 5s ease-in-out infinite;
        }
        .loyalty-card::before {
          content: '';
          position: absolute; top: -60px; right: -60px;
          width: 200px; height: 200px;
          background: radial-gradient(circle, rgba(201,169,110,.18), transparent 70%);
          border-radius: 50%;
        }
        .loyalty-card::after {
          content: '';
          position: absolute; bottom: -40px; left: -40px;
          width: 160px; height: 160px;
          background: radial-gradient(circle, rgba(201,169,110,.1), transparent 70%);
          border-radius: 50%;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50%       { transform: translateY(-12px) rotate(-2deg); }
        }
        .card-brand {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 1.1rem; font-weight: 400;
          color: rgba(253,250,248,.7); letter-spacing: .08em; margin-bottom: 28px;
        }
        .card-brand strong { color: var(--gold2); display: block; font-size: 1.3rem; }
        .card-dots { display: flex; gap: 10px; margin-bottom: 24px; flex-wrap: wrap; }
        .dot {
          width: 32px; height: 32px; border-radius: 50%;
          border: 1.5px solid rgba(201,169,110,.3);
          display: flex; align-items: center; justify-content: center;
          font-size: .6rem; color: rgba(253,250,248,.35);
        }
        .dot.filled { background: var(--gold); border-color: var(--gold); color: var(--black); }
        .dot.filled::after { content: '✓'; font-size: .7rem; font-weight: 700; }
        .dot:not(.filled)::after { content: attr(data-n); }
        .card-name { font-size: .72rem; letter-spacing: .14em; text-transform: uppercase; color: rgba(253,250,248,.45); margin-bottom: 4px; }
        .card-customer { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.3rem; color: var(--white); letter-spacing: .04em; }
        .card-visits-row { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 20px; padding-top: 16px; border-top: 1px solid rgba(201,169,110,.15); }
        .card-visits-label { font-size: .65rem; letter-spacing: .15em; text-transform: uppercase; color: rgba(253,250,248,.4); }
        .card-visits-val { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 2rem; color: var(--gold2); line-height: 1; }
        .card-badge { background: rgba(201,169,110,.15); border: 1px solid rgba(201,169,110,.3); border-radius: 100px; padding: 4px 10px; font-size: .6rem; letter-spacing: .1em; color: var(--gold2); }

        /* ── Floating badges ── */
        .badge-float {
          position: absolute;
          background: var(--white);
          border-radius: var(--radius);
          padding: 12px 16px;
          box-shadow: 0 8px 32px rgba(26,20,18,.12);
          display: flex; align-items: center; gap: 10px;
          font-size: .78rem; font-weight: 500;
          border: 1px solid rgba(201,169,110,.15);
          animation: floatBadge 4s ease-in-out infinite;
          z-index: 10;
        }
        .badge-1 { top: 10%; left: -60px; animation-delay: 0s; }
        .badge-2 { bottom: 15%; right: -50px; animation-delay: 1.5s; }
        @keyframes floatBadge {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-8px); }
        }

        /* ── Marquee ── */
        .marquee-track {
          display: flex;
          width: max-content;
          animation: marquee 28s linear infinite;
        }
        .marquee-item {
          display: inline-flex; align-items: center; gap: 14px;
          padding: 0 36px;
          font-size: .72rem; letter-spacing: .2em; text-transform: uppercase;
          color: rgba(253,250,248,.55); white-space: nowrap;
        }
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }

        /* ── How It Works visual ── */
        .how-visual {
          background: linear-gradient(160deg, var(--nude2) 0%, var(--nude3) 100%);
          border-radius: var(--radius-lg);
          padding: 48px 40px;
          display: flex; flex-direction: column; gap: 20px;
        }
        .phone-mockup {
          background: var(--black);
          border-radius: 28px;
          padding: 20px 16px;
          box-shadow: 0 24px 60px rgba(26,20,18,.25);
          margin: 0 auto;
          width: 200px;
        }
        .phone-screen-label { font-size: .55rem; letter-spacing: .15em; text-transform: uppercase; color: rgba(253,250,248,.4); text-align: center; margin-bottom: 12px; }
        .phone-screen-name  { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1rem; color: var(--white); text-align: center; margin-bottom: 14px; }
        .phone-dots-mini    { display: flex; gap: 6px; justify-content: center; flex-wrap: wrap; margin-bottom: 12px; }
        .pdot { width: 18px; height: 18px; border-radius: 50%; border: 1px solid rgba(201,169,110,.35); }
        .pdot.f { background: var(--gold); border-color: var(--gold); }
        .phone-progress { background: rgba(255,255,255,.1); border-radius: 100px; height: 4px; margin-bottom: 8px; }
        .phone-progress-bar { width: 60%; height: 100%; background: linear-gradient(90deg, var(--gold), var(--gold2)); border-radius: 100px; }
        .phone-text { font-size: .58rem; color: rgba(253,250,248,.45); text-align: center; letter-spacing: .08em; }
        .how-stat-row { display: flex; gap: 12px; }
        .how-stat { flex: 1; background: var(--white); border-radius: var(--radius); padding: 16px; text-align: center; }
        .how-stat .n { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.8rem; color: var(--gold); line-height: 1; }
        .how-stat .l { font-size: .65rem; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); margin-top: 4px; }

        /* ── Testimonials ── */
        .testi-track { display: flex; gap: 20px; width: max-content; animation: marquee 40s linear infinite; }
        .testi-card {
          width: 320px; flex-shrink: 0;
          background: var(--nude);
          border-radius: var(--radius-lg);
          padding: 28px;
          border: 1px solid rgba(201,169,110,.14);
        }

        /* ── Mobile ── */
        @media (max-width: 900px) {
          .loyalty-card { width: 260px; animation-name: float-mobile; }
          @keyframes float-mobile { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-10px);} }
          .badge-1, .badge-2 { display: none; }
        }
        @media (max-width: 480px) {
          .how-stat-row { flex-direction: column; }
        }
      `}</style>

      {/* ─── Nav ─────────────────────────────────────────────────── */}
      <nav
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 32px",
          background: "rgba(245,237,230,.88)",
          backdropFilter: "blur(18px)",
          borderBottom: "1px solid rgba(201,169,110,.18)",
          boxShadow: navShadow ? "0 4px 30px rgba(26,20,18,.08)" : "none",
          transition: "box-shadow .3s",
        }}
      >
        <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
          <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.45rem", fontWeight: 500, letterSpacing: ".03em", lineHeight: 1.1 }}>
            Nails by Jordan
            <span style={{ display: "block", fontSize: ".65rem", letterSpacing: ".22em", textTransform: "uppercase", color: "var(--gold)", fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}>
              Luxury Nail Studio
            </span>
          </div>
        </Link>

        {/* Desktop links */}
        <div style={{ display: "flex", gap: 28, alignItems: "center" }}
          className="hidden-mobile">
          {["#how", "#rewards", "#testimonials"].map((href, i) => (
            <a key={href} href={href}
              style={{ fontSize: ".8rem", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)", textDecoration: "none" }}>
              {["How It Works", "Rewards", "Reviews"][i]}
            </a>
          ))}
          <Link href="/login"
            style={{ background: "var(--gold)", color: "var(--white)", padding: "10px 22px", borderRadius: 100, fontSize: ".78rem", letterSpacing: ".1em", textTransform: "uppercase", fontWeight: 500, textDecoration: "none" }}>
            Sign In
          </Link>
        </div>

        {/* Hamburger */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
          style={{ display: "none", flexDirection: "column", gap: 5, cursor: "pointer", padding: 4, background: "none", border: "none" }}
          className="show-mobile"
        >
          {[0, 1, 2].map((i) => (
            <span key={i} style={{
              display: "block", width: 22, height: 1.5, background: "var(--ink)", borderRadius: 2, transition: ".3s",
              transform: menuOpen
                ? i === 0 ? "translateY(6.5px) rotate(45deg)" : i === 2 ? "translateY(-6.5px) rotate(-45deg)" : "none"
                : "none",
              opacity: menuOpen && i === 1 ? 0 : 1,
            }} />
          ))}
        </button>
      </nav>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div style={{
          position: "fixed", inset: 0, top: 62, background: "rgba(245,237,230,.97)",
          backdropFilter: "blur(20px)", zIndex: 99,
          display: "flex", flexDirection: "column", gap: 20, padding: "40px 32px",
        }}>
          {[["#how", "How It Works"], ["#rewards", "Rewards"], ["#testimonials", "Reviews"]].map(([href, label]) => (
            <a key={href} href={href} onClick={() => setMenuOpen(false)}
              style={{ fontSize: ".9rem", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)", textDecoration: "none" }}>
              {label}
            </a>
          ))}
          <Link href="/login" onClick={() => setMenuOpen(false)}
            style={{ background: "var(--gold)", color: "var(--white)", padding: "12px 22px", borderRadius: 100, fontSize: ".85rem", textAlign: "center", textDecoration: "none" }}>
            Sign In
          </Link>
        </div>
      )}

      {/* ─── Hero ──────────────────────────────────────────────────── */}
      <section style={{
        minHeight: "100svh",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        alignItems: "center",
        padding: "100px 32px 60px",
        position: "relative",
        overflow: "hidden",
        maxWidth: 1280,
        margin: "0 auto",
        gap: 40,
      }}>
        {/* bg glow */}
        <div style={{ position: "absolute", right: -180, top: "50%", transform: "translateY(-50%)", width: 640, height: 640, background: "radial-gradient(circle, var(--nude3) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />

        {/* Text */}
        <div className="reveal" style={{ maxWidth: 560, position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: ".72rem", letterSpacing: ".2em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 22, fontWeight: 500 }}>
            <span style={{ display: "inline-block", width: 30, height: 1, background: "var(--gold)" }} />
            Nails by Jordan — Loyalty Programme
          </div>

          <h1 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(3.4rem, 6vw, 5.8rem)", fontWeight: 300, lineHeight: 1.04, letterSpacing: "-.01em", marginBottom: 24 }}>
            Every visit,{" "}
            <em style={{ fontStyle: "italic", fontFamily: "'Playfair Display', Georgia, serif", color: "var(--gold)" }}>
              beautifully
            </em>
            <br />rewarded
          </h1>

          <p style={{ fontSize: "1rem", lineHeight: 1.7, color: "var(--muted)", maxWidth: 420, marginBottom: 38, fontWeight: 300 }}>
            Join our exclusive loyalty programme and earn rewards with every nail appointment. The more you visit, the more you save.
          </p>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <Link href="/signup" style={{
              background: "var(--black)", color: "var(--white)",
              padding: "15px 32px", borderRadius: 100,
              fontSize: ".85rem", letterSpacing: ".06em", fontWeight: 500,
              textDecoration: "none", boxShadow: "0 4px 24px rgba(26,20,18,.16)",
              transition: "transform .2s",
            }}>
              Join Free — Earn Points
            </Link>
            <a href="#how" style={{
              border: "1px solid rgba(201,169,110,.5)", color: "var(--ink)",
              padding: "14px 30px", borderRadius: 100,
              fontSize: ".85rem", letterSpacing: ".06em",
              textDecoration: "none",
            }}>
              See How It Works
            </a>
          </div>
        </div>

        {/* Card visual */}
        <div className="reveal" style={{ display: "flex", justifyContent: "center", alignItems: "center", position: "relative", zIndex: 2 }}>
          <LoyaltyCardMockup />
        </div>
      </section>

      {/* ─── Marquee ───────────────────────────────────────────────── */}
      <div style={{ overflow: "hidden", background: "var(--black)", padding: "14px 0", borderTop: "1px solid rgba(201,169,110,.12)", borderBottom: "1px solid rgba(201,169,110,.12)" }}>
        <div className="marquee-track">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <div key={i} className="marquee-item">
              <span style={{ color: "var(--gold)" }}>✦</span> {item}
            </div>
          ))}
        </div>
      </div>

      {/* ─── How It Works ─────────────────────────────────────────── */}
      <section id="how" style={{ padding: "110px 0", background: "var(--white)" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 32px" }}>
          <div className="reveal" style={{ fontSize: ".72rem", letterSpacing: ".22em", textTransform: "uppercase", color: "var(--gold)", fontWeight: 500, marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ display: "inline-block", width: 24, height: 1, background: "var(--gold)" }} />
            Simple & Effortless
          </div>
          <h2 className="reveal" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(2.4rem, 4.5vw, 3.8rem)", fontWeight: 300, lineHeight: 1.08 }}>
            How your rewards{" "}
            <em style={{ fontStyle: "italic", fontFamily: "'Playfair Display', Georgia, serif", color: "var(--gold)" }}>come to life</em>
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center", marginTop: 64 }}>
            {/* Steps */}
            <div>
              {STEPS.map((step, i) => (
                <div key={step.num} className="reveal" style={{
                  display: "flex", gap: 24,
                  padding: "28px 0",
                  borderBottom: i < STEPS.length - 1 ? "1px solid rgba(201,169,110,.14)" : "none",
                }}>
                  <div style={{ flexShrink: 0, width: 44, height: 44, border: "1.5px solid var(--gold)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.1rem", color: "var(--gold)" }}>
                    {step.num}
                  </div>
                  <div>
                    <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.35rem", fontWeight: 500, marginBottom: 6 }}>{step.title}</h3>
                    <p style={{ fontSize: ".88rem", color: "var(--muted)", lineHeight: 1.65, fontWeight: 300 }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Phone visual */}
            <div className="reveal">
              <PhoneMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Rewards ──────────────────────────────────────────────── */}
      <section id="rewards" style={{ padding: "110px 0", background: "var(--nude)" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 32px" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div className="reveal" style={{ fontSize: ".72rem", letterSpacing: ".22em", textTransform: "uppercase", color: "var(--gold)", fontWeight: 500, marginBottom: 14, display: "flex", alignItems: "center", gap: 10, justifyContent: "center" }}>
              <span style={{ display: "inline-block", width: 24, height: 1, background: "var(--gold)" }} /> Loyalty Tiers
            </div>
            <h2 className="reveal" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(2.4rem, 4.5vw, 3.8rem)", fontWeight: 300, lineHeight: 1.08 }}>
              Rewards that feel as{" "}
              <em style={{ fontStyle: "italic", fontFamily: "'Playfair Display', Georgia, serif", color: "var(--gold)" }}>good as your nails</em>
            </h2>
            <p className="reveal" style={{ fontSize: "1rem", color: "var(--muted)", maxWidth: 460, margin: "16px auto 0", lineHeight: 1.7, fontWeight: 300 }}>
              Two beautiful milestones, each designed to make you feel appreciated every time you sit in Jordan&apos;s chair.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {REWARDS.map((r) => (
              <div key={r.visits} className="reveal" style={{
                background: r.featured ? "linear-gradient(145deg, var(--black) 0%, #2e2320 100%)" : "var(--white)",
                borderRadius: "var(--radius-lg)",
                padding: "36px 28px",
                border: r.featured ? "1px solid rgba(201,169,110,.3)" : "1px solid rgba(201,169,110,.15)",
                position: "relative",
                overflow: "hidden",
                transition: "transform .25s, box-shadow .25s",
              }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-6px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 20px 60px rgba(26,20,18,.09)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = ""; (e.currentTarget as HTMLDivElement).style.boxShadow = ""; }}
              >
                {/* glow */}
                <div style={{ position: "absolute", top: -40, right: -40, width: 140, height: 140, borderRadius: "50%", background: `radial-gradient(circle, rgba(201,169,110,${r.featured ? ".15" : ".08"}), transparent 70%)`, pointerEvents: "none" }} />

                {r.tag && (
                  <div style={{ position: "absolute", top: 20, right: 20, background: "var(--gold)", color: "var(--white)", fontSize: ".58rem", letterSpacing: ".12em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 100, fontWeight: 500 }}>
                    {r.tag}
                  </div>
                )}

                <div style={{ fontSize: "2rem", marginBottom: 20 }}>{r.icon}</div>
                <div style={{ fontSize: ".7rem", letterSpacing: ".18em", textTransform: "uppercase", color: "var(--gold)", marginBottom: 8, fontWeight: 500 }}>{r.visits}</div>
                <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "3.2rem", fontWeight: 300, lineHeight: 1, marginBottom: 10, color: r.featured ? "var(--gold2)" : "var(--ink)" }}>
                  {r.headline}
                </div>
                <p style={{ fontSize: ".85rem", color: r.featured ? "rgba(253,250,248,.55)" : "var(--muted)", lineHeight: 1.6, fontWeight: 300 }}>{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─────────────────────────────────────────── */}
      <section id="testimonials" style={{ padding: "110px 0", background: "var(--white)", overflow: "hidden" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 32px", marginBottom: 48 }}>
          <div style={{ textAlign: "center" }}>
            <div className="reveal" style={{ fontSize: ".72rem", letterSpacing: ".22em", textTransform: "uppercase", color: "var(--gold)", fontWeight: 500, marginBottom: 14, display: "flex", alignItems: "center", gap: 10, justifyContent: "center" }}>
              <span style={{ display: "inline-block", width: 24, height: 1, background: "var(--gold)" }} /> Client Love
            </div>
            <h2 className="reveal" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(2.4rem, 4.5vw, 3.8rem)", fontWeight: 300, lineHeight: 1.08 }}>
              What our loyal{" "}
              <em style={{ fontStyle: "italic", fontFamily: "'Playfair Display', Georgia, serif", color: "var(--gold)" }}>clients say</em>
            </h2>
          </div>
        </div>

        <div style={{ overflow: "hidden" }}>
          <div className="testi-track">
            {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
              <div key={i} className="testi-card">
                <div style={{ color: "var(--gold)", fontSize: ".95rem", marginBottom: 14, letterSpacing: 2 }}>★★★★★</div>
                <p style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.08rem", lineHeight: 1.6, marginBottom: 20 }}>&ldquo;{t.quote}&rdquo;</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, var(--nude3), var(--nude2))", border: "1.5px solid rgba(201,169,110,.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".8rem", color: "var(--gold)", fontFamily: "'Cormorant Garamond', Georgia, serif", flexShrink: 0 }}>
                    {t.initial}
                  </div>
                  <div>
                    <div style={{ fontSize: ".8rem", fontWeight: 500 }}>{t.name}</div>
                    <div style={{ fontSize: ".68rem", color: "var(--muted)" }}>{t.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────────── */}
      <section id="cta" style={{ padding: "120px 0", background: "var(--black)", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(201,169,110,.12) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1120, margin: "0 auto", padding: "0 32px", position: "relative", zIndex: 1 }}>
          <div className="reveal" style={{ fontSize: ".72rem", letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(201,169,110,.7)", fontWeight: 500, marginBottom: 14, display: "flex", alignItems: "center", gap: 10, justifyContent: "center" }}>
            <span style={{ display: "inline-block", width: 24, height: 1, background: "rgba(201,169,110,.7)" }} /> Join Today — It&apos;s Free
          </div>
          <h2 className="reveal" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(2.4rem, 4.5vw, 3.8rem)", fontWeight: 300, lineHeight: 1.08, color: "var(--white)" }}>
            Start earning rewards{" "}
            <em style={{ fontStyle: "italic", fontFamily: "'Playfair Display', Georgia, serif", color: "var(--gold2)" }}>from your very first visit</em>
          </h2>
          <p className="reveal" style={{ color: "rgba(253,250,248,.55)", fontSize: "1rem", maxWidth: 440, margin: "18px auto 40px", lineHeight: 1.7, fontWeight: 300 }}>
            Create your loyalty account in seconds and never miss out on a reward again. Your QR card is waiting.
          </p>
          <div className="reveal" style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/signup" style={{ background: "linear-gradient(135deg, var(--gold), var(--gold2))", color: "var(--black)", padding: "16px 36px", borderRadius: 100, fontSize: ".85rem", fontWeight: 600, letterSpacing: ".06em", textDecoration: "none", boxShadow: "0 6px 24px rgba(201,169,110,.35)" }}>
              Create My Free Account
            </Link>
            <Link href="/login" style={{ border: "1px solid rgba(253,250,248,.2)", color: "rgba(253,250,248,.75)", padding: "15px 32px", borderRadius: 100, fontSize: ".85rem", letterSpacing: ".06em", textDecoration: "none" }}>
              Already a member? Sign in
            </Link>
          </div>
          <div className="reveal" style={{ fontSize: ".72rem", color: "rgba(253,250,248,.3)", marginTop: 20, letterSpacing: ".08em" }}>
            No credit card required · Completely free to join
          </div>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────────── */}
      <footer style={{ background: "var(--nude)", padding: "60px 32px 40px", borderTop: "1px solid rgba(201,169,110,.18)" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24 }}>
          <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "1.3rem", fontWeight: 400 }}>
            Nails by Jordan
            <span style={{ display: "block", fontFamily: "'DM Sans', sans-serif", fontSize: ".62rem", letterSpacing: ".2em", textTransform: "uppercase", color: "var(--gold)", marginTop: 2 }}>
              Luxury Nail Studio
            </span>
          </div>

          <div style={{ display: "flex", gap: 28, flexWrap: "wrap" }}>
            {[["#how", "How It Works"], ["#rewards", "Rewards"], ["/signup", "Join"], ["/login", "Sign In"]].map(([href, label]) => (
              <a key={href} href={href} style={{ fontSize: ".75rem", letterSpacing: ".1em", textTransform: "uppercase", color: "var(--muted)", textDecoration: "none" }}>{label}</a>
            ))}
          </div>

          <div style={{ fontSize: ".72rem", color: "var(--muted)", textAlign: "right" }}>
            © 2025 Nails by Jordan
            <span style={{ display: "block", color: "rgba(201,169,110,.6)", marginTop: 2 }}>Crafted with care ✦</span>
          </div>
        </div>
      </footer>

      {/* Responsive overrides */}
      <style>{`
        @media (max-width: 900px) {
          section:first-of-type { grid-template-columns: 1fr !important; }
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
          #how .how-grid-inner { grid-template-columns: 1fr !important; }
        }
        .show-mobile { display: none; }
        @media (max-width: 768px) {
          [data-rewards-grid] { grid-template-columns: 1fr !important; }
          [data-how-grid] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}