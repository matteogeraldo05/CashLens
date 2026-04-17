<script setup>
// Dashboard view: fetches transactions and passes computed stats to widgets.
import { ref, computed, onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useAccountStore } from '../../lib/stores';
import { useRoute, useRouter } from 'vue-router';
import DashboardWidget from './DashboardWidget.vue';
import BalanceChart from '../analytics/D3Graphs/BalanceChart.vue';
import HorizonChart from '../analytics/D3Graphs/HorizonChart.vue';
import { supabase } from '../../lib/supabase';

const accountStore = useAccountStore();
const { user, username } = storeToRefs(accountStore);
const route  = useRoute();
const router = useRouter();

const transactions = ref([]);
const loading      = ref(false);
const error        = ref('');

async function fetchTransactions() {
	loading.value = true;
	error.value   = '';

	const since = new Date();
	since.setFullYear(since.getFullYear() - 1);
	since.setDate(1);

	const { data, error: err } = await supabase
		.from('transactions')
		.select('*')
		.eq('user_id', user.value.id)
		.gte('date', since.toISOString().split('T')[0])
		.order('date', { ascending: true });

	if (err) {
		error.value = err.message;
	} else {
		transactions.value = data;
	}

	loading.value = false;
}

onMounted(fetchTransactions);

watch(() => route.path, (path) => {
	if (path === '/dashboard') fetchTransactions();
});
// Helper to get last N months for charts

function getLastNMonths(n = 6) {
	return Array.from({ length: n }, (_, i) => {
		const d = new Date();
		d.setDate(1);
		d.setMonth(d.getMonth() - (n - 1 - i));
		return {
			key:   d.toISOString().slice(0, 7),
			label: d.toLocaleString('default', { month: 'short' }).toUpperCase(),
		};
	});
}

// Total balance = income - expenses across all transactions
const totalBalance = computed(() => {
	const income  = transactions.value.filter(t => t.category === 'Income').reduce((s, t) => s + Number(t.amount), 0);
	const expense = transactions.value.filter(t => t.category !== 'Income').reduce((s, t) => s + Number(t.amount), 0);
	return income - expense;
});

// Total income for current month

const monthlyIncome = computed(() => {
	const key = new Date().toISOString().slice(0, 7);
	return transactions.value
		.filter(t => t.date.startsWith(key) && t.category === 'Income')
		.reduce((s, t) => s + Number(t.amount), 0);
});

// Total spent in current month (excluding income)
const totalSpent = computed(() => {
	const key = new Date().toISOString().slice(0, 7);
	return transactions.value
		.filter(t => t.date.startsWith(key) && t.category !== 'Income')
		.reduce((s, t) => s + Number(t.amount), 0);
});

// Compare this month's net with previous month
const balanceChange = computed(() => {
	const now  = new Date();
	const curr = now.toISOString().slice(0, 7);
	const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 7);

	const netForMonth = key => {
		const rows    = transactions.value.filter(t => t.date.startsWith(key));
		const income  = rows.filter(t => t.category === 'Income').reduce((s, t) => s + Number(t.amount), 0);
		const expense = rows.filter(t => t.category !== 'Income').reduce((s, t) => s + Number(t.amount), 0);
		return income - expense;
	};

	const prevNet = netForMonth(prev);
	const currNet = netForMonth(curr);
	if (prevNet === 0) return null;

	const pct = ((currNet - prevNet) / Math.abs(prevNet) * 100).toFixed(1);
	return { pct, positive: currNet >= prevNet };
});

