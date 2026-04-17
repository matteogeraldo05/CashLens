# CashLens

## Overview

CashLens is a full-stack web application that gives users a single place to understand their money. On the finance side, users log income and expenses, set category budgets, and get smart insights — including automatic subscription detection and a next-month balance forecast. On the market side, users search for any stock, star the ones they care about, and watch a live-updating watchlist with D3-powered sparkline charts.

---

## Features

### Finance
- **Transaction tracking** — add, edit, and delete income and expense entries with category, merchant, date, and notes
- **Category management** — default categories seeded on signup, with support for custom categories and colours
- **Budget limits** — set monthly spending caps per category with live progress bars
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

## Course Concept Implementation

| Requirement | Implementation
|---|---|
| **SVG and HTML** | HTML semantic structure with semantic tags (nav, main, aside) in [App.vue](src/App.vue) and [Sidebar.vue](src/components/shared/Sidebar.vue). Form elements and table structure in [LoginPage.vue](src/components/LoginPage.vue) and [TransactionsPage.vue](src/components/transactions/TransactionsPage.vue). 
| **CSS and CSS frameworks** | Bulma CSS framework imported in [style.css](src/style.css) for responsive grid layout (columns, level classes). Custom CSS variables and scoped component styles in [Sidebar.vue](src/components/shared/Sidebar.vue), modals, and page components. Dark theme styling with CSS custom properties (--bg, --surface, --accent, etc.). 
| **JavaScript, jQuery, D3** | Vue 3 Composition API with reactive refs and computed properties for state management. jQuery used in [TransactionsPage.vue](src/components/transactions/TransactionsPage.vue) for dynamic table row filtering via $("#search").on() and $(this).show()/hide(). JavaScript array methods for filtering and sorting. No D3.js (Analytics page not yet implemented). 
| **Dynamic DOM** | Vue conditionally renders modals: [TransactionModal.vue](src/components/transactions/TransactionModal.vue) and [BudgetModal.vue](src/components/budgets/BudgetModal.vue) created/destroyed based on ref state. Computed property `visible` in [TransactionsPage.vue](src/components/transactions/TransactionsPage.vue) filters transaction rows dynamically. v-if/v-for directives render UI based on application state. 
| **AJAX, web services** | Supabase SDK calls in [stores.js](src/lib/stores.js) using async/await for CRUD operations: fetchTransactions(), addTransaction(), updateTransaction(), deleteTransaction(), fetchBudgets(), etc. Supabase Auth integration for login/register workflow. Real-time database queries on PostgreSQL tables (transactions, budgets, profiles). 
| **Node.js/Express.js/Nuxt-nitro** | Node.js runtime via Vite dev server ([vite.config.js](vite.config.js)). Supabase SDK (Node.js-compatible) in [stores.js](src/lib/stores.js) handles backend request processing: authentication, database queries, and real-time subscriptions. Supabase acts as the backend service layer processing all CRUD operations on PostgreSQL. Supabase handles the Express.js and Nuxt Nitro requirements as it essentially does the same thing but with supabase for example, const { data, error } = await supabase.from('transactions').select('*').eq('user_id', uid) in express would be a get from the database but in our case we can await supabase for this and supabase transforms it into a REST call on the server.
| **Vue framework** | Vue 3 Composition API throughout all components with setup scripts. Vue Router with lazy-loaded routes and authentication guard in [router.js](src/router.js). Pinia stores for state management (useAccountStore, useTransactionStore). Single-file components (.vue) with scoped CSS. v-model two-way binding in forms ([TransactionModal.vue](src/components/transactions/TransactionModal.vue), [LoginPage.vue](src/components/LoginPage.vue)). 

---
