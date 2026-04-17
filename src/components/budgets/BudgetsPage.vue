<!-- Budgets page: displays all budgets with progress tracking and management options -->
<script setup>
import { ref, onMounted } from 'vue'
import { PhPlus, PhPencil } from '@phosphor-icons/vue'
import { useTransactionStore } from '../../lib/stores'
import BudgetModal from './BudgetModal.vue'
 
const store = useTransactionStore()

// Modal state: controls visibility and which budget is being edited
const showModal = ref(false)
const selectedBudget = ref(null)

// Lifecycle: fetch all budgets and transactions on component mount
onMounted(async () => {
	await Promise.all([
		store.fetchBudgets(),
		store.fetchTransactions(),
	])
})
 
// Opens modal for creating a new budget
function openNewBudgetModal() {
	selectedBudget.value = null
	showModal.value = true
}

// Opens modal for editing an existing budget
function openEditBudgetModal(budget) {
	selectedBudget.value = budget
	showModal.value = true
}

// Closes modal and clears selected budget
function onModalClose() {
	showModal.value = false
	selectedBudget.value = null
}

// Calculates budget statistics: spending, remaining balance, progress percentage, and over-budget status
function getBudgetStats(budget, transactions) {
	// income transactions for this category
	const incomeTransactions = transactions.filter(
		(t) => t.category === budget.category && t.type === 'income'
	)
	const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0)
	
	// expense transactions for this category
	const expenseTransactions = transactions.filter(
		(t) => t.category === budget.category && t.type === 'expense'
	)
	const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0)
	
	// Net spending = expenses - income (expenses fill bar, income reduces it)
	const currentSpend = totalExpense - totalIncome
	
	const percentage = Math.max(0, Math.min(100, (currentSpend / budget.monthly_allocation) * 100))
	const remaining = Math.max(0, budget.monthly_allocation - currentSpend)
	const overage = Math.max(0, currentSpend - budget.monthly_allocation)
	const isOverBudget = currentSpend > budget.monthly_allocation

	return {
		currentSpend: currentSpend.toFixed(2),
		remaining: remaining.toFixed(2),
		overage: overage.toFixed(2),
		percentage: Math.min(100, Math.round(percentage)),
		isOverBudget: isOverBudget,
	}
}
 
// Returns emoji icon for each budget category
function getCategoryIcon(category) {
	const icons = {
		'Income': '💰',
		'Dining': '🍽️',
		'Technology': '💻',
		'Entertainment': '🎬',
		'Transport': '🚗',
		'Housing': '🏠',
		'Health': '💪',
		'Other': '📦',
	}
	return icons[category]
}
 
// Formats numbers as USD currency strings
function formatCurrency(amount) {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
	}).format(amount)
}
</script>
 
<!-- Page template: displays header, loading/error states, and budget cards -->
<template>
	<div class="container is-max-desktop p-4">
		<!-- Page header: title, subtitle, and new budget button -->
		<div class="level mb-6">
			<div class="level-left">
				<div class="level-item">
					<div>
						<h1 class="title">Budgets</h1>
						<p class="subtitle">Manage your monthly spending limits</p>
					</div>
				</div>
			</div>
			<div class="level-right">
				<div class="level-item">
					<button class="button is-success" @click="openNewBudgetModal">
						<span class="icon"><PhPlus :size="20" /></span>
						<span>New Budget</span>
					</button>
				</div>
			</div>
		</div>

		<!-- Loading state: spinner displayed while fetching data -->
		<div v-if="store.loading" class="has-text-centered py-6">
			<div class="spinner mb-4"></div>
			<p>Loading budgets...</p>
		</div>

		<!-- Error state: displays any errors from store fetch operations -->
		<div v-else-if="store.error" class="notification is-danger">
			{{ store.error }}
		</div>

		<!-- Empty state: shown when user has no budgets yet -->
		<div v-else-if="store.budgets.length === 0" class="has-text-centered py-6">
			<h2 class="title is-4">No budgets yet</h2>
			<p class="mb-5">Create your first budget to start tracking your spending</p>
		</div>

		<!-- Budget grid: displays all budgets as cards with progress and spending info -->
		<div v-else class="columns is-multiline">
			<div v-for="budget in store.budgets" :key="budget.id" class="column is-one-third-desktop is-half-tablet">
				<div class="box">
					<!-- Card header: budget icon, name, category, and edit button -->
					<div class="is-flex is-justify-content-space-between is-align-items-start mb-4">
						<div class="is-flex is-align-items-center" style="gap: 12px; flex: 1; min-width: 0;">
							<div class="is-size-5">{{ getCategoryIcon(budget.category) }}</div>
							<div style="flex: 1; min-width: 0;">
								<p class="heading is-6 mb-0" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
									{{ budget.name }}
								</p>
								<p class="is-size-7 has-text-grey" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
									{{ budget.category }}
								</p>
							</div>
						</div>
					<button class="button is-white is-small" @click="openEditBudgetModal(budget)">
						<span class="icon"><PhPencil :size="16" /></span>
					</button>
				</div>

				<!-- Spending summary: current spend vs. allocation -->
				<div class="mb-4">
					<p class="heading is-6">
						{{ formatCurrency(getBudgetStats(budget, store.transactions).currentSpend) }}
						<span class="has-text-grey">/</span>
						{{ formatCurrency(budget.monthly_allocation) }}
					</p>
					<p class="is-size-7 has-text-grey">Spent</p>
				</div>

					<!-- Progress bar: visual representation of budget utilization with remaining/overage info -->
				<div class="mb-4">
					<progress
						class="progress"
						:value="getBudgetStats(budget, store.transactions).percentage"
						max="100"
						:class="{
							'is-danger': getBudgetStats(budget, store.transactions).isOverBudget,
							'is-success': !getBudgetStats(budget, store.transactions).isOverBudget,
						}"
					>
					</progress>
					<div class="is-flex is-justify-content-space-between is-size-7 has-text-grey">
						<span>{{ getBudgetStats(budget, store.transactions).percentage }}% used</span>
					<span v-if="getBudgetStats(budget, store.transactions).isOverBudget">
						{{ formatCurrency(getBudgetStats(budget, store.transactions).overage) }} over
					</span>
					<span v-else>
						{{ formatCurrency(getBudgetStats(budget, store.transactions).remaining) }} available
					</span>
					</div>
				</div>


				</div>
			</div>
		</div>

		<!-- Budget creation/edit modal: mounted conditionally when showModal is true -->
		<BudgetModal
			v-if="showModal"
			:budget="selectedBudget"
			@close="onModalClose"
		/>
	</div>
</template>
 
<style scoped>
/* custom spinner */
@keyframes spin {
	to { transform: rotate(360deg); }
}

.spinner {
	width: 40px;
	height: 40px;
	border: 3px solid rgba(74, 222, 128, 0.2);
	border-top-color: var(--accent);
	border-radius: 50%;
	animation: spin 0.8s linear infinite;
}
</style>