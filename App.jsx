import { useState, useEffect, useRef, useCallback } from "react";

const G = "linear-gradient(135deg,#8b5cf6,#ec4899)";
const FF = { h: "system-ui,sans-serif", b: "system-ui,sans-serif" };

const TOOLS = [
  { id: "writer", cat: "Text", icon: "✍️", name: "AI Writer", desc: "Blog posts & articles", cost: 3, tag: "Popular" },
  { id: "caption", cat: "Text", icon: "📱", name: "Caption Generator", desc: "Instagram, YouTube, TikTok captions", cost: 2, tag: "" },
  { id: "email", cat: "Text", icon: "📧", name: "Email Writer", desc: "Cold emails & newsletters", cost: 2, tag: "" },
  { id: "resume", cat: "Text", icon: "📄", name: "Resume Builder", desc: "ATS-optimized resumes", cost: 4, tag: "New" },
  { id: "adcopy", cat: "Text", icon: "📢", name: "Ad Copy", desc: "Facebook & Google ads", cost: 3, tag: "" },
  { id: "rewrite", cat: "Text", icon: "✨", name: "AI Rewriter", desc: "Paraphrase & improve content", cost: 2, tag: "" },
  { id: "imagine", cat: "Image", icon: "🎨", name: "Image Generator", desc: "AI art from text prompts", cost: 5, tag: "🔥 Hot" },
  { id: "logo", cat: "Image", icon: "🏷️", name: "Logo Concept", desc: "Professional logo brief", cost: 3, tag: "" },
  { id: "vidscript", cat: "Video", icon: "🎬", name: "Video Script", desc: "YouTube scripts with hooks", cost: 4, tag: "Popular" },
  { id: "shorts", cat: "Video", icon: "📲", name: "Shorts Script", desc: "60-second viral scripts", cost: 3, tag: "" },
  { id: "business", cat: "Biz", icon: "💼", name: "Business Ideas", desc: "Profitable niche ideas", cost: 3, tag: "" },
  { id: "hashtag", cat: "Biz", icon: "#️⃣", name: "Hashtag Strategy", desc: "30 viral hashtags", cost: 1, tag: "" },
];

const PROMPTS = {
  writer: q => `Write a comprehensive, engaging article about: "${q}". Use H2 headings, intro, main sections, and a strong conclusion. Use markdown.`,
  caption: q => `Create 6 scroll-stopping social media captions for: "${q}". Mix tones, add emojis and CTA. Include 10 hashtags. Number each.`,
  email: q => `Write a compelling email for: "${q}". Include: 2 subject line options, preview text, hook, body, CTA, sign-off.`,
  resume: q => `Create a professional resume section for: "${q}". Include: Summary (3 lines), 10 Skills, 3 achievement bullets with metrics, Headline.`,
  adcopy: q => `Create 4 ad copies for: "${q}". Each: Platform, Headline, Primary text, CTA. Use emotional triggers.`,
  rewrite: q => `Rewrite this content to be significantly better: "${q}". Show ORIGINAL vs REWRITTEN with improvement notes.`,
  imagine: q => `Write 3 detailed AI image generation prompts for: "${q}". Each must include subject, art style, lighting, mood, color palette, camera angle, quality tags. Number clearly.`,
  logo: q => `Create a logo design brief for: "${q}". Include: Brand personality, Color palette (hex), Typography, 3 Logo concepts, Icon style.`,
  vidscript: q => `Write a complete YouTube script for: "${q}". Structure: HOOK (15s), INTRO (30s), MAIN (4-5 points), MID CTA, OUTRO (30s).`,
  shorts: q => `Write a 60-second Reels/Shorts script for: "${q}". Structure: 0-3s HOOK, 3-15s SETUP, 15-45s VALUE, 45-55s PAYOFF, 55-60s CTA.`,
  business: q => `Generate 5 profitable business ideas for: "${q}". For each: Name, Pitch, Problem, Target customer, Revenue model, 30-day launch plan.`,
  hashtag: q => `Create hashtag strategy for: "${q}". 30 hashtags in 3 tiers: High Volume (10), Medium (10), Niche (10). Include best posting times.`,
};

