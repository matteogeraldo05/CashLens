<script setup>
// Auth page: lets users switch between login/register flows and submit credentials.
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAccountStore } from '../lib/stores';

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
		<div class="column is-half">
			<form class="box" @submit.prevent="mode === 'login' ? handleLogin() : handleRegister()">
				<div class="field has-text-centered">INSERT SVG LOGO?</div>
				<div v-if="mode== 'register'" class="field">
					<label class="label">Username</label>
					<div class="control">
						<input class="input" type="text" placeholder="e.g. JohnDoe" v-model="form.username" />
					</div>
				</div>
				<div class="field">
					<label class="label">Email</label>
					<div class="control">
						<input class="input" type="email" placeholder="e.g. name@example.com" v-model="form.email" />
					</div>
				</div>
				<div class="field">
					<label class="label">Password</label>
					<div class="control">
						<input class="input" type="password" placeholder="e.g. ********" v-model="form.password" />
					</div>
				</div>
				<button class="button is-primary is-light" type="submit">{{ mode === 'login' ? 'Log In' : 'Register' }}</button>
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
</style>
