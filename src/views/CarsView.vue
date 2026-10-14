<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import CarCard from '../components/CarCard.vue';
import FilterSheet from '../components/FilterSheet.vue';
import { activeFilterCount, cars, filters, resetFilters, visibleCars } from '../stores/cars';
import { brandName, modelName } from '../stores/catalog';
import { ui } from '../stores/ui';

const { t } = useI18n();
const filterOpen = ref(false);

function chips() {
  const f = filters;
  const out: { label: string; clear: () => void }[] = [];
  const add = (label: string, clear: () => void) => out.push({ label, clear });
  if (f.brandId) add(brandName(f.brandId), () => ((f.brandId = null), (f.modelId = null)));
  if (f.modelId) add(modelName(f.modelId), () => (f.modelId = null));
  if (f.yearFrom) add(`${t('fields.year')} ≥ ${f.yearFrom}`, () => (f.yearFrom = null));
  if (f.yearTo) add(`${t('fields.year')} ≤ ${f.yearTo}`, () => (f.yearTo = null));
  if (f.kmFrom != null) add(`km ≥ ${f.kmFrom}`, () => (f.kmFrom = null));
  if (f.kmTo != null) add(`km ≤ ${f.kmTo}`, () => (f.kmTo = null));
  for (const k of ['transmission', 'bodyType', 'condition', 'status'] as const)
    if (f[k]) add(t(`enum.${k}.${f[k]}`), () => (f[k] = ''));
  return out;
}
</script>

<template>
  <div class="space-y-3 p-4 pb-24">
    <div class="flex gap-2">
      <button class="relative h-12 w-full rounded-lg bg-white px-4 font-medium text-slate-700 shadow-sm active:bg-slate-50" @click="filterOpen = true">
        ⚙ {{ t('filter') }}
        <span v-if="activeFilterCount" class="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1 text-xs text-white">{{ activeFilterCount }}</span>
      </button>
    </div>

    <div v-if="activeFilterCount" class="flex flex-wrap gap-2">
      <button v-for="c in chips()" :key="c.label" class="rounded-full bg-indigo-100 px-3 py-1 text-sm text-indigo-700" @click="c.clear">{{ c.label }} ×</button>
      <button class="rounded-full px-3 py-1 text-sm text-slate-500 underline" @click="resetFilters">{{ t('actions.reset') }}</button>
    </div>

    <div v-if="!cars.length" class="py-16 text-center">
      <div class="text-5xl">🚗</div>
      <p class="mt-3 text-lg font-medium text-slate-700">{{ t('noCars') }}</p>
      <p class="mt-1 text-slate-500">{{ t('noCarsHint') }}</p>
    </div>
    <p v-else-if="!visibleCars.length" class="py-16 text-center text-slate-500">{{ t('noResults') }}</p>

    <CarCard v-for="c in visibleCars" :key="c.id" :car="c" @click="ui.detailId = c.id!" />

    <FilterSheet :open="filterOpen" @close="filterOpen = false" />
  </div>
</template>
