
<script setup>
import { ref, provide } from 'vue'
import { useAccountStore } from './lib/stores'
import Sidebar from './components/shared/Sidebar.vue'
import MobileHeader from './components/shared/MobileHeader.vue'

const accountStore = useAccountStore()

const sidebarOpen = ref(false)

function toggle() { sidebarOpen.value = !sidebarOpen.value }
function close()  { sidebarOpen.value = false }

provide('sidebar', { open: sidebarOpen, toggle, close })
</script>

<template>
	<!-- Authenticated: two-column layout with persistent sidebar -->
	<div v-if="accountStore.isAuthenticated" class="app-shell">
		<MobileHeader @toggle="toggle" />
		<Sidebar :is-open="sidebarOpen" />
		<div v-if="sidebarOpen" class="sidebar-backdrop" @click="close"></div>
		<main class="app-main">
			<router-view />
		</main>
	</div>

	<!-- Unauthenticated: full-screen (login page) -->
	<router-view v-else />
</template>

<style>
.app-shell {
	display: flex;
	min-height: 100vh;
}

.app-main {
	flex: 1;
	min-width: 0;
	overflow-y: auto;
}

.sidebar-backdrop
{
	position: fixed;
	inset: 0;
	background: rgba(0, 0, 0, 0.55);
	z-index: 40;
}

@media (max-width: 768px)
{
	.app-main { padding-top: 56px; }
}

@media (min-width: 769px)
{
	.sidebar-backdrop { display: none; }
}
</style>
