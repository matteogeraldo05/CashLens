<script setup>
// Dashboard view shown after login: displays account identity and exposes logout.
import { storeToRefs } from 'pinia';
import { useAccountStore } from '../lib/stores';

const accountStore = useAccountStore();
const { username } = storeToRefs(accountStore);
</script>

<template>
  <p>Hi {{ username }}</p>
  <button class="button" @click="accountStore.logout()">Logout</button>
  <button class="button" @click="$router.push('/analytics')">Analytics</button>
</template>
