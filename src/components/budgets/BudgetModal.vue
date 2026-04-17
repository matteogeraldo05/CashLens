<!-- Modal component for creating and editing budgets -->
<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { PhForkKnife, PhTag, PhWarning } from '@phosphor-icons/vue'
import { useTransactionStore } from '../../lib/stores'

const props = defineProps({
	budget: { type: Object, default: null },
})

const emit = defineEmits(['close', 'saved', 'deleted'])
const store = useTransactionStore()
const isEdit = props.budget !== null

const budgetName = ref('')
const category = ref('')
const amount = ref(0)
const notes = ref('')

// for when editing, pre fill all the values with current budget data
if (props.budget) {
	budgetName.value = props.budget.name
	category.value = props.budget.category
	amount.value = props.budget.monthly_allocation
	if (props.budget.notes) {
		notes.value = props.budget.notes
	}
}

const submitted = ref(false)
const saving = ref(false)
const deleting = ref(false)
const serverErr = ref('')

const BUDGET_CATEGORIES = ['Income', 'Dining', 'Technology', 'Entertainment', 'Transport', 'Housing', 'Health', 'Other']

// individual error messages per field
const budgetNameError = computed(() => {
	if (!submitted.value) return ''
	if (!budgetName.value.trim()) return 'Budget name is required'
	return ''
})

const categoryError = computed(() => {
	if (!submitted.value) return ''
	if (!category.value) return 'Select a category'
	return ''
})

const amountError = computed(() => {
	if (!submitted.value) return ''
	if (amount.value <= 0) return 'Enter an amount greater than $0.00'
	return ''
})

// Format amount safely for display
function formatAmount() {
	const num = Number(amount.value) || 0
	return num.toFixed(2)
}

// Get icon emoji for category
function getCategoryIcon(catName) {
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
	return icons[catName]
}

async function handleSave() {
	submitted.value = true

	// stop if anything is invalid
	if (!budgetName.value.trim()) return
	if (!category.value) return
	if (amount.value <= 0) return

	saving.value = true
	serverErr.value = ''

	let payload = {
		name: budgetName.value.trim(),
		category: category.value,
		monthly_allocation: amount.value,
		notes: notes.value.trim() || null,
	}

	let result
	if (isEdit) {
		result = await store.updateBudget(props.budget.id, payload)
	} else {
		result = await store.addBudget(payload)
	}

	saving.value = false

	if (result.error) {
		serverErr.value = result.error.message || 'Something went wrong. Please try again.'
		return
	}

	emit('saved')
	emit('close')
}

async function handleDelete() {
	deleting.value = true
	let result = await store.deleteBudget(props.budget.id)
	deleting.value = false

	if (result.error) {
		serverErr.value = result.error.message || 'Failed to delete budget.'
		return
	}

	emit('deleted')
	emit('close')
}

function close() {
	emit('close')
}

function onKeydown(e) {
	if (e.key === 'Escape') {
		close()
	}
}

