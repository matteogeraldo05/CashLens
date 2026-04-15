<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import $ from 'jquery'
import { useTransactionStore } from '../../lib/stores'
import TransactionRow from './TransactionRow.vue'
import TransactionModal from './TransactionModal.vue'
import { PhPlus, PhMagnifyingGlass, PhReceipt } from '@phosphor-icons/vue'

const store = useTransactionStore()

// null = modal closed, 'new' = adding, object = editing
const modalTx = ref(null)
const categoryFilter = ref('All')
const sortBy = ref('date')

const toast = ref({ show: false, msg: '' })
let toastTimer = null

const CATEGORIES = ['All', 'Income', 'Dining', 'Technology', 'Entertainment', 'Transport', 'Housing', 'Health', 'Other']

// filter and sort the transactions list
const visible = computed(() => {
	// filter by category first
	let filtered = []
	for (let i = 0; i < store.transactions.length; i++) {
		let t = store.transactions[i]
		if (categoryFilter.value === 'All' || t.category === categoryFilter.value) {
		filtered.push(t)
		}
	}

	// sort by whatever the user picked
	if (sortBy.value === 'date') {
		filtered.sort(function(a, b) {
		return new Date(b.date) - new Date(a.date)
		})
	} else if (sortBy.value === 'amount') {
		filtered.sort(function(a, b) {
		return b.amount - a.amount
		})
	} else if (sortBy.value === 'merchant') {
		filtered.sort(function(a, b) {
		if (a.merchant < b.merchant) return -1
		if (a.merchant > b.merchant) return 1
		return 0
		})
	}

	return filtered
})

// jQuery search — rubric requirement
function runSearch() {
	let searchText = $('#search').val()
	if (!searchText) searchText = ''
	searchText = searchText.toLowerCase()

	$('#tx-table tbody tr').each(function() {
		let merchantName = $(this).data('merchant')
		if (!merchantName) merchantName = ''
		merchantName = merchantName.toLowerCase()

		if (merchantName.includes(searchText)) {
		$(this).show()
		} else {
		$(this).hide()
		}
	})
}

// re-run search whenever filter or sort changes
watch(visible, () => {
	nextTick(runSearch)
})

onMounted(async () => {
	await store.fetchTransactions()
	await nextTick()
	$('#search').on('input', runSearch)
})

function showToast(msg) {
	clearTimeout(toastTimer)
	toast.value.show = true
	toast.value.msg = msg
	toastTimer = setTimeout(() => {
		toast.value.show = false
	}, 3000)
}

function onSaved() {
	let wasEdit = modalTx.value !== 'new'
	modalTx.value = null
	if (wasEdit) {
		showToast('Transaction updated.')
	} else {
		showToast('Transaction added.')
	}
}

function onDeleted() {
	modalTx.value = null
	showToast('Transaction deleted.')
}
</script>

<template>
	<div class="tx-page">

		<!-- Top bar -->
		<div class="level tx-topbar">
			<div class="level-left">
				<div class="level-item">
					<h1 class="tx-title">Transactions</h1>
				</div>
			</div>
			<div class="level-right">
				<div class="level-item">
					<button class="button is-success" @click="modalTx = 'new'">
						<span class="icon is-small"><PhPlus :size="14" weight="bold" /></span>
						<span>Add Transaction</span>
					</button>
				</div>
			</div>
		</div>

		<!-- Filter row -->
		<div class="field is-grouped filter-row">
			<div class="control is-expanded has-icons-left">
				<input id="search" class="input" type="text" placeholder="Merchant name" autocomplete="off" />
				<span class="icon is-left"><PhMagnifyingGlass :size="16" /></span>
			</div>
			<div class="control">
				<div class="select">
					<select v-model="categoryFilter">
						<option v-for="cat in CATEGORIES" :key="cat" :value="cat">
							{{ cat === 'All' ? 'Category: All' : cat }}
						</option>
					</select>
				</div>
			</div>
			<div class="control">
				<div class="select">
					<select v-model="sortBy">
						<option value="date">Sort by: Date</option>
						<option value="amount">Sort by: Amount</option>
						<option value="merchant">Sort by: Merchant</option>
					</select>
				</div>
			</div>
		</div>

		<!-- Table -->
		<div class="box tx-table-wrap">

			<!-- Loading skeleton -->
			<table v-if="store.loading" class="table is-fullwidth tx-table">
				<thead>
					<tr>
						<th>DATE</th><th>MERCHANT</th><th>CATEGORY</th><th class="has-text-right">AMOUNT</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="n in 3" :key="n" class="skeleton-row">
						<td><div class="skel skel--sm"></div></td>
						<td><div class="skel skel--md"></div></td>
						<td><div class="skel skel--xs"></div></td>
						<td class="has-text-right"><div class="skel skel--sm" style="margin-left:auto"></div></td>
					</tr>
				</tbody>
			</table>

			<!-- Empty state -->
			<div v-else-if="store.transactions.length === 0" class="empty-state">
				<PhReceipt :size="48" color="#6b7280" />
				<p>No transactions yet</p>
				<button class="button is-success" @click="modalTx = 'new'">
					<span class="icon is-small"><PhPlus :size="14" weight="bold" /></span>
					<span>Add Transaction</span>
				</button>
			</div>

			<!-- Table with rows -->
			<table v-else id="tx-table" class="table is-fullwidth is-hoverable tx-table">
				<thead>
					<tr>
						<th>DATE</th>
						<th>MERCHANT</th>
						<th>CATEGORY</th>
						<th class="has-text-right">AMOUNT</th>
					</tr>
				</thead>
				<TransitionGroup name="row" tag="tbody" appear>
					<TransactionRow
						v-for="t in visible"
						:key="t.id"
						:transaction="t"
						@edit="modalTx = $event"
					/>
					<tr v-if="visible.length === 0" key="no-results">
						<td colspan="4" class="no-results">No transactions match your filters.</td>
					</tr>
				</TransitionGroup>
			</table>

		</div>

		<!-- Single modal handles both add and edit -->
		<TransactionModal
			v-if="modalTx"
			:transaction="modalTx === 'new' ? null : modalTx"
			@close="modalTx = null"
			@saved="onSaved"
			@deleted="onDeleted"
		/>

		<!-- Toast -->
		<Transition name="toast">
			<div v-if="toast.show" class="toast toast--success">{{ toast.msg }}</div>
		</Transition>

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
