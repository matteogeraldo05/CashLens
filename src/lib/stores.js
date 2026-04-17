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

/*
	Transactions store: fetches, adds, and deletes transactions for the logged-in user.
	All Supabase calls live here — components only call store actions.
*/
export const useTransactionStore = defineStore('transactions', {
	state: () => ({
		transactions: [],
		budgets: [],
		loading: false,
		error: null,
		currentPage: 1,
		pageSize: 6,
	}),

	getters: {
		totalCount: (state) => state.transactions.length,

		paginatedTransactions: (state) => {
			const start = (state.currentPage - 1) * state.pageSize;
			return state.transactions.slice(start, start + state.pageSize);
		},

		totalPages: (state) => Math.ceil(state.transactions.length / state.pageSize),
		totalBudgets: (state) => state.budgets.length,
	},

	actions: {
		async fetchTransactions() {
			const accountStore = useAccountStore();
			const uid = accountStore.user?.id;
			if (!uid) return;

			this.loading = true;
			this.error = null;

			const { data, error } = await supabase
				.from('transactions')
				.select('*')
				.eq('user_id', uid)
				.order('date', { ascending: false });

			this.loading = false;

			if (error) {
				this.error = error.message;
			} else {
				this.transactions = data ?? [];
			}
		},

		async addTransaction(payload) {
			const accountStore = useAccountStore();
			const uid = accountStore.user?.id;
			if (!uid) return { error: 'Not authenticated' };

			this.error = null;

			const { data, error } = await supabase
				.from('transactions')
				.insert({ ...payload, user_id: uid })
				.select()
				.single();

			if (error) {
				this.error = error.message;
				return { error };
			}

			this.transactions.unshift(data);
			return { data };
		},

		async updateTransaction(id, payload) {
			const accountStore = useAccountStore();
			const uid = accountStore.user?.id;
			if (!uid) return { error: 'Not authenticated' };

			this.error = null;

			const { data, error } = await supabase
				.from('transactions')
				.update(payload)
				.eq('id', id)
				.eq('user_id', uid)
				.select()
				.single();

			if (error) {
				this.error = error.message;
				return { error };
			}

			const idx = this.transactions.findIndex((t) => t.id === id);
			if (idx !== -1) this.transactions[idx] = data;
			return { data };
		},

		async deleteTransaction(id) {
			const accountStore = useAccountStore();
			const uid = accountStore.user?.id;
			if (!uid) return { error: 'Not authenticated' };

			this.error = null;

			const { error } = await supabase
				.from('transactions')
				.delete()
				.eq('id', id)
				.eq('user_id', uid);

			if (error) {
				this.error = error.message;
				return { error };
			}

			this.transactions = this.transactions.filter((t) => t.id !== id);
			return {};
		},

		setPage(n) {
			this.currentPage = n;
		},

		resetError() {
			this.error = null;
		},

		// budget actions added to transactions store
		async fetchBudgets() {
			const accountStore = useAccountStore();
			const uid = accountStore.user?.id;
			if (!uid) return;

			this.loading = true;
			this.error = null;

			const { data, error } = await supabase
				.from('budgets')
				.select('*')
				.eq('user_id', uid)
				.order('created_at', { ascending: false });

			this.loading = false;

			if (error) {
				this.error = error.message;
			} else {
				this.budgets = data ?? [];
			}
		},

		async addBudget(payload) {
			const accountStore = useAccountStore();
			const uid = accountStore.user?.id;
			if (!uid) return { error: 'Not authenticated' };

			this.error = null;

			const { data, error } = await supabase
				.from('budgets')
				.insert({
					...payload,
					user_id: uid,
					created_at: new Date().toISOString(),
				})
				.select()
				.single();

			if (error) {
				this.error = error.message;
				return { error };
			}

			this.budgets.unshift(data);
			return { data };
		},

		async updateBudget(id, payload) {
			const accountStore = useAccountStore();
			const uid = accountStore.user?.id;
			if (!uid) return { error: 'Not authenticated' };

			this.error = null;

			const { data, error } = await supabase
				.from('budgets')
				.update({
					...payload,
					updated_at: new Date().toISOString(),
				})
				.eq('id', id)
				.eq('user_id', uid)
				.select()
				.single();

			if (error) {
				this.error = error.message;
				return { error };
			}

			const idx = this.budgets.findIndex((b) => b.id === id);
			if (idx !== -1) this.budgets[idx] = data;
			return { data };
		},

		async deleteBudget(id) {
			const accountStore = useAccountStore();
			const uid = accountStore.user?.id;
			if (!uid) return { error: 'Not authenticated' };

			this.error = null;

			const { error } = await supabase
				.from('budgets')
				.delete()
				.eq('id', id)
				.eq('user_id', uid);

			if (error) {
				this.error = error.message;
				return { error };
			}

			this.budgets = this.budgets.filter((b) => b.id !== id);
			return {};
		},
	},
});


export const useSubscriptionStore = defineStore('subscriptions', {
	state: () => ({
		subscriptions: [],
		loading: false,
		error: null,
		currentPage: 1,
		pageSize: 6,
	}),

	getters: {
		totalCount: (state) => state.subscriptions.length,

		paginatedSubscriptions: (state) => {
			const start = (state.currentPage - 1) * state.pageSize;
			return state.subscriptions.slice(start, start + state.pageSize);
		},

		totalPages: (state) => Math.ceil(state.subscriptions.length / state.pageSize),
	},

	actions: {
		async fetchSubscriptions() {
			const accountStore = useAccountStore();
			const uid = accountStore.user?.id;
			if (!uid) return;

			this.loading = true;
			this.error = null;

			const { data, error } = await supabase
				.from('subscriptions')
				.select('*')
				.eq('user_id', uid)
				.order('next_charge', { ascending: false });

			this.loading = false;

			if (error) {
				this.error = error.message;
			} else {
				this.subscriptions = data ?? [];
			}
		},

		async addSubscription(payload) {
			const accountStore = useAccountStore();
			const uid = accountStore.user?.id;
			if (!uid) return { error: 'Not authenticated' };

			this.error = null;

			const { data, error } = await supabase
				.from('subscriptions')
				.insert({ ...payload, user_id: uid })
				.select()
				.single();

			if (error) {
				this.error = error.message;
				return { error };
			}

			this.subscriptions.unshift(data);
			return { data };
		},

		async updateSubscription(id, payload) {
			const accountStore = useAccountStore();
			const uid = accountStore.user?.id;
			if (!uid) return { error: 'Not authenticated' };

			this.error = null;

			const { data, error } = await supabase
				.from('subscriptions')
				.update(payload)
				.eq('id', id)
				.eq('user_id', uid)
				.select()
				.single();

			if (error) {
				this.error = error.message;
				return { error };
			}

			const idx = this.subscriptions.findIndex((t) => t.id === id);
			if (idx !== -1) this.subscriptions[idx] = data;
			return { data };
		},

		async deleteSubscription(id) {
			const accountStore = useAccountStore();
			const uid = accountStore.user?.id;
			if (!uid) return { error: 'Not authenticated' };

			this.error = null;

			const { error } = await supabase
				.from('subscriptions')
				.delete()
				.eq('id', id)
				.eq('user_id', uid);

			if (error) {
				this.error = error.message;
				return { error };
			}

			this.subscriptions = this.subscriptions.filter((t) => t.id !== id);
			return {};
		},

		setPage(n) {
			this.currentPage = n;
		},

		resetError() {
			this.error = null;
		},


	

	},
});


