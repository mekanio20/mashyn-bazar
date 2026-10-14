<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import CarCard from '../components/CarCard.vue';
import FilterSheet from '../components/FilterSheet.vue';
import QuickFilter from '../components/QuickFilter.vue';
import { activeFilterCount, cars, filters, resetFilters, visibleCars } from '../stores/cars';
import { brandName, brands, modelName, models, years } from '../stores/catalog';
import { ui } from '../stores/ui';

const { t } = useI18n();
const filterOpen = ref(false);

const brandOptions = computed(() => brands.value.map((b) => ({ id: b.id!, label: b.name })));
const modelOptions = computed(() =>
  models.value.filter((m) => !filters.brandId || m.brandId === filters.brandId).map((m) => ({ id: m.id!, label: m.name })),
);
const yearOptions = computed(() => years.value.map((y) => ({ id: y, label: String(y) })));
const yearValue = computed(() => (filters.yearFrom && filters.yearFrom === filters.yearTo ? filters.yearFrom : null));

function setBrand(id: number | null) {
  filters.brandId = id;
  if (filters.modelId && !models.value.some((m) => m.id === filters.modelId && (!id || m.brandId === id))) filters.modelId = null;
}
function setYear(y: number | null) {
  filters.yearFrom = y;
  filters.yearTo = y;
}

function chips() {
  const f = filters;
  const out: { label: string; clear: () => void }[] = [];
  const add = (label: string, clear: () => void) => out.push({ label, clear });
  if (f.brandId) add(brandName(f.brandId), () => ((f.brandId = null), (f.modelId = null)));
  if (f.modelId) add(modelName(f.modelId), () => (f.modelId = null));
  if (f.yearFrom && f.yearFrom === f.yearTo) add(`${t('fields.year')}: ${f.yearFrom}`, () => ((f.yearFrom = null), (f.yearTo = null)));
  else {
    if (f.yearFrom) add(`${t('fields.year')} ≥ ${f.yearFrom}`, () => (f.yearFrom = null));
    if (f.yearTo) add(`${t('fields.year')} ≤ ${f.yearTo}`, () => (f.yearTo = null));
  }
  if (f.kmFrom != null) add(`km ≥ ${f.kmFrom}`, () => (f.kmFrom = null));
  if (f.kmTo != null) add(`km ≤ ${f.kmTo}`, () => (f.kmTo = null));
  for (const k of ['transmission', 'bodyType', 'condition', 'status'] as const)
    if (f[k]) add(t(`enum.${k}.${f[k]}`), () => (f[k] = ''));
  return out;
}
</script>

<template>
  <div class="space-y-3 p-4 pb-24">
    <div class="grid grid-cols-[1fr_1fr_1fr_auto] gap-2">
      <QuickFilter :model-value="filters.brandId" :options="brandOptions" icon="🏷️" :label="t('fields.brand')" @update:model-value="setBrand" />
      <QuickFilter v-model="filters.modelId" :options="modelOptions" icon="🚘" :label="t('fields.model')" />
      <QuickFilter :model-value="yearValue" :options="yearOptions" icon="📅" :label="t('fields.year')" @update:model-value="setYear" />
      <button class="relative flex h-12 w-12 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm active:bg-slate-50" :aria-label="t('filter')" @click="filterOpen = true">
        <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 5h18l-7 8v6l-4 2v-8L3 5z" /></svg>
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
