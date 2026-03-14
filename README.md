# CashLens

## Overview

CashLens is a full-stack web application that gives users a single place to understand their money. On the finance side, users log income and expenses, set category budgets, and get smart insights — including automatic subscription detection and a next-month balance forecast. On the market side, users search for any stock, star the ones they care about, and watch a live-updating watchlist with D3-powered sparkline charts.

---

## Features

### Finance
- **Transaction tracking** — add, edit, and delete income and expense entries with category, merchant, date, and notes
- **Category management** — default categories seeded on signup, with support for custom categories and colours
- **Budget limits** — set monthly spending caps per category with live progress bars (amber at 80%, red at 100%)
- **Filterable transaction table** — search, filter by category, date range, and transaction type client-side via Vue computed properties
- **Subscription detector** — algorithm that scans transaction history for recurring merchant + amount + cadence patterns and calculates annual cost
- **Next-month forecast** — projects end-of-next-month balance by averaging the last 3 months of income and spending
- **User authentication** — Supabase Auth with JWT verification on every Express route

### Charts (all built in raw D3.js)
- **Spending timeline** — line and area chart of daily net balance with custom scales, animated paths, and hover tooltips
- **Category donut** — arc chart of spending by category, animated on load, click a slice to filter transactions
- **Monthly bar chart** — grouped bars comparing income vs expenses for the last 6 months
- **Stock sparklines** — 30-day price history mini chart per watchlist card

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | Vue 3 (Composition API) |
| Build tool | Vite |
| Routing | Vue Router 4 |
| State management | Pinia |
| Styling | Bulma + scoped SFC CSS |
| Charts | D3.js (raw SVG) |
| HTTP client | Axios |
| Backend | Node.js + Express.js |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| External APIs | Alpha Vantage, ExchangeRate-API |
| Deployment | Vercel (frontend), Railway (backend) |

---
