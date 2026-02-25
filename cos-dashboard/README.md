# 🧠 Strategic Decision Intelligence Tool

> Every startup has too many things to work on and not enough resources. This tool tells you what to prioritize — and why.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Try%20It%20Now-black)](https://NyamburaaKamau.github.io/cos-dashboard)
[![Built With](https://img.shields.io/badge/Built%20With-React%20%2B%20ML%20Scoring-blue)](#)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

Built by [Nyambura Kamau](https://github.com/NyamburaaKamau) — ML Platform Engineer → Operations & Strategy

---

## The Problem

Every strategy meeting ends the same way:

```
"We should build the mobile app."
"But the API would unlock more revenue."
"What about SSO — we're losing enterprise deals without it."
"We don't have the engineering bandwidth for any of this."
```

Everyone has an opinion. Nobody has a framework. The loudest voice wins.

**This tool replaces opinion with a scoring model. Every initiative gets a priority score based on what actually drives startup success.**

---

## How It Works

### The Scoring Model

Every initiative is scored across 4 dimensions:

| Dimension | Weight | What It Measures |
|-----------|--------|-----------------|
| Impact | 35% | Revenue and growth potential |
| Strategic Fit | 25% | Alignment with company direction |
| Market Timing | 20% | Is now the right moment? |
| Effort | 20% | Lower effort scores higher |

**Why impact weighted highest?**
At an early-stage startup, impact is everything. A technically elegant solution to the wrong problem is worthless.

**Why effort only 20%?**
Effort matters but it's not the whole story. A high-effort initiative with 10x impact is worth doing. A low-effort initiative with no impact is still a distraction.

### The Output

```
Score 75-100 → Do First    (high impact, fits strategy, right timing)
Score 65-74  → Plan Now    (high value but needs resourcing)
Score 50-64  → Consider    (conditional — revisit next quarter)
Score < 50   → Deprioritize (low ROI on time and resources)
```

---

## What's Inside

**Pre-loaded scenarios:**

6 real feature decisions every SaaS startup faces:
- Real-time collaboration
- Mobile app
- API / Developer platform
- Advanced analytics
- SSO / Enterprise auth
- Offline mode

5 real market expansion decisions:
- UK & Western Europe
- Enterprise (500+ employees)
- Southeast Asia
- Healthcare vertical
- Africa & Middle East

**Add your own initiatives** — type in any feature or market, move the sliders, get a score instantly.

**Impact × Effort Matrix** — visual 2×2 showing where every initiative sits. Classic McKinsey framework made interactive.

---

## Design Decisions

**Why build this instead of using a spreadsheet?**

Spreadsheets work but they don't show relationships. The 2×2 matrix makes trade-offs visible at a glance — you can see in one second that SSO is high impact AND low effort while mobile app is high impact but very high effort. That visual comparison changes conversations.

**Why these 4 scoring dimensions specifically?**

Based on the frameworks used by Y Combinator, First Round Capital, and a16z when evaluating what startups should focus on. Impact and timing are the two most commonly underweighted factors in startup prioritization.

**Why is UK/Europe scored so high for market expansion?**

GDPR compliance is already done (assumed), there are inbound signals, and the timezone overlap for a remote team is manageable. Southeast Asia scores lower not because it's a bad market but because the localization investment hasn't been made yet. Timing matters.

---

## Running Locally

```bash
git clone https://github.com/NyamburaaKamau/cos-dashboard
cd cos-dashboard
npm install
npm start
```

The Strategy Tool is on the `/strategy` route.

---

## Tech Stack

```
React              → UI framework
CSS-in-JS          → Styling (no external library)
Google Fonts       → Playfair Display + IBM Plex Sans + IBM Plex Mono
Custom ML scorer   → Weighted scoring model (no external ML library needed)
SVG                → Score rings rendered in pure SVG
gh-pages           → Deployment
```

---

## Live Demo

👉 **[https://NyamburaaKamau.github.io/cos-dashboard](https://NyamburaaKamau.github.io/cos-dashboard)**

---

*Built by [Nyambura Kamau](https://github.com/NyamburaaKamau) — ML Platform Engineer → Operations & Strategy*