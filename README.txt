# CashLens

## Overview

CashLens is a personal finance web application that gives users a single place to understand their money. Users log income and expenses, set category budgets, and get smart insights — including automatic subscription detection and a next-month balance forecast. All data is persisted in real time through Supabase.

---

## Features

### Finance
- **Transaction tracking** — add, edit, and delete income and expense entries with category, merchant, date, and notes
- **Category management** — default categories seeded on signup, with support for custom categories and colours
- **Budget limits** — set monthly spending caps per category with live progress bars
- **Filterable transaction table** — search, filter by category, date range, and transaction type client-side via jQuery and Vue computed properties
- **Subscription detector** — algorithm that scans transaction history for recurring merchant + amount + cadence patterns and calculates annual cost
- **Next-month forecast** — projects end-of-next-month balance by averaging the last 3 months of income and spending
- **User authentication** — Supabase Auth with route guards enforced via Vue Router `beforeEach`

### Charts (all built in raw D3.js)
- **Category donut** — arc chart of spending by category, percentage legend, and colour palette matched to app theme
- **Monthly bar chart** — grouped bars comparing income vs expenses per month, with y-axis gridlines, dollar-formatted tick labels, can be viewed in table mode
- **Budget vs actual trend** — multi-line chart per category comparing monthly spend against budget allocation, with over-budget dot indicators and per-category toggle buttons with a warning for over-spending
- **Horizon forecast** — line chart analysing the last 3 months of net balance extending into a 3-month dashed forecast with projected values

---

## Requirements and their implementation

| Requirement | Implementation |
|---|---|
| **SVG and HTML** | Semantic HTML structure with `<nav>`, `<main>`, and `<aside>` tags in [App.vue](src/App.vue). Form elements (`<form>`, `<input>`, `<label>`) in [LoginPage.vue](src/components/LoginPage.vue) for auth. Table structure (`<table>`, `<thead>`, `<tbody>`, `<tr>`, `<td>`) in [TransactionsPage.vue](src/components/transactions/TransactionsPage.vue) and [SubscriptionsPage.vue](src/components/subscriptions/SubscriptionsPage.vue). Navigation lists in [Sidebar.vue](src/components/shared/Sidebar.vue) using semantic `<nav>` and `<ul>`/`<li>` elements. |
| **CSS and CSS frameworks** | Bulma CSS framework imported in [style.css](src/style.css) for responsive grid layout (columns, level, is-half-mobile, is-one-third-tablet classes). Custom CSS variables (--bg, --surface, --accent, --danger, --text, --text-muted) for dark theme. Scoped component styles in [Sidebar.vue](src/components/shared/Sidebar.vue), [BudgetModal.vue](src/components/budgets/BudgetModal.vue), [TransactionModal.vue](src/components/transactions/TransactionModal.vue). Flexbox layout and media queries (@media) for responsive design in [App.vue](src/App.vue). |
| **JavaScript, jQuery, D3** | Vue 3 Composition API with reactive `ref()` and computed properties for state management in all components. jQuery used in [TransactionsPage.vue](src/components/transactions/TransactionsPage.vue) for dynamic table filtering: `$("#search").on('input', runSearch)`, `$(this).show()`, `$(this).hide()`. JavaScript array methods (.filter(), .sort()) for sorting transactions by date/amount/merchant. D3 charts in [BalanceChart.vue](src/components/analytics/D3Graphs/BalanceChart.vue), [BudgetTrend.vue](src/components/analytics/D3Graphs/BudgetTrend.vue), [HorizonChart.vue](src/components/analytics/D3Graphs/HorizonChart.vue), [PieChart.vue](src/components/analytics/D3Graphs/PieChart.vue). |
| **Dynamic DOM** | Vue `v-if` directives conditionally render modals: [TransactionModal.vue](src/components/transactions/TransactionModal.vue) shown when `modalTx` ref is truthy. `v-for` loops render transaction rows in [TransactionsPage.vue](src/components/transactions/TransactionsPage.vue) iterating over computed `visible` property. Computed property `visible` in [TransactionsPage.vue](src/components/transactions/TransactionsPage.vue) filters/sorts transactions dynamically. `v-if="accountStore.isAuthenticated"` in [App.vue](src/App.vue) toggles between login and authenticated layouts. Modal creation/destruction based on ref state in [BudgetModal.vue](src/components/budgets/BudgetModal.vue) and [SubscriptionModal.vue](src/components/subscriptions/SubscriptionModal.vue). |
| **AJAX, web services** | Supabase SDK async/await calls in [stores.js](src/lib/stores.js): `fetchTransactions()`, `addTransaction()`, `updateTransaction()`, `deleteTransaction()`, `fetchBudgets()`, `addBudget()`, `initAuth()`, `login()`, `register()`, `logout()`. Real-time database queries on PostgreSQL tables (transactions, budgets, profiles, subscriptions). Supabase Auth integration with JWT for login/register workflow in `useAccountStore`. Routes wrapped with `router.beforeEach()` guard in [router.js](src/router.js) checking auth state. |
| **Node.js / Vite** | Node.js runtime via Vite dev server configured in [vite.config.js](vite.config.js) with the Vue plugin. Vite handles ES module bundling, hot module replacement, and production builds (`vite build`, `vite preview`). Bootstrap entry point in [main.js](src/main.js) creates the Vue app instance, mounts Pinia and Vue Router. No separate backend process — all server-side logic is delegated to Supabase. |
| **Vue framework** | Vue 3 Composition API with `<script setup>` in all components. Vue Router configured in [router.js](src/router.js) with lazy-loaded routes for all pages (dashboard, transactions, budgets, subscriptions, analytics, settings) and global route guard for authentication. Pinia stores in [stores.js](src/lib/stores.js): `useAccountStore()` for auth and profile, `useTransactionStore()` for transactions/budgets. Single-file components (.vue) with scoped CSS. v-model two-way binding in form inputs ([LoginPage.vue](src/components/LoginPage.vue), [TransactionModal.vue](src/components/transactions/TransactionModal.vue)). provide/inject for sidebar context in [App.vue](src/App.vue) and [MobileHeader.vue](src/components/shared/MobileHeader.vue). |

---

## How to run

The `.env` file is included in the zipped submission with API keys for grading purposes. Keys will be rotated after grading.

1. Download and unzip the submission file
2. Run `npm i`
3. Run `npm run dev`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | Vue 3 (Composition API) |
| Build tool | Vite |
| Routing | Vue Router 4 |
| State management | Pinia |
| Styling | Bulma + scoped SFC CSS |
| Icons | Phosphor Icons |
| Charts | D3.js (raw SVG) |
| DOM manipulation | jQuery |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (JWT) |

---
