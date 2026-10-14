<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { ui } from '../stores/ui';

const { t } = useI18n();
const tabs = [
  { id: 'cars', icon: '🚗' },
  { id: 'map', icon: '🗺️' },
  { id: 'menu', icon: '☰' },
] as const;
</script>

<template>
  <nav class="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white" style="padding-bottom: env(safe-area-inset-bottom)">
    <div class="mx-auto flex max-w-xl">
      <button
        v-for="tab in tabs" :key="tab.id"
        class="flex h-16 flex-1 flex-col items-center justify-center gap-0.5 text-xs"
        :class="ui.tab === tab.id ? 'font-semibold text-indigo-600' : 'text-slate-500'"
        @click="ui.tab = tab.id"
      >
        <span class="text-2xl leading-none">{{ tab.icon }}</span>{{ t(`tabs.${tab.id}`) }}
      </button>
    </div>
  </nav>
</template>
