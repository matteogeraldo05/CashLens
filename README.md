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

## Requirements and their implementation

| Requirement | Implementation
|---|---|
| **SVG and HTML** | Semantic HTML structure with `<nav>`, `<main>`, and `<aside>` tags in [App.vue](src/App.vue). Form elements (`<form>`, `<input>`, `<label>`) in [LoginPage.vue](src/components/LoginPage.vue) for auth. Table structure (`<table>`, `<thead>`, `<tbody>`, `<tr>`, `<td>`) in [TransactionsPage.vue](src/components/transactions/TransactionsPage.vue) and [SubscriptionsPage.vue](src/components/subscriptions/SubscriptionsPage.vue). Navigation lists in [Sidebar.vue](src/components/shared/Sidebar.vue) using semantic `<nav>` and `<ul>`/`<li>` elements.
| **CSS and CSS frameworks** | Bulma CSS framework imported in [style.css](src/style.css) for responsive grid layout (columns, level, is-half-mobile, is-one-third-tablet classes). Custom CSS variables (--bg, --surface, --accent, --danger, --text, --text-muted) for dark theme. Scoped component styles in [Sidebar.vue](src/components/shared/Sidebar.vue), [BudgetModal.vue](src/components/budgets/BudgetModal.vue), [TransactionModal.vue](src/components/transactions/TransactionModal.vue). Flexbox layout and media queries (@media) for responsive design in [App.vue](src/App.vue). 
| **JavaScript, jQuery, D3** | Vue 3 Composition API with reactive `ref()` and computed properties for state management in all components. jQuery used in [TransactionsPage.vue](src/components/transactions/TransactionsPage.vue) for dynamic table filtering: `$("#search").on('input', runSearch)`, `$(this).show()`, `$(this).hide()`. JavaScript array methods (.filter(), .sort()) for sorting transactions by date/amount/merchant. D3 charts in [BalanceChart.vue](src/components/analytics/D3Graphs/BalanceChart.vue), [BudgetTrend.vue](src/components/analytics/D3Graphs/BudgetTrend.vue), [HorizonChart.vue](src/components/analytics/D3Graphs/HorizonChart.vue), [PieChart.vue](src/components/analytics/D3Graphs/PieChart.vue).
| **Dynamic DOM** | Vue `v-if` directives conditionally render modals: [TransactionModal.vue](src/components/transactions/TransactionModal.vue) shown when `modalTx` ref is truthy. `v-for` loops render transaction rows in [TransactionsPage.vue](src/components/transactions/TransactionsPage.vue) iterating over computed `visible` property. Computed property `visible` in [TransactionsPage.vue](src/components/transactions/TransactionsPage.vue) filters/sorts transactions dynamically. `v-if="accountStore.isAuthenticated"` in [App.vue](src/App.vue) toggles between login and authenticated layouts. Modal creation/destruction based on ref state in [BudgetModal.vue](src/components/budgets/BudgetModal.vue) and [SubscriptionModal.vue](src/components/subscriptions/SubscriptionModal.vue).
| **AJAX, web services** | Supabase SDK async/await calls in [stores.js](src/lib/stores.js): `fetchTransactions()`, `addTransaction()`, `updateTransaction()`, `deleteTransaction()`, `fetchBudgets()`, `addBudget()`, `initAuth()`, `login()`, `register()`, `logout()`. Real-time database queries on PostgreSQL tables (transactions, budgets, profiles, subscriptions). Supabase Auth integration with JWT for login/register workflow in `useAccountStore`. Routes wrapped with `router.beforeEach()` guard in [router.js](src/router.js) checking auth state.
| **Node.js/Express.js/Nuxt-nitro** | Node.js runtime via Vite dev server configured in [vite.config.js](vite.config.js) with Vue plugin. Supabase SDK (Node.js/ES6 module compatible) in [stores.js](src/lib/stores.js) handles backend request processing: authentication via `supabase.auth.signInWithPassword()`, database queries via `supabase.from('table_name').select()`, and real-time subscriptions. Supabase acts as backend service layer processing all CRUD operations on PostgreSQL database. Bootstrap entry point in [main.js](src/main.js) creates Vue app, initializes Pinia and Vue Router.
| **Vue framework** | Vue 3 Composition API with `<script setup>` in all components. Vue Router configured in [router.js](src/router.js) with lazy-loaded routes for all pages (dashboard, transactions, budgets, subscriptions, analytics, settings) and global route guard for authentication. Pinia stores in [stores.js](src/lib/stores.js): `useAccountStore()` for auth and profile, `useTransactionStore()` for transactions/budgets. Single-file components (.vue) with scoped CSS. v-model two-way binding in form inputs ([LoginPage.vue](src/components/LoginPage.vue), [TransactionModal.vue](src/components/transactions/TransactionModal.vue)). provide/inject for sidebar context in [App.vue](src/App.vue) and [MobileHeader.vue](src/components/shared/MobileHeader.vue). 

---
## How To run:
The .env file is inside the zipped up submission file with our api keys for grading purposes. We will rotate the keys once graded for safety. All that is needed to run the project is:
1. Download zipped up file
2. Run npm i
3. Run npm run dev
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