onMounted(() => {
	document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
	document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
	<Teleport to="body">
		<Transition name="modal-fade" appear>
			<div class="modal is-active">
				<div class="modal-background" @click="close"></div>

				<div class="modal-card">

					<!-- header -->
					<header class="modal-card-head">
						<div>
							<p class="modal-card-title">{{ isEdit ? 'Edit Budget' : 'Add Budget' }}</p>
							<span class="modal-sub">{{ isEdit ? 'MODIFY BUDGET' : 'NEW BUDGET' }}</span>
						</div>
					</header>

					<section class="modal-card-body">
						<!-- preview -->
						<div class="box mb-4" style="border-left: 4px solid var(--accent);">
							<div class="is-flex is-align-items-center" style="gap: 16px;">
								<div v-if="category" style="font-size: 32px;">{{ getCategoryIcon(category) }}</div>
								<div style="flex: 1;">
									<p class="title is-5 mb-1">{{ budgetName || 'Budget Name' }}</p>
									<p class="is-size-7 has-text-grey">
										<strong style="color: var(--accent);">${{ formatAmount() }}</strong>
										Allocation
									</p>
								</div>
							</div>
						</div>

						<!-- form -->
						<div class="columns is-multiline">

							<div class="column is-half">
								<div class="field">
									<label class="label">Budget Name</label>
									<div class="control">
										<input v-model="budgetName" class="input" :class="{ 'is-danger': budgetNameError }" type="text" placeholder="e.g. Dining Out" />
									</div>
									<p v-if="budgetNameError" class="help is-danger">{{ budgetNameError }}</p>
								</div>
							</div>

							<div class="column is-half">
								<div class="field">
									<label class="label">Category</label>
									<div class="control has-icons-left">
										<div class="select is-fullwidth" :class="{ 'is-danger': categoryError }">
											<select v-model="category">
												<option value="" disabled>Select Category</option>
												<option v-for="cat in BUDGET_CATEGORIES" :key="cat" :value="cat">{{ cat }}</option>
											</select>
										</div>
										<span class="icon is-left"><PhTag :size="15" /></span>
									</div>
									<p v-if="categoryError" class="help is-danger">{{ categoryError }}</p>
								</div>
							</div>

							<div class="column is-half">
								<div class="field">
									<label class="label">Monthly allocation</label>
									<div class="control">
										<span class="amount-prefix">$</span>
										<input
											v-model.number="amount"
											class="input amount-input"
											:class="{ 'is-danger': amountError }"
											type="number"
											step="1"
											min="0"
											placeholder="0.00"
										/>
									</div>
									<p v-if="amountError" class="help is-danger">{{ amountError }}</p>
								</div>
							</div>

							<div class="column is-full">
								<div class="field">
									<label class="label">Notes <span class="optional">(OPTIONAL)</span></label>
									<div class="control">
										<textarea v-model="notes" class="textarea" placeholder="Add a description..." rows="2"></textarea>
									</div>
								</div>
							</div>

						</div>

						<div v-if="serverErr" class="notification is-danger">{{ serverErr }}</div>

					</section>

					<!-- footer -->
					<footer class="modal-card-foot is-flex is-justify-content-space-between">
						<div class="buttons">
							<button class="button is-success" :disabled="saving" @click="handleSave">
								{{ saving ? 'UPDATING…' : (isEdit ? 'UPDATE BUDGET' : 'CREATE BUDGET') }}
							</button>
							<button class="button" @click="close">CANCEL</button>
						</div>

						<!-- delete only when edit -->
						<div v-if="isEdit">
						<button class="button is-danger is-outlined" :disabled="deleting" @click="handleDelete">
							<span class="icon"><PhWarning :size="16" /></span>
							<span>{{ deleting ? 'DELETING…' : 'DELETE' }}</span>
						</button>
						</div>
					</footer>

				</div>
			</div>
		</Transition>
	</Teleport>
</template>

<style scoped>
.modal-card { max-width: 620px; width: 100%; }

.modal-card-head {
	box-shadow: none;
	border-bottom: none;
}

.modal-card-body {
	box-shadow: none;
	border-top: none;
}

.modal-sub {
	font-size: 10px;
	font-weight: 600;
	letter-spacing: 0.1em;
	color: var(--text-muted);
}

.amount-prefix {
	position: absolute;
	left: 12px;
	top: 50%;
	transform: translateY(-50%);
	font-size: 16px;
	font-weight: 500;
	color: var(--accent);
	pointer-events: none;
}

/* Transition */
.modal-fade-enter-active,
.modal-fade-leave-active { transition: opacity 0.2s ease; }

.modal-fade-enter-active .modal-card,
.modal-fade-leave-active .modal-card { transition: transform 0.2s ease, opacity 0.2s ease; }

.modal-fade-enter-from,
.modal-fade-leave-to { opacity: 0; }

.modal-fade-enter-from .modal-card,
.modal-fade-leave-to .modal-card {
	transform: scale(0.96);
	opacity: 0;
}
</style>