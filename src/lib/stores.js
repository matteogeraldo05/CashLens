/*
	Central auth store: tracks the session user/profile and wraps all auth actions
	(init, login, register, logout) against Supabase.
*/
import { defineStore } from 'pinia';
import { supabase } from './supabase';
import router from '../router';

export const useAccountStore = defineStore('account', {
	state: () => ({
		user: null,
		profile: null,
		error: '',
	}),

	getters: {
		isAuthenticated: (state) => Boolean(state.user),
		username: (state) => state.profile?.username || state.user?.email || '',
	},

	actions: {
		async loadProfile(userId) {
			if (!userId) {
				this.profile = null;
				return;
			}

			const { data, error } = await supabase
				.from('profiles')
				.select('id, username, email')
				.eq('id', userId)
				.maybeSingle();

			if (error) this.error = error.message;
			this.profile = data ?? null;
		},

		async initAuth() {
			const { data: { session }, error } = await supabase.auth.getSession();

			if (error) this.error = error.message;

			this.user = session?.user ?? null;
			await this.loadProfile(this.user?.id);

			supabase.auth.onAuthStateChange(async (_event, sessionData) => {
				this.user = sessionData?.user ?? null;
				await this.loadProfile(this.user?.id);
			});
		},

		async login(email, password) {
			this.error = '';

			const { data, error } = await supabase.auth.signInWithPassword({ email, password });

			if (error) {
				this.error = error.message;
			} else {
				this.user = data.user;
				await this.loadProfile(this.user?.id);
			}

			return { error };
		},

		async register(username, email, password) {
			this.error = '';

			const { data, error } = await supabase.auth.signUp({
				email,
				password,
				options: { data: { display_name: username } },
			});

			if (error) {
				this.error = error.message;
				return { error };
			}

			if (data?.user) {
				const { error: profileError } = await supabase.from('profiles').upsert({
					id: data.user.id,
					username,
					email,
				});

				if (profileError) {
					this.error = profileError.message;
				} else {
					await this.loadProfile(data.user.id);
				}
			}

			return { error };
		},

		async logout() {
			this.error = '';

			const { error } = await supabase.auth.signOut();

			if (error) {
				this.error = error.message;
			} else {
				this.user = null;
				this.profile = null;
				router.push('/');
			}

			return { error };
		},
	},
});