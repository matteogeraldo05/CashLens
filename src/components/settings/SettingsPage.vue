<script setup>
import { reactive, computed } from 'vue';
import { useAccountStore } from '../../lib/stores';
import { supabase } from '../../lib/supabase';

// access global auth/profile state (Pinia)
const accountStore = useAccountStore();

/**
 * Holds the last saved values from the DB
 * Used for:
 * - detecting changes
 * - resetting form (discard)
 */
const original = reactive({
  username: accountStore?.username || '',
  email: accountStore.profile?.email || '',
  currency: accountStore.profile?.currency || 'CAD'
});

/**
 * Editable form state (what user is currently typing/selecting)
 * Starts as a copy of original
 */
const form = reactive({ ...original });

/**
 * Password fields are separate since they are optional
 * (user might not be changing password at all)
 */
const password = reactive({
  current: '',
  new: '',
  confirm: ''
});

/**
 * Checks if anything has changed compared to original state
 * Used to enable/disable Save + Discard buttons
 */
const hasChanges = computed(() =>
  form.username !== original.username ||
  form.email !== original.email ||
  form.currency !== original.currency ||
  password.current ||
  password.new ||
  password.confirm
);

/**
 * Tracks currency changes specifically
 * Gives both old and new values (useful for logging or conversions later)
 */
const currencyChange = computed(() => {
  if (form.currency === original.currency) return null;

  return {
    from: original.currency,
    to: form.currency
  };
});

/**
 * "Delete account" = soft delete
 * Marks user as disabled instead of removing data
 */
async function deleteAccount() {
  const user = accountStore.user;
  if (!user) return;

  if (!confirm('Delete your account? This can’t be undone.')) return;

  try {
    const { error } = await supabase
      .from('profiles')
      .update({ disabled: true })
      .eq('id', user.id);

    if (error) throw error;

    // log user out after disabling account
    await accountStore.logout();
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
}

/**
 * Saves all settings changes
 * Handles:
 * - profile updates (username/email/currency)
 * - auth email update
 * - password change
 */
async function saveSettings() {
  try {
    const user = accountStore.user;
    if (!user) throw new Error('Not logged in');

    // update profile table (main user data)
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        username: form.username,
        email: form.email,
        currency: form.currency
      })
      .eq('id', user.id);

    if (profileError) throw profileError;

    // update email in Supabase Auth (separate system)
    if (form.email !== original.email) {
      const { error: emailError } = await supabase.auth.updateUser({
        email: form.email
      });

      if (emailError) throw emailError;
    }

    // update password if user entered one
    if (password.new) {
      if (password.new !== password.confirm) {
        throw new Error('Passwords do not match');
      }

      const { error: passError } = await supabase.auth.updateUser({
        password: password.new
      });

      if (passError) throw passError;
    }

    // log currency change (for debugging / future conversion logic)
    if (currencyChange.value) {
      console.log(
        `Currency changed from ${currencyChange.value.from} → ${currencyChange.value.to}`
      );
    }

    // update original snapshot to match saved state
    Object.assign(original, form);

    // refresh store from DB (keeps global state in sync)
    await accountStore.loadProfile(user.id);

    // clear password inputs after save
    password.current = '';
    password.new = '';
    password.confirm = '';

    alert('Settings saved');
  } catch (err) {
    console.error('SAVE ERROR:', err);
    alert(err.message || 'Failed to save settings');
  }
}

/**
 * Reverts form back to last saved values
 * Also clears password inputs
 */
function discardChanges() {
  Object.assign(form, original);

  password.current = '';
  password.new = '';
  password.confirm = '';
}
</script>

<template>
  <div class="settings container py-5">

    <h1 class="title">Settings</h1>

    <!-- PROFILE -->
    <section class="box">
      <h2 class="subtitle">Profile</h2>

      <div class="field">
        <label class="label">Username</label>
        <input class="input" v-model="form.username" />
      </div>

      <div class="field">
        <label class="label">Email</label>
        <input class="input" v-model="form.email" />
      </div>
    </section>

    <!-- PASSWORD -->
    <section class="box">
      <h2 class="subtitle">Change Password</h2>

      <input class="input mb-2" type="password" placeholder="Current password" v-model="password.current" />
      <input class="input mb-2" type="password" placeholder="New password" v-model="password.new" />
      <input class="input" type="password" placeholder="Confirm password" v-model="password.confirm" />
    </section>

    <!-- ACTIONS -->
    <div class="is-flex is-justify-content-flex-end mt-5" style="gap: 10px;">

        <button
            class="button is-danger"
            @click="deleteAccount"
        >Delete Account</button>

      <button
        class="button"
        @click="discardChanges"
        :disabled="!hasChanges"
      >Discard</button>

      <button
        class="button is-active"
        @click="saveSettings"
        :disabled="!hasChanges"
      >Save Changes</button>

    </div>

  </div>
</template>

<style scoped>
.settings {
  max-width: 700px;
}

.is-active {
  background-color: #84da8a; /* Tailwind's green-400 */
  color: white;
}
</style>
