<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { useBackLayer } from '../nav';

defineProps<{ title: string }>();
const emit = defineEmits<{ back: [] }>();
useBackLayer(() => true, () => emit('back'));
const { t } = useI18n();
</script>

<template>
  <div class="fixed inset-0 z-30 flex flex-col bg-slate-50">
    <header class="flex items-center gap-2 bg-indigo-600 px-2 py-2 text-white" style="padding-top: calc(0.5rem + env(safe-area-inset-top))">
      <button class="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 active:bg-white/30" :aria-label="t('actions.back')" @click="$emit('back')"><svg viewBox="0 0 24 24" class="h-7 w-7" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M12 5l-7 7 7 7" /></svg></button>
      <h1 class="text-lg font-semibold">{{ title }}</h1>
    </header>
    <div class="flex-1 overflow-y-auto p-4" style="padding-bottom: calc(1rem + env(safe-area-inset-bottom))"><slot /></div>
  </div>
</template>
