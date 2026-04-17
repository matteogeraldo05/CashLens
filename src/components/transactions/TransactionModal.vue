<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { PhStorefront, PhTag, PhCalendarBlank } from '@phosphor-icons/vue'
import { useTransactionStore } from '../../lib/stores'

const props = defineProps({
	transaction: { type: Object, default: null },
})

const emit = defineEmits(['close', 'saved', 'deleted'])
const store = useTransactionStore()

// are we editing an existing transaction or adding a new one?
const isEdit = props.transaction !== null

// today's date as default
const today = new Date().toISOString().slice(0, 10)

// form fields as individual refs
const amountRaw = ref('')
const type = ref('expense')
const merchant = ref('')
const category = ref('')
const date = ref(today)
const notes = ref('')

// if editing, fill in the existing values
if (props.transaction) {
	amountRaw.value = String(props.transaction.amount)
	type.value = props.transaction.type
	merchant.value = props.transaction.merchant
	category.value = props.transaction.category
	date.value = props.transaction.date
	if (props.transaction.notes) {
		notes.value = props.transaction.notes
	}
}

const submitted = ref(false)
const saving = ref(false)
const deleting = ref(false)
const confirmDel = ref(false)
const serverErr = ref('')

const CATEGORIES = ['Income', 'Dining', 'Technology', 'Entertainment', 'Transport', 'Housing', 'Health', 'Other']

// parse the amount field into a number
function getAmountNum() {
	let cleaned = amountRaw.value.replace(/[^0-9.]/g, '')
	let num = parseFloat(cleaned)
	if (isNaN(num)) return 0
	return num
}

// individual error messages per field
const amountError = computed(() => {
	if (!submitted.value) return ''
	if (getAmountNum() <= 0) return 'Enter an amount greater than $0.00'
	return ''
})

const merchantError = computed(() => {
	if (!submitted.value) return ''
	if (!merchant.value.trim()) return 'Merchant is required'
	return ''
})

const categoryError = computed(() => {
	if (!submitted.value) return ''
	if (!category.value) return 'Select a category'
	return ''
})

const dateError = computed(() => {
	if (!submitted.value) return ''
	if (!date.value) return 'Date is required'
	return ''
})

// keep amount field clean (numbers and one dot only)
function onAmountInput(e) {
	let val = e.target.value
	val = val.replace(/[^0-9.]/g, '')
	// remove any second decimal point
	let parts = val.split('.')
	if (parts.length > 2) {
		val = parts[0] + '.' + parts.slice(1).join('')
	}
	amountRaw.value = val
}

