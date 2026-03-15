/*
  Router setup: defines public/authenticated pages and a global route guard
  that keeps unauthenticated users out of protected routes.
*/
import { createRouter, createWebHistory } from 'vue-router';
import { useAccountStore } from './lib/stores';
import LoginPage from './components/LoginPage.vue';
import DashboardPage from './components/DashboardPage.vue';

const routes = [
  { path: '/', component: LoginPage },
  { path: '/dashboard', component: DashboardPage, meta: { requiresAuth: true } },
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
