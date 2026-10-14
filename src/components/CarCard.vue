<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { Car } from '../types';
import { carTitle } from '../stores/cars';
import { cellName } from '../stores/grid';
import StatusBadge from './StatusBadge.vue';

defineProps<{ car: Car }>();
const { t } = useI18n();
</script>

<template>
  <button class="flex w-full items-center gap-3 rounded-xl bg-white p-3 text-left shadow-sm active:bg-slate-50">
    <div class="min-w-0 flex-1">
      <div class="truncate font-semibold text-slate-900">{{ carTitle(car) }}</div>
      <div class="mt-0.5 truncate text-sm text-slate-500">
        <span v-if="car.mileage != null">{{ car.mileage.toLocaleString('ru-RU') }} km</span>
        <span v-if="car.plate"> · {{ car.plate }}</span>
        <span v-if="car.color"> · {{ car.color }}</span>
      </div>
      <div class="mt-1"><StatusBadge :status="car.status" /></div>
    </div>
    <div class="shrink-0 rounded-lg bg-indigo-50 px-3 py-2 text-center text-indigo-700">
      <div class="text-lg font-bold leading-none">{{ cellName(car.cellId) || '—' }}</div>
      <div class="mt-1 text-[10px] uppercase">{{ t('fields.cell').split(' ')[0] }}</div>
    </div>
  </button>
</template>
