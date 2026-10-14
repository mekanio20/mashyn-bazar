<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { Status } from '../types';
defineProps<{ status: Status }>();
const { t } = useI18n();
const color: Record<Status, string> = {
  available: 'bg-green-100 text-green-700',
  reserved: 'bg-amber-100 text-amber-700',
  sold: 'bg-slate-200 text-slate-600',
};
</script>

<template>
  <span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="color[status]">{{ t(`enum.status.${status}`) }}</span>
</template>
