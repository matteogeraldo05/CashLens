<script setup>
import { useAccountStore } from '../../lib/stores'
import { PhWallet, PhSquaresFour, PhReceipt, PhChartLine, PhCreditCard, PhGearSix, PhUser } from '@phosphor-icons/vue'

const accountStore = useAccountStore()
</script>

<template>
	<aside class="sidebar menu">

		<!-- Logo -->
		<div class="sidebar-logo">
			<div class="logo-icon">
				<PhWallet :size="28" color="#4ade80" />
			</div>
			<div class="logo-text">
				<span class="logo-name">CA$HLENS</span>
				<span class="logo-sub">WEALTH INTELLIGENCE</span>
			</div>
		</div>

		<!-- Nav -->
		<nav class="sidebar-nav">
			<ul class="menu-list">
				<li>
					<router-link to="/dashboard" active-class="is-active">
						<PhSquaresFour class="nav-icon" />
						Dashboard
					</router-link>
				</li>
				<li>
					<router-link to="/transactions" active-class="is-active">
						<PhReceipt class="nav-icon" />
						Transactions
					</router-link>
				</li>
				<li>
					<router-link to="/budgets" active-class="is-active">
						<PhWallet class="nav-icon" />
						Budgets
					</router-link>
				</li>
				<li>
					<router-link to="/subscriptions" active-class="is-active">
						<PhCreditCard class="nav-icon" />
						Subscriptions
					</router-link>
				</li>
				<li>
					<router-link to="/analytics" active-class="is-active">
						<PhChartLine class="nav-icon" />
						Analytics
					</router-link>
				</li>
				<li>
					<router-link to="/settings" active-class="is-active">
						<PhGearSix class="nav-icon" />
						Settings
					</router-link>
				</li>
			</ul>
		</nav>

		<!-- User footer -->
		<div class="sidebar-footer">
			<div class="is-flex is-align-items-center footer-user">
				<div class="profile-avatar">
					<PhUser :size="15" />
				</div>
				<span class="profile-email">{{ accountStore.username }}</span>
			</div>
		</div>

	</aside>
</template>

<style scoped>
.sidebar
{
	width: 200px;
	min-width: 200px;
	height: 100vh;
	background: var(--surface);
	display: flex;
	flex-direction: column;
	padding: 20px 12px;
	position: sticky;
	top: 0;
	border-right: 1px solid rgba(255, 255, 255, 0.06);
}

/* Logo */
.sidebar-logo
{
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 4px 8px 20px;
	border-bottom: 1px solid rgba(255, 255, 255, 0.06);
	margin-bottom: 12px;
}

.logo-icon { flex-shrink: 0; }

.logo-text
{
	display: flex;
	flex-direction: column;
}

.logo-name
{
	font-size: 18px;
	font-weight: 700;
	color: var(--text);
	letter-spacing: 0.04em;
	line-height: 1.2;
}

.logo-sub
{
	font-size: 8px;
	font-weight: 500;
	color: var(--text-muted);
	letter-spacing: 0.08em;
	text-transform: uppercase;
	line-height: 1.4;
}

/* Nav — override Bulma menu-list defaults */
.sidebar-nav { flex: 1; }

.menu-list a
{
	display: flex;
	align-items: center;
	gap: 10px;
	border-radius: 8px;
	font-size: 13.5px;
	font-weight: 500;
	padding: 9px 10px;
	background-color: transparent;
}

.menu-list a.is-disabled
{
	cursor: not-allowed;
	opacity: 0.5;
	pointer-events: none;
}

.nav-icon
{
	width: 17px;
	height: 17px;
	flex-shrink: 0;
}

/* Footer */
.sidebar-footer
{
	border-top: 1px solid rgba(255, 255, 255, 0.06);
	padding-top: 12px;
}

.footer-user
{
	gap: 8px;
	padding: 4px 8px;
}

.profile-avatar
{
	width: 26px;
	height: 26px;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.08);
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.profile-email
{
	font-size: 12.5px;
	color: var(--text-muted);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	max-width: 120px;
}
</style>
