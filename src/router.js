/*
  Router setup: defines public/authenticated pages and a global route guard
  that keeps unauthenticated users out of protected routes.
*/
import { createRouter, createWebHistory } from 'vue-router';
import { useAccountStore } from './lib/stores';
import LoginPage from './components/LoginPage.vue';
import DashboardPage from './components/DashboardPage.vue';
import AnalyticsPage from './components/analytics/AnalyticsPage.vue';

const routes = [
  { path: '/', component: LoginPage },
  { path: '/dashboard', component: DashboardPage, meta: { requiresAuth: true } },
  { path: '/transactions', component: () => import('./components/transactions/TransactionsPage.vue'), meta: { requiresAuth: true } },
  { path: '/budgets', component: () => import('./components/budgets/BudgetsPage.vue'), meta: { requiresAuth: true } },
  { path: '/subscriptions', component: () => import('./components/subscriptions/SubscriptionsPage.vue'), meta: { requiresAuth: true } },
  { path: '/analytics', component: () => import('./components/analytics/AnalyticsPage.vue'), meta: { requiresAuth: true } },
  { path: '/settings', component: () => import('./components/settings/SettingsPage.vue'), meta: { requiresAuth: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to) => {
  // from 
  const store = useAccountStore();
  await store.initAuth();

  if (to.meta.requiresAuth && !store.isAuthenticated) {
    return '/';
  }

  if (to.path === '/' && store.isAuthenticated) {
    return '/dashboard';
  }
});

export default router;