async function handleSave() {
	submitted.value = true

	// stop if anything is invalid
	if (getAmountNum() <= 0) return
	if (!merchant.value.trim()) return
	if (!category.value) return
	if (!date.value) return

	saving.value = true
	serverErr.value = ''

	let payload = {
		merchant: merchant.value.trim(),
		category: category.value,
		amount: getAmountNum(),
		type: type.value,
		date: date.value,
		notes: notes.value.trim() || null,
	}

	let result
	if (isEdit) {
		result = await store.updateTransaction(props.transaction.id, payload)
	} else {
		result = await store.addTransaction(payload)
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
	let result = await store.deleteTransaction(props.transaction.id)
	deleting.value = false

	if (result.error) {
		serverErr.value = result.error.message || 'Failed to delete transaction.'
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

					<!-- Header -->
					<header class="modal-card-head">
						<div>
							<p class="modal-card-title">{{ isEdit ? 'Edit Transaction' : 'Add Transaction' }}</p>
							<span class="modal-sub">{{ isEdit ? 'MODIFY ENTRY' : 'NEW ENTRY' }}</span>
						</div>
						<button class="delete" aria-label="Close" @click="close"></button>
					</header>

					<!-- Body -->
					<section class="modal-card-body">

						<!-- Amount -->
						<div class="amount-section">
							<label class="label">AMOUNT</label>
							<div class="amount-row">
								<span class="amount-dollar">$</span>
								<input
									class="amount-input"
									:class="{ 'input--error': amountError }"
									type="text"
									inputmode="decimal"
									placeholder="0.00"
									:value="amountRaw"
									@input="onAmountInput"
								/>
							</div>
							<p v-if="amountError" class="help is-danger">{{ amountError }}</p>
						</div>

						<!-- Type toggle -->
						<div class="buttons has-addons is-centered type-toggle">
							<button class="button type-btn" :class="{ 'type-btn--active': type === 'expense' }" @click="type = 'expense'">EXPENSE</button>
							<button class="button type-btn" :class="{ 'type-btn--active': type === 'income' }" @click="type = 'income'">INCOME</button>
						</div>

						<!-- Form fields -->
						<div class="columns is-multiline">

							<div class="column is-half">
								<div class="field">
									<label class="label">MERCHANT</label>
									<div class="control has-icons-left">
										<input v-model="merchant" class="input" :class="{ 'is-danger': merchantError }" type="text" placeholder="e.g. Amazon, Starbucks" />
										<span class="icon is-left"><PhStorefront :size="15" /></span>
									</div>
									<p v-if="merchantError" class="help is-danger">{{ merchantError }}</p>
								</div>
							</div>

							<div class="column is-half">
								<div class="field">
									<label class="label">CATEGORY</label>
									<div class="control has-icons-left">
										<div class="select is-fullwidth" :class="{ 'is-danger': categoryError }">
											<select v-model="category">
												<option value="" disabled>Select Category</option>
												<option v-for="cat in CATEGORIES" :key="cat" :value="cat">{{ cat }}</option>
											</select>
										</div>
										<span class="icon is-left"><PhTag :size="15" /></span>
									</div>
									<p v-if="categoryError" class="help is-danger">{{ categoryError }}</p>
								</div>
							</div>

							<div class="column is-half">
								<div class="field">
									<label class="label">DATE</label>
									<div class="control has-icons-left">
										<input v-model="date" class="input" :class="{ 'is-danger': dateError }" type="date" />
										<span class="icon is-left"><PhCalendarBlank :size="15" /></span>
									</div>
									<p v-if="dateError" class="help is-danger">{{ dateError }}</p>
								</div>
							</div>

							<div class="column is-half">
								<div class="field">
									<label class="label">NOTES <span class="optional">(OPTIONAL)</span></label>
									<div class="control">
										<textarea v-model="notes" class="textarea" placeholder="Add a description..." rows="3"></textarea>
									</div>
								</div>
							</div>

						</div>

						<div v-if="serverErr" class="notification is-danger">{{ serverErr }}</div>

					</section>

					<!-- Footer -->
					<footer class="modal-card-foot">
						<button class="button is-success" :disabled="saving" @click="handleSave">
							{{ saving ? 'SAVING…' : (isEdit ? 'SAVE CHANGES' : 'SAVE TRANSACTION') }}
						</button>
						<button class="button" @click="close">CANCEL</button>

						<!-- Delete only in edit mode -->
						<div v-if="isEdit" class="delete-zone">
							<button v-if="!confirmDel" class="button is-danger is-outlined" @click="confirmDel = true">DELETE</button>
							<span v-else class="is-flex" style="gap: 6px; align-items: center;">
								<span class="confirm-label">Are you sure?</span>
								<button class="button is-danger is-small" :disabled="deleting" @click="handleDelete">
									{{ deleting ? '…' : 'Yes, delete' }}
								</button>
								<button class="button is-small" @click="confirmDel = false">Cancel</button>
							</span>
						</div>
					</footer>

				</div>
			</div>
		</Transition>
	</Teleport>
</template>

<style scoped>
.modal-card { max-width: 520px; width: 100%; }

.modal-sub
{
	font-size: 10px;
	font-weight: 600;
	letter-spacing: 0.1em;
	color: var(--text-muted);
}

/* Amount section */
.amount-section
{
	text-align: center;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 6px;
	margin-bottom: 16px;
}

.amount-section .label
{
	font-size: 10.5px;
	letter-spacing: 0.1em;
	text-transform: uppercase;
}

.amount-row
{
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 6px;
}

.amount-dollar
{
	font-size: 36px;
	font-weight: 300;
	color: var(--accent);
}

.amount-input
{
	background: transparent;
	border: none;
	outline: none;
	font-size: 42px;
	font-weight: 300;
	color: var(--accent);
	width: 200px;
	text-align: left;
	caret-color: var(--accent);
}

.amount-input::placeholder { color: rgba(74, 222, 128, 0.35); }

.input--error { border-bottom: 1px solid rgba(239, 68, 68, 0.5); }

/* Type toggle */
.type-toggle { margin-bottom: 16px; }

.type-btn
{
	font-size: 12px;
	font-weight: 600;
	letter-spacing: 0.07em;
	background: transparent;
	border-color: rgba(255, 255, 255, 0.1);
	color: var(--text-muted);
}

.type-btn--active
{
	background: var(--surface-2) !important;
	color: var(--text) !important;
	border-color: rgba(255, 255, 255, 0.2) !important;
}

/* Form labels */
.label
{
	font-size: 10.5px;
	letter-spacing: 0.09em;
	text-transform: uppercase;
}

.optional { opacity: 0.65; font-weight: 500; }

.input[type="date"]::-webkit-calendar-picker-indicator
{
	filter: invert(0.6);
	cursor: pointer;
}

.control.has-icons-left .select select { padding-left: 2.5em; }

/* Footer layout */
.modal-card-foot { gap: 10px; flex-wrap: wrap; }

.modal-card-foot .button.is-success { flex: 2; }
.modal-card-foot .button:not(.is-success):not(.is-danger) { flex: 1; }

.delete-zone { margin-left: auto; }

.confirm-label
{
	font-size: 12px;
	color: var(--text-muted);
	white-space: nowrap;
}

/* Transition */
.modal-fade-enter-active,
.modal-fade-leave-active { transition: opacity 0.2s ease; }

.modal-fade-enter-active .modal-card,
.modal-fade-leave-active .modal-card { transition: transform 0.2s ease, opacity 0.2s ease; }

.modal-fade-enter-from,
.modal-fade-leave-to { opacity: 0; }

.modal-fade-enter-from .modal-card,
.modal-fade-leave-to .modal-card
{
	transform: scale(0.96);
	opacity: 0;
}
</style>
