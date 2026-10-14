<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { accessActive, daysLeft } from '../access';

defineProps<{ title: string; showAdd?: boolean }>();
defineEmits<{ add: [] }>();
const { t } = useI18n();
</script>

<template>
  <header class="sticky top-0 z-10 bg-indigo-600 text-white shadow">
    <div class="flex h-14 items-center justify-between px-4">
      <h1 class="text-lg font-semibold">{{ title }}</h1>
      <button v-if="showAdd" class="flex h-10 items-center gap-1 rounded-xl bg-white px-4 font-medium text-indigo-700 active:bg-indigo-50" @click="$emit('add')">
        <span class="text-xl leading-none">+</span> {{ t('addCar') }}
      </button>
    </div>
    <div v-if="accessActive && daysLeft <= 5" class="bg-amber-400 px-4 py-1 text-center text-sm font-medium text-amber-950">{{ t('warn.expiring', { n: daysLeft }) }}</div>
  </header>
</template>