const PLANS = [
  { id: "m1", label: "1 Month", price: 199, credits: 400, popular: false, save: "", badge: "Starter" },
  { id: "m2", label: "2 Months", price: 499, credits: 1000, popular: true, save: "Save 20%", badge: "Best Value" },
  { id: "m3", label: "3 Months", price: 699, credits: 1600, popular: false, save: "Save 30%", badge: "Pro" },
  { id: "y1", label: "1 Year", price: 2999, credits: 9999, popular: false, save: "Save 58%", badge: "Unlimited" },
];

const EARN = [
  { id: "watch", icon: "📺", label: "Watch Ad", credits: 3, duration: 3500 },
  { id: "daily", icon: "🗓️", label: "Daily Bonus", credits: 3, duration: 1200 },
  { id: "share", icon: "🔗", label: "Share App", credits: 5, duration: 2000 },
  { id: "refer", icon: "👥", label: "Refer Friend", credits: 15, duration: 2000 },
];

function Toast({ toast }) {
  if (!toast) return null;
  const isError = toast.type === "error";
  return (
    <div style={{
      position: "fixed",
      top: 20,
      right: 20,
      zIndex: 9999,
      background: isError ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)",
      border: `1px solid ${isError ? "rgba(239,68,68,0.4)" : "rgba(16,185,129,0.4)"}`,
      backdropFilter: "blur(20px)",
      color: isError ? "#fca5a5" : "#6ee7b7",
      padding: "12px 20px",
      borderRadius: 12,
      fontSize: 14,
      fontWeight: 600,
      boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
      maxWidth: 320,
      display: "flex",
      alignItems: "center",
      gap: 8,
    }}>
      {isError ? "⚠️" : "✓"} {toast.msg}
    </div>
  );
}

