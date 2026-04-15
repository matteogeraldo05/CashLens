
<script setup>
import { useAccountStore } from './lib/stores';
import Sidebar from './components/shared/Sidebar.vue';

const accountStore = useAccountStore();
</script>

<template>
	<!-- Authenticated: two-column layout with persistent sidebar -->
	<div v-if="accountStore.isAuthenticated" class="app-shell">
		<Sidebar />
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
</style>