// balance chart data same as analytics page
const balanceData = computed(() =>
	getLastNMonths(6).map(({ key, label }) => {
		const rows    = transactions.value.filter(t => t.date.startsWith(key));
		const income  = rows.filter(t => t.category === 'Income').reduce((s, t) => s + Number(t.amount), 0);
		const expense = rows.filter(t => t.category !== 'Income').reduce((s, t) => s + Number(t.amount), 0);
		return { month: label, income, expense, net: income - expense };
	})
);
// Simple projection based on recent trends same as analytics page
const horizonData = computed(() => {
	const last3 = balanceData.value.slice(-3);
	if (last3.length === 0) return null;

	const avgIncome  = last3.reduce((s, r) => s + r.income, 0) / last3.length;
	const avgExpense = last3.reduce((s, r) => s + r.expense, 0) / last3.length;
	const avgNet     = avgIncome - avgExpense;

	return Array.from({ length: 3 }, (_, i) => {
		const d = new Date();
		d.setDate(1);
		d.setMonth(d.getMonth() + i + 1);
		return {
			label:           d.toLocaleString('default', { month: 'short' }).toUpperCase(),
			projectedIncome:  Math.round(avgIncome),
			projectedExpense: Math.round(avgExpense),
			projectedNet:     Math.round(avgNet),
		};
	});
});

// Check if we have any data to show in charts
const hasData = computed(() =>
	balanceData.value.some(d => d.income > 0 || d.expense > 0)
);

// widget data
const widgets = computed(() => [
	{
		
		id: 1,
		title: 'Total Balance',
		value: totalBalance.value,
		tag: balanceChange.value
			? `${balanceChange.value.positive ? '+' : ''}${balanceChange.value.pct}% vs last month`
			: null,
		tagType: balanceChange.value?.positive ? 'is-success' : 'is-danger',
		valueClass: totalBalance.value >= 0 ? 'has-text-success' : 'has-text-danger',
	},
	{
		id: 2,
		title: 'Monthly Income',
		value: monthlyIncome.value,
		tag: null,
		valueClass: 'has-text-success',
	},
	{
		id: 3,
		title: 'Total Spent this month',
		value: totalSpent.value,
		tag: null,
		valueClass: 'has-text-danger',
	},
]);
</script>

<template>
<div class="tx-page">
	<div class="level tx-topbar">
		<div class="level-left">
			<div class="level-item">
				<h1 class="tx-title">Dashboard, Welcome {{ username }} </h1>
			</div>
		</div>
		<div class="level-right">
			<div class="level-item">
				<div class="buttons">
					<button class="button is-small" @click="accountStore.logout()">Logout</button>
				</div>
			</div>
		</div>
	</div>

	<div v-if="loading">Loading...</div>
	<div v-else-if="error" class="has-text-danger">{{ error }}</div>

	<div v-else>
		<!-- STAT CARDS -->
		<div class="widgets-row mb-5" style="display: flex; gap: 20px; align-items: stretch;">
    		<DashboardWidget v-for="w in widgets" :key="w.id" :widget="w" style="flex: 1;" />
		</div>

		<!-- CHARTS -->
		<div class="columns" style="align-items: stretch;">
			<div class="column is-half" style="display: flex; flex-direction: column;">
				<div class="box" style="flex: 1;">
					<p class="title is-5">Balance Sheet</p>
					<p class="subtitle is-6">Monthly Income vs Expense</p>
					<BalanceChart v-if="hasData" :data="balanceData" />
					<p v-else class="has-text-grey">No data yet.</p>
				</div>
			</div>
			<div class="column is-half" style="display: flex; flex-direction: column;">
				<div class="box" style="flex: 1;">
					<p class="title is-5">The Horizon</p>
					<p class="subtitle is-6">Next 3 months forecast</p>
					<HorizonChart v-if="hasData && horizonData" :data="balanceData" :forecast="horizonData" />
					<p v-else class="has-text-grey">Not enough todata to forecast.</p>
				</div>
			</div>
		</div>
	</div>
</div>
</template>

<style scoped>
.tx-page {
	padding: 36px 40px;
	min-height: 100vh;
	background: var(--bg);
}

.tx-topbar { margin-bottom: 28px; }

.tx-title {
	font-size: 26px;
	font-weight: 700;
	color: var(--text);
	margin: 0;
}

.widgets-row {
	display: flex;
	gap: 20px;
	flex-wrap: wrap;
}
</style>