<script setup>
import { ref, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useAccountStore } from '../lib/stores';
import { supabase } from '../lib/supabase';

// Analytics view: shows various tables/charts summarizing recent transactions.
const accountStore = useAccountStore();
const { user } = storeToRefs(accountStore);


// State for transactions and loading/error status
const transactions = ref([]);
const loading = ref(false);
const error = ref('');
const monthRange = ref(6); // Last 6 months

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
    }
    loading.value = false;
    // use transactions to compute analytics tables
    function setRange(months) {
      monthRange.value = months;
      fetchTransactions();
    }

    

    //Pulse data: growth vs savings per month
    const pulseData = computed(() => {
    continue;

});

    const categoryData = computed(() => {
    continue;

});

    const balanceData = computed(() => {
    continue;

});

    const horizonData = computed(() => {
    continue;

});

}












</script>

<template>
  <div class="analytics">
 
    <div class="topbar">
      <h1 class="page-title">Analytics</h1>
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
      <div class="card">
        <div class="card-title">Category Weight</div>
        <table class="data-table">
          <thead>
            <tr><th>Category</th><th>Amount</th><th>%</th></tr>
          </thead>
          <tbody>
            <tr v-for="row in categoryData" :key="row.name">
              <td>{{ row.name }}</td>
              <td>${{ row.amount.toLocaleString() }}</td>
              <td>{{ row.pct }}%</td>
            </tr>
          </tbody>
        </table>
      </div>
 
      <!-- BALANCE SHEET -->
      <div class="card">
        <div class="card-title">The Balance Sheet</div>
        <table class="data-table">
          <thead>
            <tr><th>Month</th><th>Income</th><th>Expense</th><th>Net</th></tr>
          </thead>
          <tbody>
            <tr v-for="row in balanceData" :key="row.month">
              <td>{{ row.month }}</td>
              <td>${{ row.income.toLocaleString() }}</td>
              <td>${{ row.expense.toLocaleString() }}</td>
              <td :class="row.income - row.expense >= 0 ? 'pos' : 'neg'">
                {{ row.income - row.expense >= 0 ? '+' : '' }}${{ (row.income - row.expense).toLocaleString() }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
 
      <!-- HORIZON -->
      <div class="card">
        <div class="card-title">The Horizon — Net per Month</div>
        <table class="data-table">
          <thead>
            <tr><th>Month</th><th>Net</th></tr>
          </thead>
          <tbody>
            <tr v-for="row in horizonData" :key="row.month">
              <td>{{ row.month }}</td>
              <td :class="row.amount >= 0 ? 'pos' : 'neg'">
                {{ row.amount >= 0 ? '+' : '' }}${{ row.amount.toLocaleString() }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
 
    </div>
  </div>
</template>