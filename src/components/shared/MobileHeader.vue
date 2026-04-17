<script setup>
import { PhList, PhWallet } from '@phosphor-icons/vue'

defineEmits(['toggle'])
</script>

<template>
	<header class="mobile-header">
		<button class="mobile-hamburger" @click="$emit('toggle')" aria-label="Open menu">
			<PhList :size="22" />
		</button>
		<div class="mobile-logo">
			<PhWallet :size="20" color="#4ade80" />
			<span class="mobile-logo-name">CA$HLENS</span>
		</div>
	</header>
</template>

<style scoped>
.mobile-header
{
	display: none;
}

@media (max-width: 768px)
{
	.mobile-header
	{
		display: flex;
		align-items: center;
		gap: 12px;
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 56px;
		background: var(--surface);
		border-bottom: 1px solid rgba(255, 255, 255, 0.06);
		padding: 0 16px;
		z-index: 30;
	}
}

.mobile-hamburger
{
	background: none;
	border: none;
	color: var(--text);
	cursor: pointer;
	padding: 6px;
	border-radius: 8px;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: background 0.12s;
}

.mobile-hamburger:hover { background: rgba(255, 255, 255, 0.07); }

.mobile-logo
{
	display: flex;
	align-items: center;
	gap: 8px;
}

.mobile-logo-name
{
	font-size: 17px;
	font-weight: 700;
	color: var(--text);
	letter-spacing: 0.04em;
}
</style>
