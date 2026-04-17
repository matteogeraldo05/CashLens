<script setup>
import { reactive, computed } from 'vue';
import { useAccountStore } from '../../lib/stores';
import { supabase } from '../../lib/supabase';

const accountStore = useAccountStore();

/**
 * Snapshot of current DB values
 * Used to compare changes + reset form
 */
const original = reactive({
  username: accountStore?.username || '',
  email: accountStore.profile?.email || '',
  currency: accountStore.profile?.currency || 'CAD'
});

/**
 * Editable form state (what user changes in UI)
 */
const form = reactive({ ...original });

/**
 * Password fields are separate because they are optional
 */
const password = reactive({
  current: '',
  new: '',
  confirm: ''
});

/**
 * Determines whether user has unsaved changes
 * Includes both profile edits + password edits
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
 * Soft delete account (disable instead of removing data)
 * Keeps user record but prevents access
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

    await accountStore.logout();
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
}

/**
 * Save all profile + auth changes
 * Handles:
 * - profile updates (username/email/currency)
 * - auth email update
 * - password update
 */
async function saveSettings() {
  try {
    const user = accountStore.user;
    if (!user) throw new Error('Not logged in');

    // update profile table
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        username: form.username,
        email: form.email,
        currency: form.currency
      })
      .eq('id', user.id);

    if (profileError) throw profileError;

    // sync email with Supabase Auth if changed
    if (form.email !== original.email) {
      const { error: emailError } = await supabase.auth.updateUser({
        email: form.email
      });

      if (emailError) throw emailError;
    }

    // update password if provided
    if (password.new) {
      if (password.new !== password.confirm) {
        throw new Error('Passwords do not match');
      }

      const { error: passError } = await supabase.auth.updateUser({
        password: password.new
      });

      if (passError) throw passError;
    }

    // refresh baseline state after successful save
    Object.assign(original, form);

    // clear password inputs
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
 * Revert form back to last saved state
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