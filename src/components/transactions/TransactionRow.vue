<script setup>
import {
	PhArrowUp, PhForkKnife, PhLaptop, PhFilmSlate,
	PhCar, PhHouse, PhHeartbeat, PhDotsThree, PhPencilSimple,
} from '@phosphor-icons/vue'

const props = defineProps({
	transaction: {
		type: Object,
		required: true,
	},
})

const emit = defineEmits(['edit'])

// get the accent color for a category
function getCategoryColor(category) {
	if (category === 'Income') return '#4ade80'
	if (category === 'Dining') return '#fb923c'
	if (category === 'Technology') return '#f87171'
	if (category === 'Entertainment') return '#c084fc'
	if (category === 'Transport') return '#22d3ee'
	if (category === 'Housing') return '#facc15'
	if (category === 'Health') return '#f472b6'
	return '#9ca3af'
}

// get the background color for the category icon bubble
function getCategoryBg(category) {
	if (category === 'Income') return 'rgba(74,222,128,0.13)'
	if (category === 'Dining') return 'rgba(251,146,60,0.13)'
	if (category === 'Technology') return 'rgba(248,113,113,0.13)'
	if (category === 'Entertainment') return 'rgba(192,132,252,0.13)'
	if (category === 'Transport') return 'rgba(34,211,238,0.13)'
	if (category === 'Housing') return 'rgba(250,204,21,0.13)'
	if (category === 'Health') return 'rgba(244,114,182,0.13)'
	return 'rgba(156,163,175,0.13)'
}

// get the icon component for a category
function getCategoryIcon(category) {
	if (category === 'Income') return PhArrowUp
	if (category === 'Dining') return PhForkKnife
	if (category === 'Technology') return PhLaptop
	if (category === 'Entertainment') return PhFilmSlate
	if (category === 'Transport') return PhCar
	if (category === 'Housing') return PhHouse
	if (category === 'Health') return PhHeartbeat
	return PhDotsThree
}

function formatDate(dateStr) {
	let parts = dateStr.split('-')
	let year = Number(parts[0])
	let month = Number(parts[1])
	let day = Number(parts[2])
	let d = new Date(year, month - 1, day)
	let monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
	return monthNames[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear()
}

function formatAmount(amount, type) {
	// format to 2 decimal places with commas
	let num = amount.toFixed(2)
	let parts = num.split('.')
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
	let formatted = '$' + parts[0] + '.' + parts[1]
	if (type === 'income') {
		return '+' + formatted
	} else {
		return '-' + formatted
	}
}
</script>

<template>
	<tr class="tx-row" :data-merchant="transaction.merchant">

		<!-- DATE -->
		<td class="tx-date">{{ formatDate(transaction.date) }}</td>

		<!-- MERCHANT -->
		<td>
			<div class="is-flex is-align-items-center" style="gap: 12px;">
				<div class="category-icon" :style="{ background: getCategoryBg(transaction.category) }">
					<component :is="getCategoryIcon(transaction.category)" :size="18" :color="getCategoryColor(transaction.category)" />
				</div>
				<span class="merchant-name">{{ transaction.merchant }}</span>
			</div>
		</td>

		<!-- CATEGORY -->
		<td>
			<span class="tag category-badge">{{ transaction.category.toUpperCase() }}</span>
		</td>

		<!-- AMOUNT + EDIT -->
		<td class="tx-amount" :class="transaction.type === 'income' ? 'amount--income' : 'amount--expense'">
			<div class="is-flex is-align-items-center is-justify-content-flex-end" style="gap: 14px;">
				<span>{{ formatAmount(transaction.amount, transaction.type) }}</span>
				<button class="button is-small edit-btn" title="Edit transaction" @click="emit('edit', transaction)">
					<span class="icon is-small"><PhPencilSimple :size="14" /></span>
				</button>
			</div>
		</td>

	</tr>
</template>

<style scoped>
.tx-row
{
	border-bottom: 1px solid rgba(255, 255, 255, 0.06);
	transition: background 0.12s;
}

.tx-row:hover { background: rgba(255, 255, 255, 0.025); }

.tx-row td
{
	padding: 16px 20px;
	font-size: 14px;
}

.tx-date
{
	color: var(--text-muted);
	white-space: nowrap;
	width: 130px;
}

.category-icon
{
	width: 36px;
	height: 36px;
	border-radius: 10px;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.merchant-name { font-weight: 500; }

.category-badge
{
	font-size: 10.5px;
	font-weight: 600;
	letter-spacing: 0.07em;
}

.tx-amount
{
	text-align: right;
	font-weight: 600;
	font-size: 15px;
	white-space: nowrap;
}

.amount--income { color: var(--accent); }
.amount--expense { color: var(--danger); }

.edit-btn
{
	opacity: 0.45;
	transition: opacity 0.12s;
	flex-shrink: 0;
}

.edit-btn:hover { opacity: 1; }
</style>
