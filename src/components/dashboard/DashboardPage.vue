<script setup>
// Dashboard view shown after login: displays account identity and exposes logout.
import { ref } from 'vue'
import DashboardWidget from './DashboardWidget.vue'
// import { useAccountStore } from '../lib/stores';

// const accountStore = useAccountStore();
// const { username } = storeToRefs(accountStore);

const widgets = ref([
	{ id: 1, title: 'Total Balance' },
])
</script>


<template>
<div class="tx-page">
<div class="level tx-topbar">
  
    <div class="level-left">
        <div class="level-item">
            <h1 class="tx-title">Dashboard</h1>
        </div>
    </div>

    <div class="level-right">
        <div class="level-item">
            <button class="button" @click="accountStore.logout()">Logout</button>
        </div>
    </div>
</div>

<div class="widgets-row">
    <DashboardWidget v-for="w in widgets" :key="w.id" :widget="w" />
</div>
</div>
</template>


<style scoped>


.tx-page
{
	padding: 36px 40px;
	min-height: 100vh;
	background: var(--bg);
}

.tx-topbar { margin-bottom: 28px; }

.tx-title
{
	font-size: 26px;
	font-weight: 700;
	color: var(--text);
	margin: 0;
}

.filter-row { margin-bottom: 20px; }

.tx-table-wrap
{
	border-radius: 14px;
	padding: 0;
	overflow: hidden;
}

.tx-table { margin-bottom: 0; }

/* Skeleton */
.skeleton-row td { padding: 18px 20px; }

.skel
{
	height: 14px;
	border-radius: 6px;
	background: linear-gradient(90deg, rgba(255,255,255,0.06) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.06) 75%);
	background-size: 200% 100%;
	animation: shimmer 1.4s infinite;
}

.skel--xs { width: 60px; }
.skel--sm { width: 100px; }
.skel--md { width: 160px; }

@keyframes shimmer
{
	0%   { background-position: 200% 0; }
	100% { background-position: -200% 0; }
}

/* Empty / no-results */
.empty-state
{
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 16px;
	padding: 60px 20px;
	color: var(--text-muted);
	font-size: 15px;
}

.no-results
{
	padding: 40px 20px;
	text-align: center;
	color: var(--text-muted);
	font-size: 14px;
}

/* Row transition */
.row-enter-active { animation: row-in 0.25s ease; }

@keyframes row-in
{
	from { opacity: 0; transform: translateY(-6px); }
	to   { opacity: 1; transform: none; }
}

/* Toast */
.toast
{
	position: fixed;
	bottom: 28px;
	right: 28px;
	padding: 12px 20px;
	border-radius: 10px;
	font-size: 13.5px;
	font-weight: 500;
	color: #fff;
	z-index: 9999;
	box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
}

.toast--success { background: #16a34a; }

.toast-enter-active { animation: toast-in 0.25s ease; }
.toast-leave-active { animation: toast-in 0.2s ease reverse; }

@keyframes toast-in
{
	from { opacity: 0; transform: translateY(12px); }
	to   { opacity: 1; transform: none; }
}
</style>
