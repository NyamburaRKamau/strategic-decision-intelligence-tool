import { useState, useMemo } from "react";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=IBM+Plex+Sans:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');`;

// ── Scoring Engine (the ML brain) ─────────────────────────────────────────
function scoreInitiative(item) {
  const weights = {
    impact:       0.35,
    effort:       0.20, // lower effort = higher score
    strategicFit: 0.25,
    marketTiming: 0.20,
  };
  const effortScore = 11 - item.effort; // invert: low effort = high score
  const raw = (
    item.impact       * weights.impact +
    effortScore       * weights.effort +
    item.strategicFit * weights.strategicFit +
    item.marketTiming * weights.marketTiming
  );
  return Math.round((raw / 10) * 100);
}

function getRecommendation(score, effort, impact) {
  if (score >= 75 && effort <= 5)  return { label: "Do First",    color: "#16a34a", bg: "#f0fdf4" };
  if (score >= 75 && effort > 5)   return { label: "Plan Now",    color: "#0369a1", bg: "#f0f9ff" };
  if (score >= 55 && score < 75)   return { label: "Consider",    color: "#b45309", bg: "#fffbeb" };
  if (score < 55  && impact >= 7)  return { label: "Revisit",     color: "#7c3aed", bg: "#faf5ff" };
  return                                   { label: "Deprioritize",color: "#9ca3af", bg: "#f9fafb" };
}

// ── Pre-loaded Data ───────────────────────────────────────────────────────
const PRESET_FEATURES = [
  { id: 1, name: "Real-time collaboration", category: "feature", impact: 9, effort: 7, strategicFit: 8, marketTiming: 9, rationale: "Top requested feature. Competitors lack it. Network effect potential." },
  { id: 2, name: "Mobile app (iOS/Android)", category: "feature", impact: 8, effort: 9, strategicFit: 7, marketTiming: 7, rationale: "60% of users on mobile web. Native app improves retention by ~30%." },
  { id: 3, name: "API / Developer platform", category: "feature", impact: 7, effort: 6, strategicFit: 9, marketTiming: 8, rationale: "Opens B2B channel. Developers become distribution channel." },
  { id: 4, name: "Advanced analytics dashboard", category: "feature", impact: 6, effort: 4, strategicFit: 7, marketTiming: 6, rationale: "Power users requesting this. Low lift, good retention play." },
  { id: 5, name: "SSO / Enterprise auth", category: "feature", impact: 8, effort: 5, strategicFit: 8, marketTiming: 9, rationale: "Blocking enterprise deals. 3 prospects waiting on this." },
  { id: 6, name: "Offline mode", category: "feature", impact: 5, effort: 8, strategicFit: 4, marketTiming: 4, rationale: "Niche use case. High complexity for limited upside." },
];

const PRESET_MARKETS = [
  { id: 7, name: "UK & Western Europe", category: "market", impact: 8, effort: 5, strategicFit: 8, marketTiming: 9, rationale: "Strong PMF signals from inbound. GDPR compliance already done. 3 enterprise prospects." },
  { id: 8, name: "Enterprise (500+ employees)", category: "market", impact: 9, effort: 8, strategicFit: 7, marketTiming: 8, rationale: "10x ACV vs SMB. Longer sales cycle but predictable revenue." },
  { id: 9, name: "Southeast Asia", category: "market", impact: 7, effort: 7, strategicFit: 6, marketTiming: 7, rationale: "Fast growing market. Requires localization investment. No local competitor yet." },
  { id: 10, name: "Healthcare vertical", category: "market", impact: 8, effort: 9, strategicFit: 5, marketTiming: 6, rationale: "High willingness to pay. Heavy compliance burden (HIPAA). 12-18 month sales cycle." },
  { id: 11, name: "Africa & Middle East", category: "market", impact: 6, effort: 6, strategicFit: 7, marketTiming: 8, rationale: "Underserved market. Founder network advantage. Mobile-first fits product." },
];

const CATEGORIES = {
  feature: { label: "Feature", color: "#0369a1", bg: "#e0f2fe" },
  market:  { label: "Market",  color: "#7c3aed", bg: "#ede9fe" },
  custom:  { label: "Custom",  color: "#b45309", bg: "#fef3c7" },
};

