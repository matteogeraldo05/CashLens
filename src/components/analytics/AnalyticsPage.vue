<script setup>
import { ref, computed ,onMounted} from 'vue';
import { storeToRefs } from 'pinia';
import { useAccountStore } from '../../lib/stores';
import { supabase } from '../../lib/supabase';
import CategoryDonut from './D3Graphs/PieChart.vue';
import BalanceChart from './D3Graphs/BalanceChart.vue';
import HorizonChart from './D3Graphs/HorizonChart.vue';

// Analytics view: shows various tables/charts summarizing recent transactions.
const accountStore = useAccountStore();
const { user } = storeToRefs(accountStore);


// State for transactions and loading/error status
const transactions = ref([]);
const loading = ref(false);
const error = ref('');  
const monthRange = ref(3); // Last 6 months
const view = ref('bars');

// Derived data for analytics tables
async function fetchTransactions() {
  loading.value = true;
  error.value = '';


// Calculate date threshold based on monthRange
  const dateThreshold = new Date();
  dateThreshold.setDate(1); // Start of current month
  dateThreshold.setMonth(dateThreshold.getMonth() - monthRange.value);

  // Fetch transactions for the user from Supabase
   const { data, error: fetchError } = await supabase
    .from('transactions') 
    .select('*') 
    .eq('user_id', user.value.id)
    .gte('date', dateThreshold.toISOString())
    .order('date', { ascending: true }); 

    // Handle fetch result
    if (fetchError) {
      error.value = 'Failed to load transactions.';
    } else {
      transactions.value = data;
      console.log('balanceData:', balanceData.value);
      console.log('sample date:', transactions.value[0]?.date);
      console.log('months:', getLastNMonths());
    } 
    loading.value = false;
    // use transactions to compute analytics tables


  }

  function setRange(months) {
      monthRange.value = months;
      fetchTransactions();
    }

  onMounted(fetchTransactions);

    
const pulseData = computed(() => {
    

});

//pie chart data
const categoryData = computed(() => {
	const expenses = transactions.value.filter(t => t.category !== 'Income');
	const total    = expenses.reduce((s, t) => s + Number(t.amount), 0);
	const grouped  = Object.groupBy(expenses, t => t.category || 'Other');

	return Object.entries(grouped).map(([name, rows]) => {
		const amount = rows.reduce((s, t) => s + Number(t.amount), 0);
		return {
			name,
			amount,
			pct: total > 0 ? Math.round((amount / total) * 100) : 0,
		};
	}).sort((a, b) => b.amount - a.amount);
});


const balanceData = computed(() =>
	getLastNMonths().map(({ key, label }) => {
		const rows    = transactions.value.filter(t => t.date.startsWith(key));
		const income  = rows.filter(t => t.category === 'Income').reduce((s, t) => s + Number(t.amount), 0);
		const expense = rows.filter(t => t.category !== 'Income').reduce((s, t) => s + Number(t.amount), 0);
		return { month: label, income, expense, net: income - expense };
	})
);

const horizonData = computed(() => {
	const last3 = balanceData.value.slice(-3);
	
	if (last3.length === 0) return null;

	const avgIncome  = last3.reduce((s, r) => s + r.income, 0)  / last3.length;
	const avgExpense = last3.reduce((s, r) => s + r.expense, 0) / last3.length;
	const avgNet     = avgIncome - avgExpense;

  // label for next month
  const i = balanceData.value.length;
  const nextMonth = new Date();
  nextMonth.setDate(1);
  nextMonth.setMonth(nextMonth.getMonth() + i);


	const label = nextMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

	return {
		label,
		projectedIncome:  Math.round(avgIncome),
		projectedExpense: Math.round(avgExpense),
		projectedNet:     Math.round(avgNet),
	};
});

function sumByType(rows, type) {
	if (type === 'income') {
		return rows
			.filter(t => t.category === 'Income')
			.reduce((s, t) => s + Number(t.amount), 0);
	} else {
		return rows
			.filter(t => t.category !== 'Income')
			.reduce((s, t) => s + Number(t.amount), 0);
	}
}
 function getLastNMonths() {
	return Array.from({ length: monthRange.value }, (_, i) => {
		const d = new Date();
		d.setDate(1);
		d.setMonth(d.getMonth() - (monthRange.value - 1 - i));
		return {
			key:   d.toISOString().slice(0, 7),
			label: d.toLocaleString('default', { month: 'short' }).toUpperCase(),
		};
	});
}

</script>

<template>
  <div class="analytics">
 
    <div class="topbar">
      <h1 class="page-title">Analytics</h1>
      <div class="buttons">
        <button class="button is-small" :class="{ 'is-primary': monthRange === 3 }" @click="setRange(3)">Last 3 Months</button>
        <button class="button is-small" :class="{ 'is-primary': monthRange === 6 }" @click="setRange(6)">Last 6 Months</button>
        <button class="button is-small" :class="{ 'is-primary': monthRange === 12 }" @click="setRange(12)">Last 12 Months</button>
    </div>
    </div>
 
    <div v-if="loading" class="state">Loading...</div>
    <div v-else-if="error" class="state error">{{ error }}</div>
 
    <div v-else class="content">
 
      <!-- PULSE -->
      <div class="card">
        <div class="card-title">The Pulse — Growth vs Savings</div>
        <table class="data-table">
          <thead>
            <tr><th>Month</th><th>Investment</th><th>Savings</th></tr>
          </thead>
          <tbody>
            <tr v-for="row in pulseData" :key="row.label">
              <td>{{ row.label }}</td>
              <td>${{ row.growth.toLocaleString() }}</td>
              <td>${{ row.savings.toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>
      </div>
 
      <!-- CATEGORY WEIGHT -->
      <div class="column is-half">
        <div class="box">
        <p class="title is-5">Category Weight</p>
        <p class="subtitle is-6">Spending by category</p>
        <CategoryDonut :data="categoryData" />
        </div>
      </div>
 
      <!-- BALANCE SHEET -->
      <div class="box">
    <p class="title is-5">The Balance Sheet</p>
    <p class="subtitle is-6">Monthly Income vs Expense</p>
    <div class="buttons mb-3">
        <button class="button is-small" :class="{ 'is-primary': view === 'bars' }" @click="view = 'bars'">Bars</button>
        <button class="button is-small" :class="{ 'is-primary': view === 'table' }" @click="view = 'table'">Table</button>
    </div>
    <BalanceChart v-if="view === 'bars'" :data="balanceData" />
    <table v-else class="table is-fullwidth is-striped">
        <thead>
            <tr><th>Month</th><th>Income</th><th>Expense</th><th>Net</th></tr>
        </thead>
        <tbody>
            <tr v-for="row in balanceData" :key="row.month">
                <td>{{ row.month }}</td>
                <td class="has-text-success">${{ row.income.toLocaleString() }}</td>
                <td class="has-text-danger">${{ row.expense.toLocaleString() }}</td>
                <td :class="row.net >= 0 ? 'has-text-success' : 'has-text-danger'">
                    {{ row.net >= 0 ? '+' : '' }}${{ row.net.toLocaleString() }}
                </td>
            </tr>
        </tbody>
    </table>
</div>
 
      <!-- HORIZON -->
 <div class="box">
    <p class="title is-5">The Horizon</p>
    <p class="subtitle is-6">Future projections based on historical data</p>
    <HorizonChart v-if="horizonData" :data="balanceData" :forecast="horizonData" />
    <p v-else class="has-text-grey">Not enough data to forecast.</p>
</div>
    </div>
  </div>
</template>