function PayModal({ plan, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [upiId, setUpiId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi");

  const validateUPI = (id) => /^[a-zA-Z0-9._-]+@[a-zA-Z]{2,}$/.test(id);

  const handlePayment = () => {
    if (paymentMethod === "upi" && !validateUPI(upiId)) {
      alert("Invalid UPI ID format. Example: yourname@okaxis");
      return;
    }
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setStep(2);
      setTimeout(() => {
        onSuccess(plan);
        onClose();
      }, 1400);
    }, 1800);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9000, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(16px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#0e0e1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, width: "100%", maxWidth: 420, overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontWeight: 800, color: "#fff", fontSize: 16, fontFamily: FF.h }}>⚡ AIGENIX Checkout</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 22 }}>×</button>
        </div>

        {step === 1 ? (
          <div style={{ padding: 24 }}>
            <div style={{ padding: "16px 20px", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: 14, marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 800, color: "#fff", fontFamily: FF.h }}>{plan.badge} Plan</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{plan.label} · {plan.credits} credits</div>
                {plan.save && <div style={{ fontSize: 12, color: "#6ee7b7", marginTop: 4 }}>🎉 {plan.save}</div>}
              </div>
              <div style={{ fontWeight: 800, fontSize: 28, color: "#fff", fontFamily: FF.h }}>₹{plan.price}</div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                {[
                  { id: "upi", label: "💳 UPI" },
                  { id: "card", label: "🏦 Card" },
                  { id: "wallet", label: "👛 Wallet" },
                ].map(m => (
                  <button key={m.id} onClick={() => setPaymentMethod(m.id)} style={{ flex: 1, padding: "9px 4px", borderRadius: 10, border: paymentMethod === m.id ? "1px solid rgba(139,92,246,0.5)" : "1px solid rgba(255,255,255,0.1)", background: paymentMethod === m.id ? "rgba(139,92,246,0.1)" : "rgba(255,255,255,0.04)", color: paymentMethod === m.id ? "#c4b5fd" : "rgba(255,255,255,0.4)", fontSize: 11, cursor: "pointer" }}>{m.label}</button>
                ))}
              </div>
            </div>

            {paymentMethod === "upi" && (
              <input value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="UPI ID: yourname@okaxis" style={{ width: "100%", padding: "13px 16px", borderRadius: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 14, outline: "none", marginBottom: 12, boxSizing: "border-box" }} />
            )}

            <div style={{ display: "flex", justifyContent: "center", gap: 14, marginBottom: 16 }}>
              {["🔒 SSL", "✓ Razorpay", "🛡️ PCI DSS"].map(b => (<span key={b} style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>{b}</span>))}
            </div>

            <button onClick={handlePayment} disabled={busy || (paymentMethod === "upi" && !validateUPI(upiId))} style={{ width: "100%", padding: 16, borderRadius: 14, border: "none", background: G, color: "#fff", fontWeight: 800, fontSize: 16, cursor: busy || (paymentMethod === "upi" && !validateUPI(upiId)) ? "not-allowed" : "pointer", fontFamily: FF.h, opacity: busy || (paymentMethod === "upi" && !validateUPI(upiId)) ? 0.6 : 1 }}>{busy ? "⟳ Processing..." : `Pay ₹${plan.price} →`}</button>
          </div>
        ) : (
          <div style={{ padding: "48px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🎉</div>
            <div style={{ fontWeight: 800, fontSize: 22, color: "#fff", fontFamily: FF.h, marginBottom: 10 }}>Payment Successful!</div>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>{plan.credits} credits added to your account!</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [credits, setCredits] = useState(30);
  const [isPro, setIsPro] = useState(false);
  const [page, setPage] = useState("home");
  const [category, setCategory] = useState("All");
  const [selectedTool, setSelectedTool] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);
  const [paymentPlan, setPaymentPlan] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [earnCompleted, setEarnCompleted] = useState({});
  const [earnLoading, setEarnLoading] = useState({});
  const outputRef = useRef(null);

  // Robust toast (clears previous timer)
  const showToast = useCallback((msg, type = "success") => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setToast({ msg, type });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 3000);
  }, []);

  const filteredTools = TOOLS.filter(t => category === "All" || t.cat === category);

  const generateContent = useCallback(async () => {
    if (!prompt.trim()) return;
    if (!selectedTool) {
      showToast("Select a tool first!", "error");
      return;
    }

    setLoading(true);
    setOutput("");
    setIsCopied(false);

    try {
      const apiKey = process.env.REACT_APP_CLAUDE_API_KEY;
      if (!apiKey) {
        throw new Error("API key not configured. Set REACT_APP_CLAUDE_API_KEY.");
      }

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: PROMPTS[selectedTool.id](prompt) }]
        })
      });

      if (!res.ok) {
        let errText = `API Error: ${res.status}`;
        try {
          const errJson = await res.json();
          errText += ` - ${errJson?.error?.message || JSON.stringify(errJson)}`;
        } catch { /* ignore */ }
        throw new Error(errText);
      }

      const d = await res.json();
      // Try common shapes: d.content?.[0]?.text or d.output?.text or d.text
      const text = d?.content?.[0]?.text || d?.output?.text || d?.text || "Something went wrong. Please try again.";

      setOutput(text);
      setCredits(prev => Math.max(0, prev - selectedTool.cost));
      setHistory(prev => [{ id: Date.now(), icon: selectedTool.icon, name: selectedTool.name, snippet: prompt.slice(0, 40) }, ...prev.slice(0, 9)]);
      showToast(`Done! −${selectedTool.cost} credits used`);

      setTimeout(() => {
        outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
    } catch (err) {
      console.error(err);
      showToast(err.message || "Network error. Please retry.", "error");
    } finally {
      setLoading(false);
    }
  }, [prompt, selectedTool, showToast]);

  const handleGenerate = () => {
    if (!prompt.trim()) {
      showToast("Enter a prompt first!", "error");
      return;
    }
    if (!selectedTool) {
      showToast("Select a tool first!", "error");
      return;
    }
    if (credits < selectedTool.cost) {
      showToast("Not enough credits!", "error");
      return;
    }
    generateContent();
  };

  const openTool = (t) => {
    setSelectedTool(t);
    setPrompt("");
    setOutput("");
    setIsCopied(false);
    // keep history (optional), do not clear by default
    setPage("studio");
  };

  const onPaymentSuccess = (plan) => {
    setCredits(prev => prev + plan.credits);
    setIsPro(true);
    setPaymentPlan(null);
    showToast(`🎉 ${plan.badge} activated! +${plan.credits} credits`);
  };

  const copyToClipboard = () => {
    if (!output) return;
    navigator.clipboard?.writeText(output).then(() => {
      setIsCopied(true);
      showToast("Copied! 📋");
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(() => {
      showToast("Clipboard not available", "error");
    });
  };

  const completeEarnTask = (task) => {
    if (earnCompleted[task.id] || earnLoading[task.id]) return;
    setEarnLoading(prev => ({ ...prev, [task.id]: true }));
    setTimeout(() => {
      setCredits(prev => prev + task.credits);
      setEarnLoading(prev => ({ ...prev, [task.id]: false }));
      setEarnCompleted(prev => ({ ...prev, [task.id]: true }));
      showToast(`+${task.credits} credits earned! 🎉`);
    }, task.duration);
  };

  // Optional daily reset for earn tasks (resets at midnight)
  useEffect(() => {
    const now = new Date();
    const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime();
    const delay = nextMidnight - now.getTime();
    const timer = setTimeout(() => setEarnCompleted({}), delay + 1000);
    return () => clearTimeout(timer);
  }, []);

  // Styles (kept compact)
  const s = {
    page: { minHeight: "100vh", background: "#06060f", color: "#e8e6f4", fontFamily: FF.b },
    nav: { position: "sticky", top: 0, zIndex: 500, background: "rgba(6,6,15,0.92)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "0 20px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" },
    logo: { display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer" },
    navBtn: (active) => ({ padding: "6px 14px", borderRadius: 8, border: "none", background: active ? "rgba(139,92,246,0.15)" : "transparent", color: active ? "#c4b5fd" : "rgba(255,255,255,0.4)", fontSize: 13, fontWeight: 500, cursor: "pointer" }),
    credBadge: { display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", padding: "6px 14px", borderRadius: 40 },
    btn: (full) => ({ padding: full ? "14px" : "8px 18px", borderRadius: 12, border: "none", background: G, color: "#fff", fontWeight: 800, fontSize: full ? 16 : 13, cursor: "pointer", width: full ? "100%" : "auto", fontFamily: FF.h }),
    card: { padding: "20px", borderRadius: 16, cursor: "pointer", background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", transition: "all 0.2s" },
    input: { width: "100%", padding: "16px 20px", borderRadius: 14, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 15, outline: "none", fontFamily: FF.b, resize: "vertical", boxSizing: "border-box" },
  };

  const categories = ["All", "Text", "Image", "Video", "Biz"];

  return (
    <div style={s.page}>
      <Toast toast={toast} />
      {paymentPlan && <PayModal plan={paymentPlan} onClose={() => setPaymentPlan(null)} onSuccess={onPaymentSuccess} />}

      <nav style={s.nav}>
        <button style={s.logo} onClick={() => setPage("home")}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: G, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>⚡</div>
          <span style={{ fontWeight: 800, fontSize: 18, color: "#fff", fontFamily: FF.h }}>AIGENIX</span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", border: "1px solid rgba(255,255,255,0.12)", padding: "2px 7px", borderRadius: 20 }}>PRO</span>
        </button>

        <div style={{ display: "flex", gap: 4 }}>
          {[["home", "Home"], ["studio", "Studio"], ["pricing", "Pricing"], ["earn", "Earn Free"]].map(([id, l]) => (
            <button key={id} onClick={() => setPage(id)} style={s.navBtn(page === id)}>{l}</button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={s.credBadge}>
            <span>⚡</span>
            <span style={{ fontWeight: 800, fontSize: 16, color: "#fff" }}>{credits}</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>credits</span>
          </div>
          <button style={s.btn(false)} onClick={() => setPaymentPlan(PLANS[1])}>Upgrade ↗</button>
        </div>
      </nav>

      {/* HOME */}
      {page === "home" && (
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ textAlign: "center", padding: "80px 24px 48px", maxWidth: 860, margin: "0 auto" }}>
            <h1 style={{ fontFamily: FF.h, fontSize: "clamp(36px,6vw,68px)", fontWeight: 800, lineHeight: 1.08, color: "#fff", margin: "0 0 18px", letterSpacing: "-0.03em" }}>
              21 AI Tools.<br />
              <span style={{ background: G, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>One Platform.</span>
            </h1>
            <p style={{ fontSize: 17, color: "rgba(255,255,255,0.38)", maxWidth: 480, margin: "0 auto 44px", lineHeight: 1.8 }}>
              Write, generate images, create video scripts — powered by AI. Free to start.
            </p>
            <div style={{ maxWidth: 640, margin: "0 auto 16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 18, padding: "6px 6px 6px 20px", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 18 }}>✨</span>
              <input value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Describe what you want to create..." style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#e8e6f4", fontSize: 15, fontFamily: FF.b, padding: "10px 0" }} />
              <button onClick={() => setPage("studio")} style={s.btn(false)}>Create →</button>
            </div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>30 free credits · No card required</p>
          </div>

          {/* Tools Grid */}
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px 80px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
              <h2 style={{ fontFamily: FF.h, fontSize: 28, fontWeight: 800, color: "#fff", margin: 0 }}>All {TOOLS.length} Tools</h2>
              <div style={{ display: "flex", gap: 6 }}>
                {categories.map(c => (
                  <button key={c} onClick={() => setCategory(c)} style={{ padding: "6px 14px", borderRadius: 30, border: category === c ? "1px solid rgba(139,92,246,0.5)" : "1px solid rgba(255,255,255,0.08)", background: category === c ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.03)", color: category === c ? "#c4b5fd" : "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer" }}>{c}</button>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12 }}>
              {filteredTools.map(t => (
                <div key={t.id} onClick={() => openTool(t)} style={s.card} onMouseEnter={e => { e.currentTarget.style.background = "rgba(139,92,246,0.08)"; e.currentTarget.style.borderColor = "rgba(139,92,246,0.3)"; e.currentTarget.style.transform = "translateY(-2px)"; }} onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.025)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{t.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#fff", marginBottom: 4, fontFamily: FF.h }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 14, lineHeight: 1.5 }}>{t.desc}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "#a78bfa", background: "rgba(139,92,246,0.12)", padding: "3px 10px", borderRadius: 20 }}>⚡ {t.cost} credits</span>
                    {t.tag && <span style={{ fontSize: 10, color: t.tag.includes("🔥") ? "#fca5a5" : t.tag === "New" ? "#6ee7b7" : "#c4b5fd", background: t.tag.includes("🔥") ? "rgba(239,68,68,0.1)" : t.tag === "New" ? "rgba(16,185,129,0.1)" : "rgba(139,92,246,0.1)", padding: "2px 8px", borderRadius: 20 }}>{t.tag}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STUDIO */}
      {page === "studio" && (
        <div style={{ maxWidth: 820, margin: "0 auto", padding: "48px 24px 80px", position: "relative", zIndex: 1 }}>
          <h2 style={{ fontFamily: FF.h, fontWeight: 800, fontSize: 26, color: "#fff", marginBottom: 24 }}>AI Studio</h2>

          <div style={{ marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", letterSpacing: "0.12em", marginBottom: 8 }}>SELECT TOOL</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {TOOLS.map(t => (
                <button key={t.id} onClick={() => { setSelectedTool(t); setOutput(""); setIsCopied(false); }} style={{ padding: "6px 12px", borderRadius: 30, border: selectedTool?.id === t.id ? "1px solid rgba(139,92,246,0.5)" : "1px solid rgba(255,255,255,0.08)", background: selectedTool?.id === t.id ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.03)", color: selectedTool?.id === t.id ? "#c4b5fd" : "rgba(255,255,255,0.4)", fontSize: 12, cursor: "pointer" }}>{t.icon} {t.name}</button>
              ))}
            </div>
          </div>

          {selectedTool ? (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, padding: "14px 18px", background: "rgba(139,92,246,0.07)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 12, flexWrap: "wrap", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 26 }}>{selectedTool.icon}</span>
                  <div>
                    <div style={{ fontWeight: 800, color: "#fff", fontFamily: FF.h }}>{selectedTool.name}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{selectedTool.desc}</div>
                  </div>
                </div>
                <div style={{ padding: "6px 14px", borderRadius: 30, background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)", fontSize: 13, color: "#c4b5fd" }}>⚡ {selectedTool.cost} credits</div>
              </div>

              <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder={`Describe what you want from ${selectedTool.name}...`} rows={5} style={{ ...s.input, display: "block", marginBottom: 12, minHeight: 130 }} />

              <button onClick={handleGenerate} disabled={loading || !prompt.trim() || credits < selectedTool.cost} style={{ ...s.btn(true), opacity: (!prompt.trim() || credits < selectedTool.cost) && !loading ? 0.45 : 1, marginBottom: 12 }}>
                {loading ? "⟳ Generating..." : `✨ Generate — ${selectedTool.cost} Credits`}
              </button>

              {credits < selectedTool.cost && (
                <div style={{ padding: "10px 16px", borderRadius: 10, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", color: "rgba(239,68,68,0.8)", fontSize: 13, marginBottom: 12 }}>
                  ⚠️ Not enough credits. <span onClick={() => setPage("pricing")} style={{ color: "#a78bfa", cursor: "pointer", textDecoration: "underline" }}>Buy plan →</span> or <span onClick={() => setPage("earn")} style={{ color: "#6ee7b7", cursor: "pointer", textDecoration: "underline" }}>Earn free →</span>
                </div>
              )}

              {output && (
                <div ref={outputRef} style={{ marginTop: 24 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", letterSpacing: "0.12em" }}>OUTPUT</span>
                    <button onClick={copyToClipboard} style={{ padding: "6px 14px", borderRadius: 8, border: isCopied ? "1px solid rgba(16,185,129,0.4)" : "1px solid rgba(255,255,255,0.1)", background: isCopied ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.05)", color: isCopied ? "#6ee7b7" : "rgba(255,255,255,0.5)", fontSize: 12, cursor: "pointer" }}>{isCopied ? "✓ Copied" : "📋 Copy"}</button>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 14, padding: 20, color: "rgba(255,255,255,0.8)", fontSize: 14, lineHeight: 1.85, whiteSpace: "pre-wrap", wordBreak: "break-word", maxHeight: 600, overflowY: "auto" }}>
                    {output}
                  </div>
                </div>
              )}

              {history.length > 0 && (
                <div style={{ marginTop: 40 }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.22)", letterSpacing: "0.12em", marginBottom: 10 }}>RECENT</div>
                  {history.map(h => (
                    <div key={h.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", borderRadius: 10, marginBottom: 6, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", fontSize: 13, color: "rgba(255,255,255,0.35)" }}>
                      <span>{h.icon}</span>
                      <span style={{ color: "#a78bfa", fontWeight: 500 }}>{h.name}</span>
                      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{h.snippet}...</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "rgba(255,255,255,0.2)" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>☝️</div>
              <div>Select a tool above to get started</div>
            </div>
          )}
        </div>
      )}

      {/* PRICING */}
      {page === "pricing" && (
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "72px 24px 96px", textAlign: "center", position: "relative", zIndex: 1 }}>
          <h2 style={{ fontFamily: FF.h, fontSize: 40, fontWeight: 800, color: "#fff", margin: "0 0 12px" }}>Simple Pricing</h2>
          <p style={{ color: "rgba(255,255,255,0.36)", fontSize: 16, marginBottom: 52 }}>Start free. Upgrade when you're ready.</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14, marginBottom: 52 }}>
            <div style={{ padding: "28px 22px", borderRadius: 20, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", textAlign: "left" }}>
              <div style={{ fontWeight: 800, fontSize: 12, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", marginBottom: 16, fontFamily: FF.h }}>FREE</div>
              <div style={{ fontFamily: FF.h, fontSize: 40, fontWeight: 800, color: "#fff", lineHeight: 1 }}>₹0</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.28)", margin: "6px 0 18px" }}>Forever</div>
              {["30 signup credits", "All 12 tools", "Ad-supported", "Daily bonus"].map(f => (
                <div key={f} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 7, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
                  <span style={{ color: "#6ee7b7" }}>✓</span>{f}
                </div>
              ))}
              <button onClick={() => setPage("studio")} style={{ width: "100%", marginTop: 20, padding: "12px", borderRadius: 12, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: FF.h }}>Start Free</button>
            </div>

            {PLANS.map(plan => (
              <div key={plan.id} style={{ padding: "28px 22px", borderRadius: 20, position: "relative", background: plan.popular ? "rgba(139,92,246,0.08)" : "rgba(255,255,255,0.025)", border: plan.popular ? "1px solid rgba(139,92,246,0.4)" : "1px solid rgba(255,255,255,0.07)", textAlign: "left" }}>
                {plan.popular && <div style={{ position: "absolute", top: -11, left: "50%", transform: "translateX(-50%)", background: G, color: "#fff", fontSize: 10, fontWeight: 800, fontFamily: FF.h, padding: "3px 16px", borderRadius: 40, whiteSpace: "nowrap" }}>BEST VALUE</div>}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ fontWeight: 800, fontSize: 12, color: plan.popular ? "#c4b5fd" : "rgba(255,255,255,0.4)", letterSpacing: "0.1em", fontFamily: FF.h }}>{plan.badge.toUpperCase()}</div>
                  {plan.save && <span style={{ fontSize: 11, color: "#6ee7b7", background: "rgba(16,185,129,0.1)", padding: "2px 8px", borderRadius: 20 }}>{plan.save}</span>}
                </div>
                <div style={{ fontFamily: FF.h, fontSize: 40, fontWeight: 800, color: "#fff", lineHeight: 1 }}>₹{plan.price}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.28)", margin: "6px 0 18px" }}>{plan.label}</div>
                <div style={{ fontSize: 13, color: plan.popular ? "#c4b5fd" : "rgba(255,255,255,0.4)", background: plan.popular ? "rgba(139,92,246,0.12)" : "rgba(255,255,255,0.05)", padding: "7px 12px", borderRadius: 8, marginBottom: 16, fontWeight: 600 }}>{plan.credits} credits</div>
                {["All tools", "Zero ads", "Priority AI", "Download history"].map(f => (
                  <div key={f} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 7, fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
                    <span style={{ color: "#6ee7b7" }}>✓</span>{f}
                  </div>
                ))}
                <button onClick={() => setPaymentPlan(plan)} style={{ width: "100%", marginTop: 20, padding: "12px", borderRadius: 12, border: "none", background: plan.popular ? G : "rgba(255,255,255,0.08)", color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer", fontFamily: FF.h }}>Buy {plan.badge} →</button>
              </div>
            ))}
          </div>

          <div style={{ padding: "20px 28px", borderRadius: 14, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 20 }}>
            {["📱 UPI", "💳 Cards", "🏦 Net Banking", "👛 Wallets", "🔒 Razorpay Secured"].map(m => (<span key={m} style={{ fontSize: 13, color: "rgba(255,255,255,0.28)" }}>{m}</span>))}
          </div>
        </div>
      )}

      {/* EARN */}
      {page === "earn" && (
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "72px 24px 96px", textAlign: "center", position: "relative", zIndex: 1 }}>
          <h2 style={{ fontFamily: FF.h, fontSize: 38, fontWeight: 800, color: "#fff", margin: "0 0 12px" }}>Earn Free Credits</h2>
          <p style={{ color: "rgba(255,255,255,0.36)", fontSize: 15, marginBottom: 48 }}>Complete tasks, get credits. No card needed.</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 12, marginBottom: 40 }}>
            {EARN.map(a => {
              const busy = earnLoading[a.id]; const done = earnCompleted[a.id];
              return (
                <button key={a.id} disabled={done || busy} onClick={() => completeEarnTask(a)} style={{ padding: "24px 16px", borderRadius: 16, border: done ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(255,255,255,0.08)", background: done ? "rgba(16,185,129,0.07)" : "rgba(255,255,255,0.025)", cursor: done ? "default" : "pointer", color: "#e8e6f4", transition: "all 0.2s" }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{busy ? "⏳" : done ? "✅" : a.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#fff", marginBottom: 4, fontFamily: FF.h }}>{a.label}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, fontFamily: FF.h, background: done ? "none" : G, WebkitBackgroundClip: done ? "unset" : "text", WebkitTextFillColor: done ? "#6ee7b7" : "transparent" }}>{done ? "Claimed!" : busy ? "..." : `+${a.credits} ⚡`}</div>
                </button>
              );
            })}
          </div>

          <div style={{ padding: "32px", borderRadius: 20, background: "rgba(139,92,246,0.07)", border: "1px solid rgba(139,92,246,0.2)" }}>
            <div style={{ fontWeight: 800, fontSize: 20, color: "#fff", marginBottom: 10, fontFamily: FF.h }}>🎁 Refer & Earn</div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 20, lineHeight: 1.7 }}>You get <strong style={{ color: "#c4b5fd" }}>+15 credits</strong> · Friend gets <strong style={{ color: "#c4b5fd" }}>+10 credits</strong></div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "12px 16px", maxWidth: 380, margin: "0 auto" }}>
              <span style={{ flex: 1, fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: "monospace" }}>aigenix.app/ref/user4829</span>
              <button onClick={() => navigator.clipboard?.writeText("aigenix.app/ref/user4829").then(() => showToast("Link copied! 🔗"))} style={{ padding: "7px 14px", borderRadius: 8, border: "none", background: G, color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Copy</button>
            </div>
          </div>
        </div>
      )}

      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "28px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: G, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>⚡</div>
          <span style={{ fontWeight: 800, color: "rgba(255,255,255,0.4)", fontSize: 13, fontFamily: FF.h }}>AIGENIX PRO</span>
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.18)" }}>12 AI Tools · Free to start</div>
        <div style={{ display: "flex", gap: 20 }}>{["Privacy", "Terms", "Contact"].map(l => (<span key={l} style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", cursor: "pointer" }}>{l}</span>))}</div>
      </footer>
    </div>
  );
}
