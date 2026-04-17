<script setup>
// Auth page: lets users switch between login/register flows and submit credentials.
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAccountStore } from '../lib/stores';
import { PhWallet } from '@phosphor-icons/vue';

const router = useRouter();

const accountStore = useAccountStore();
const { user, error, isAuthenticated, username } = storeToRefs(accountStore);

const form = reactive({
	username: '',
	email: '',
	password: '',
});
const mode = ref('login');
const formError = ref('');

async function handleLogin() {
	formError.value = '';

	if (!form.email || !form.password) {
		formError.value = 'Please fill out email and password.';
		return;
	}

	const { error } = await accountStore.login(form.email, form.password);
	if (error) return;
	if (!error) router.push('/dashboard');
}

async function handleRegister() {
	formError.value = '';

	if (!form.username || !form.email || !form.password) {
		formError.value = 'Please fill out username, email, and password.';
		return;
	}

	const { error } = await accountStore.register(form.username, form.email, form.password);
	if (error) return;
	if (!error) router.push('/dashboard');
}

async function handleLogout() {
	await accountStore.logout();
}

function setMode(nextMode) {
	mode.value = nextMode;
	formError.value = '';
	accountStore.error = '';
}
</script>

<template>
	<div class="columns is-centered is-vcentered" style="height: 100vh;">
		<div class="column is-half-mobile is-one-third-tablet is-one-fifth-desktop">			
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

			<form class="box" @submit.prevent="mode === 'login' ? handleLogin() : handleRegister()">
				
				<div v-if="mode === 'register'" class="auth-header">
					<h2 class="auth-title">Create Your Account</h2>
					<p class="auth-subtitle">Enter your details to start monitoring your wealth</p>
				</div>
				<div v-if="mode === 'login'" class="auth-header">
					<h2 class="auth-title">Welcome back</h2>
					<p class="auth-subtitle">Sign into your CashLens Account</p>
				</div>
				<div v-if="mode== 'register'" class="field">
					<label class="label">Username</label>
					<div class="control">
						<input class="input" type="text" placeholder="e.g. JohnDoe" v-model="form.username" />
					</div>
				</div>
				<div class="field">
					<label class="label">Email Address</label>
					<div class="control">
						<input class="input" type="email" placeholder="e.g. name@example.com" v-model="form.email" />
					</div>
				</div>
				<div class="field">
					<label class="label">Password</label>
					<div class="control">
						<input class="input" type="password" placeholder="" v-model="form.password" />
					</div>
				</div>
				<button class="button is-success is-fullwidth" type="submit">{{ mode === 'login' ? 'Log In' : 'Register' }}</button>
				<p v-if="formError || error" class="help is-danger">{{ formError || error }}</p>
				<label v-if="mode === 'login'" class="label center light">Don't have an account yet? <a href="#" @click.prevent="setMode('register')">Sign up</a></label>
				<label v-if="mode === 'register'" class="label center light">Already have an account? <a href="#" @click.prevent="setMode('login')">Log in</a></label>
			</form>
		</div>
	</div>
</template>

<style scoped>
.center
{
	text-align: center;
}
.light
{
	font-weight: 300;
	font-size: 0.9em;
	opacity: 0.7;
}

/* FIX TO THE MOBILE ISSUE */
.columns {
    display: flex;
}

.box {
    border: none;
}

/* Logo */
.sidebar-logo
{
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 10px;
	padding: 4px 8px 40px;
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

.label {
	color: rgb(192, 192, 192);
}

/* Auth headers */
.auth-header {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	text-align: center;
	margin-bottom: 24px;
}

.auth-title {
	font-size: 24px;
	font-weight: 700;
	color: var(--text);
	margin-bottom: 8px;
}

.auth-subtitle {
	font-size: 14px;
	color: var(--text-muted);
	margin: 0;
}

</style>
