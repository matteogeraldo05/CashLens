<script setup>
// Dashboard: shows total balance, monthly income and total spent stat cards.
import { ref, computed, onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useAccountStore } from '../lib/stores';
import { supabase } from '../lib/supabase';
import { useRouter, useRoute } from 'vue-router';

const accountStore = useAccountStore();
const { user, username } = storeToRefs(accountStore);
const router = useRouter();
const route  = useRoute();

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

// ── Stat cards ─────────────────────────────────────────────
const totalBalance = computed(() => {
	const income  = transactions.value.filter(t => t.category === 'Income').reduce((s, t) => s + Number(t.amount), 0);
	const expense = transactions.value.filter(t => t.category !== 'Income').reduce((s, t) => s + Number(t.amount), 0);
	return income - expense;
});

const monthlyIncome = computed(() => {
	const key = new Date().toISOString().slice(0, 7);
	return transactions.value
		.filter(t => t.date.startsWith(key) && t.category === 'Income')
		.reduce((s, t) => s + Number(t.amount), 0);
});

const totalSpent = computed(() => {
	const key = new Date().toISOString().slice(0, 7);
	return transactions.value
		.filter(t => t.date.startsWith(key) && t.category !== 'Income')
		.reduce((s, t) => s + Number(t.amount), 0);
});

const balanceChangeLabel = computed(() => {
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
</script>

<template>
	<div class="section">

		<div class="level mb-5">
			<div class="level-left">
				<h1 class="title">Welcome back, {{ username }}</h1>
			</div>
			<div class="level-right">
				<div class="buttons">
					<button class="button is-small is-light" @click="accountStore.logout()">Logout</button>
				</div>
			</div>
		</div>

		<div v-if="loading">Loading...</div>
		<div v-else-if="error" class="has-text-danger">{{ error }}</div>

		<div v-else class="columns">

			<!-- TOTAL BALANCE -->
			<div class="column is-one-third">
				<div class="box">
					<p class="heading">TOTAL BALANCE</p>
					<p class="title" :class="totalBalance >= 0 ? 'has-text-success' : 'has-text-danger'">
						${{ Math.abs(totalBalance).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
					</p>
					<span v-if="balanceChangeLabel"
						class="tag"
						:class="balanceChangeLabel.positive ? 'is-success' : 'is-danger'"
						style="font-size: 11px;">
						{{ balanceChangeLabel.positive ? '+' : '' }}{{ balanceChangeLabel.pct }}% vs last month
					</span>
				</div>
			</div>

			<!-- MONTHLY INCOME -->
			<div class="column is-one-third">
				<div class="box">
					<p class="heading">MONTHLY INCOME</p>
					<p class="title is-4 has-text-success">
						${{ monthlyIncome.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
					</p>
				</div>
			</div>

			<!-- TOTAL SPENT -->
			<div class="column is-one-third">
				<div class="box">
					<p class="heading">TOTAL SPENT</p>
					<p class="title is-4 has-text-danger">
						${{ totalSpent.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
					</p>
				</div>
			</div>

		</div>
	</div>
</template>