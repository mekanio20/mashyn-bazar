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
      <button class="h-11 w-11 rounded-full text-2xl active:bg-white/20" :aria-label="t('actions.back')" @click="$emit('back')">←</button>
      <h1 class="text-lg font-semibold">{{ title }}</h1>
    </header>
    <div class="flex-1 overflow-y-auto p-4" style="padding-bottom: calc(1rem + env(safe-area-inset-bottom))"><slot /></div>
  </div>
</template>