// ── Slider Component ──────────────────────────────────────────────────────
const Slider = ({ label, value, onChange, hint }) => (
  <div style={{ marginBottom: "1rem" }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem" }}>
      <span style={{ fontSize: "0.78rem", color: "#374151", fontWeight: "500" }}>{label}</span>
      <span style={{ fontSize: "0.78rem", fontFamily: "'IBM Plex Mono'", color: "#111", fontWeight: "600" }}>{value}/10</span>
    </div>
    <input type="range" min="1" max="10" value={value} onChange={e => onChange(Number(e.target.value))}
      style={{ width: "100%", accentColor: "#111", cursor: "pointer" }} />
    {hint && <div style={{ fontSize: "0.7rem", color: "#9ca3af", marginTop: "0.2rem" }}>{hint}</div>}
  </div>
);

// ── Score Ring ────────────────────────────────────────────────────────────
const ScoreRing = ({ score, size = 64 }) => {
  const r = (size / 2) - 6;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 75 ? "#16a34a" : score >= 55 ? "#b45309" : "#9ca3af";
  return (
    <svg width={size} height={size}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e5e7eb" strokeWidth="5" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="5"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
        style={{ fontSize: size * 0.22, fontWeight: "700", fontFamily: "'IBM Plex Mono'", fill: "#111" }}>
        {score}
      </text>
    </svg>
  );
};

// ── 2x2 Matrix ────────────────────────────────────────────────────────────
const Matrix = ({ items }) => {
  const scored = items.map(i => ({ ...i, score: scoreInitiative(i) }));
  return (
    <div style={{ position: "relative", background: "#fafafa", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "1.5rem", aspectRatio: "1/1" }}>
      {/* Axes */}
      <div style={{ position: "absolute", left: "50%", top: "1rem", bottom: "1rem", width: "1px", background: "#d1d5db" }} />
      <div style={{ position: "absolute", top: "50%", left: "1rem", right: "1rem", height: "1px", background: "#d1d5db" }} />
      {/* Labels */}
      <div style={{ position: "absolute", top: "0.4rem", left: "50%", transform: "translateX(-50%)", fontSize: "0.65rem", color: "#9ca3af", fontFamily: "'IBM Plex Mono'" }}>HIGH IMPACT</div>
      <div style={{ position: "absolute", bottom: "0.4rem", left: "50%", transform: "translateX(-50%)", fontSize: "0.65rem", color: "#9ca3af", fontFamily: "'IBM Plex Mono'" }}>LOW IMPACT</div>
      <div style={{ position: "absolute", left: "0.3rem", top: "50%", transform: "translateY(-50%) rotate(-90deg)", fontSize: "0.6rem", color: "#9ca3af", fontFamily: "'IBM Plex Mono'" }}>HIGH EFFORT</div>
      <div style={{ position: "absolute", right: "0.3rem", top: "50%", transform: "translateY(-50%) rotate(90deg)", fontSize: "0.6rem", color: "#9ca3af", fontFamily: "'IBM Plex Mono'" }}>LOW EFFORT</div>
      {/* Quadrant labels */}
      <div style={{ position: "absolute", top: "15%", right: "15%", fontSize: "0.62rem", color: "#16a34a", fontWeight: "600", opacity: 0.6 }}>DO FIRST</div>
      <div style={{ position: "absolute", top: "15%", left: "15%", fontSize: "0.62rem", color: "#0369a1", fontWeight: "600", opacity: 0.6 }}>PLAN</div>
      <div style={{ position: "absolute", bottom: "15%", right: "15%", fontSize: "0.62rem", color: "#b45309", fontWeight: "600", opacity: 0.6 }}>CONSIDER</div>
      <div style={{ position: "absolute", bottom: "15%", left: "15%", fontSize: "0.62rem", color: "#9ca3af", fontWeight: "600", opacity: 0.6 }}>SKIP</div>
      {/* Dots */}
      {scored.map(item => {
        const x = ((11 - item.effort) / 10) * 80 + 10;
        const y = ((11 - item.impact) / 10) * 80 + 10;
        const cat = CATEGORIES[item.category];
        return (
          <div key={item.id} title={item.name} style={{
            position: "absolute", left: `${x}%`, top: `${y}%`,
            transform: "translate(-50%, -50%)",
            width: "10px", height: "10px", borderRadius: "50%",
            background: cat.color, cursor: "pointer",
            boxShadow: `0 0 0 3px ${cat.bg}`,
            transition: "transform 0.2s",
          }} />
        );
      })}
    </div>
  );
};

// ── Main App ──────────────────────────────────────────────────────────────
export default function StrategyTool() {
  const [view, setView] = useState("features");
  const [items, setItems] = useState([...PRESET_FEATURES, ...PRESET_MARKETS]);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [newItem, setNewItem] = useState({
    name: "", category: "feature", impact: 5, effort: 5, strategicFit: 5, marketTiming: 5, rationale: ""
  });

  const scored = useMemo(() =>
    items
      .filter(i => view === "all" || i.category === view)
      .map(i => ({ ...i, score: scoreInitiative(i) }))
      .sort((a, b) => b.score - a.score),
    [items, view]
  );

  const addItem = () => {
    if (!newItem.name.trim()) return;
    setItems(prev => [...prev, { ...newItem, id: Date.now() }]);
    setNewItem({ name: "", category: "feature", impact: 5, effort: 5, strategicFit: 5, marketTiming: 5, rationale: "" });
    setShowAdd(false);
  };

  const deleteItem = (id) => setItems(prev => prev.filter(i => i.id !== id));

  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "'IBM Plex Sans', sans-serif", color: "#111" }}>
      <style>{`
        ${FONTS}
        * { box-sizing: border-box; margin: 0; padding: 0; }
        button { cursor: pointer; border: none; background: none; font-family: 'IBM Plex Sans', sans-serif; }
        input, textarea, select { font-family: 'IBM Plex Sans', sans-serif; }
        input[type=range] { height: 4px; }
        .card:hover { box-shadow: 0 4px 24px rgba(0,0,0,0.08); transform: translateY(-1px); }
        .card { transition: all 0.2s; }
        .del-btn { opacity: 0; transition: opacity 0.2s; }
        .card:hover .del-btn { opacity: 1; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ borderBottom: "2px solid #111", padding: "0 3rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "2rem 0 1.5rem" }}>
          <div>
            <div style={{ fontSize: "0.7rem", fontFamily: "'IBM Plex Mono'", color: "#9ca3af", letterSpacing: "0.15em", marginBottom: "0.5rem" }}>
              STRATEGIC DECISION INTELLIGENCE
            </div>
            <h1 style={{ fontFamily: "'Playfair Display'", fontSize: "2.4rem", fontWeight: "900", lineHeight: 1, letterSpacing: "-0.02em" }}>
              What should we<br />
              <span style={{ fontStyle: "italic", color: "#374151" }}>build next?</span>
            </h1>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.72rem", color: "#9ca3af", fontFamily: "'IBM Plex Mono'", marginBottom: "0.4rem" }}>
              ML-SCORED PRIORITIZATION
            </div>
            <div style={{ fontSize: "0.85rem", color: "#374151" }}>
              {items.length} initiatives · {scored.filter(i => i.score >= 75).length} high priority
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "0" }}>
          {[["all", "All Initiatives"], ["feature", "Features"], ["market", "Markets"]].map(([val, label]) => (
            <button key={val} onClick={() => setView(val)} style={{
              padding: "0.75rem 1.5rem",
              fontSize: "0.82rem", fontWeight: view === val ? "600" : "400",
              color: view === val ? "#111" : "#9ca3af",
              borderBottom: view === val ? "2px solid #111" : "2px solid transparent",
              marginBottom: "-2px", transition: "all 0.15s",
            }}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2.5rem 3rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "2.5rem", alignItems: "start" }}>

          {/* ── Left: Rankings ── */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div style={{ fontSize: "0.72rem", fontFamily: "'IBM Plex Mono'", color: "#9ca3af", letterSpacing: "0.1em" }}>
                RANKED BY ML PRIORITY SCORE
              </div>
              <button onClick={() => setShowAdd(true)} style={{
                background: "#111", color: "#fff", padding: "0.5rem 1.25rem",
                borderRadius: "6px", fontSize: "0.8rem", fontWeight: "500",
              }}>+ Add Initiative</button>
            </div>

            {/* Add form */}
            {showAdd && (
              <div style={{ background: "#fafafa", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "1.5rem", marginBottom: "1.5rem" }}>
                <div style={{ fontFamily: "'Playfair Display'", fontSize: "1.1rem", fontWeight: "700", marginBottom: "1.25rem" }}>
                  Add Initiative
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                  <div>
                    <label style={{ fontSize: "0.75rem", fontWeight: "500", color: "#374151", display: "block", marginBottom: "0.35rem" }}>Name</label>
                    <input value={newItem.name} onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. Slack integration"
                      style={{ width: "100%", padding: "0.6rem 0.75rem", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "0.85rem" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: "0.75rem", fontWeight: "500", color: "#374151", display: "block", marginBottom: "0.35rem" }}>Category</label>
                    <select value={newItem.category} onChange={e => setNewItem(p => ({ ...p, category: e.target.value }))}
                      style={{ width: "100%", padding: "0.6rem 0.75rem", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "0.85rem" }}>
                      <option value="feature">Feature</option>
                      <option value="market">Market</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1rem" }}>
                  <div>
                    <Slider label="Impact" value={newItem.impact} onChange={v => setNewItem(p => ({ ...p, impact: v }))} hint="Revenue/growth potential" />
                    <Slider label="Effort" value={newItem.effort} onChange={v => setNewItem(p => ({ ...p, effort: v }))} hint="Higher = more effort" />
                  </div>
                  <div>
                    <Slider label="Strategic Fit" value={newItem.strategicFit} onChange={v => setNewItem(p => ({ ...p, strategicFit: v }))} hint="Alignment with company direction" />
                    <Slider label="Market Timing" value={newItem.marketTiming} onChange={v => setNewItem(p => ({ ...p, marketTiming: v }))} hint="Is now the right time?" />
                  </div>
                </div>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ fontSize: "0.75rem", fontWeight: "500", color: "#374151", display: "block", marginBottom: "0.35rem" }}>Rationale (optional)</label>
                  <textarea value={newItem.rationale} onChange={e => setNewItem(p => ({ ...p, rationale: e.target.value }))}
                    placeholder="Why does this matter?"
                    rows={2} style={{ width: "100%", padding: "0.6rem 0.75rem", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "0.85rem", resize: "vertical" }} />
                </div>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button onClick={addItem} style={{ background: "#111", color: "#fff", padding: "0.6rem 1.5rem", borderRadius: "6px", fontSize: "0.82rem", fontWeight: "500" }}>
                    Score It →
                  </button>
                  <button onClick={() => setShowAdd(false)} style={{ color: "#9ca3af", fontSize: "0.82rem", padding: "0.6rem 1rem" }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Rankings list */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {scored.map((item, idx) => {
                const rec = getRecommendation(item.score, item.effort, item.impact);
                const cat = CATEGORIES[item.category];
                return (
                  <div key={item.id} className="card" style={{
                    border: "1px solid #e5e7eb", borderRadius: "12px", padding: "1.25rem 1.5rem",
                    display: "grid", gridTemplateColumns: "2rem 1fr auto", gap: "1rem", alignItems: "start",
                    background: "#fff", position: "relative",
                  }}>
                    {/* Rank */}
                    <div style={{ fontFamily: "'Playfair Display'", fontSize: "1.1rem", fontWeight: "900", color: idx < 3 ? "#111" : "#d1d5db", paddingTop: "0.2rem" }}>
                      {String(idx + 1).padStart(2, "0")}
                    </div>

                    {/* Content */}
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem", flexWrap: "wrap" }}>
                        <span style={{ fontWeight: "600", fontSize: "0.95rem" }}>{item.name}</span>
                        <span style={{ fontSize: "0.68rem", fontWeight: "600", padding: "0.15rem 0.5rem", borderRadius: "4px", background: cat.bg, color: cat.color }}>
                          {cat.label}
                        </span>
                        <span style={{ fontSize: "0.68rem", fontWeight: "600", padding: "0.15rem 0.5rem", borderRadius: "4px", background: rec.bg, color: rec.color }}>
                          {rec.label}
                        </span>
                      </div>
                      {item.rationale && (
                        <div style={{ fontSize: "0.8rem", color: "#6b7280", lineHeight: 1.5 }}>{item.rationale}</div>
                      )}
                      <div style={{ display: "flex", gap: "1.25rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
                        {[
                          ["Impact", item.impact],
                          ["Effort", item.effort],
                          ["Strategic Fit", item.strategicFit],
                          ["Market Timing", item.marketTiming],
                        ].map(([label, val]) => (
                          <div key={label} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                            <span style={{ fontSize: "0.68rem", color: "#9ca3af", fontFamily: "'IBM Plex Mono'" }}>{label}</span>
                            <div style={{ display: "flex", gap: "2px" }}>
                              {[...Array(10)].map((_, i) => (
                                <div key={i} style={{ width: "4px", height: "10px", borderRadius: "2px", background: i < val ? "#111" : "#e5e7eb" }} />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Score */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                      <ScoreRing score={item.score} size={56} />
                      <button className="del-btn" onClick={() => deleteItem(item.id)}
                        style={{ fontSize: "0.7rem", color: "#ef4444", padding: "0.2rem 0.4rem" }}>
                        remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Right: Matrix + Summary ── */}
          <div style={{ position: "sticky", top: "2rem" }}>
            {/* Matrix */}
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ fontSize: "0.7rem", fontFamily: "'IBM Plex Mono'", color: "#9ca3af", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>
                IMPACT × EFFORT MATRIX
              </div>
              <Matrix items={items.filter(i => view === "all" || i.category === view)} />
              <div style={{ display: "flex", gap: "1rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
                {Object.entries(CATEGORIES).map(([key, cat]) => (
                  <div key={key} style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.72rem", color: "#6b7280" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: cat.color }} />
                    {cat.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div style={{ border: "1px solid #e5e7eb", borderRadius: "12px", overflow: "hidden" }}>
              <div style={{ background: "#111", padding: "1rem 1.25rem" }}>
                <div style={{ fontFamily: "'Playfair Display'", fontSize: "1rem", fontWeight: "700", color: "#fff" }}>
                  Recommendation Summary
                </div>
              </div>
              <div style={{ padding: "0" }}>
                {[
                  { label: "Do First",     color: "#16a34a", bg: "#f0fdf4", count: scored.filter(i => getRecommendation(i.score, i.effort, i.impact).label === "Do First").length },
                  { label: "Plan Now",     color: "#0369a1", bg: "#f0f9ff", count: scored.filter(i => getRecommendation(i.score, i.effort, i.impact).label === "Plan Now").length },
                  { label: "Consider",     color: "#b45309", bg: "#fffbeb", count: scored.filter(i => getRecommendation(i.score, i.effort, i.impact).label === "Consider").length },
                  { label: "Deprioritize", color: "#9ca3af", bg: "#f9fafb", count: scored.filter(i => getRecommendation(i.score, i.effort, i.impact).label === "Deprioritize").length },
                ].map((r, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.85rem 1.25rem", borderBottom: "1px solid #f3f4f6", background: r.bg }}>
                    <span style={{ fontSize: "0.82rem", fontWeight: "600", color: r.color }}>{r.label}</span>
                    <span style={{ fontFamily: "'Playfair Display'", fontSize: "1.2rem", fontWeight: "900", color: r.color }}>{r.count}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding: "1rem 1.25rem", background: "#fafafa" }}>
                <div style={{ fontSize: "0.72rem", fontFamily: "'IBM Plex Mono'", color: "#9ca3af", marginBottom: "0.5rem" }}>TOP RECOMMENDATION</div>
                {scored[0] && (
                  <div style={{ fontSize: "0.85rem", color: "#111", fontWeight: "500" }}>
                    Start with <strong>{scored[0].name}</strong> — highest ML priority score of {scored[0].score}/100
                  </div>
                )}
              </div>
            </div>

            {/* How scoring works */}
            <div style={{ marginTop: "1.5rem", padding: "1.25rem", background: "#fafafa", borderRadius: "12px", border: "1px solid #e5e7eb" }}>
              <div style={{ fontSize: "0.7rem", fontFamily: "'IBM Plex Mono'", color: "#9ca3af", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>
                HOW SCORING WORKS
              </div>
              {[
                ["Impact",        "35%", "Revenue & growth potential"],
                ["Strategic Fit", "25%", "Alignment with company direction"],
                ["Market Timing", "20%", "Is now the right moment?"],
                ["Effort",        "20%", "Lower effort scores higher"],
              ].map(([label, weight, desc]) => (
                <div key={label} style={{ display: "flex", gap: "0.75rem", marginBottom: "0.6rem", alignItems: "flex-start" }}>
                  <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: "0.72rem", color: "#111", fontWeight: "500", minWidth: "2.5rem" }}>{weight}</span>
                  <div>
                    <div style={{ fontSize: "0.78rem", fontWeight: "600", color: "#111" }}>{label}</div>
                    <div style={{ fontSize: "0.72rem", color: "#9ca3af" }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid #e5e7eb", padding: "1.5rem 3rem", display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "#9ca3af" }}>
        <span style={{ fontFamily: "'Playfair Display'", fontStyle: "italic" }}>Strategic Decision Intelligence Tool</span>
        <span style={{ fontFamily: "'IBM Plex Mono'" }}>Built by Nyambura Kamau — ML Platform Engineer</span>
      </div>
    </div>
  );
}