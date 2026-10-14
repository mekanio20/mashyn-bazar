<script setup lang="ts">
import { computed, reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import BottomSheet from './BottomSheet.vue';
import BaseSelect from './BaseSelect.vue';
import { brands, models, years } from '../stores/catalog';
import { filters, resetFilters } from '../stores/cars';
import { BODY_TYPES, CONDITIONS, STATUSES, TRANSMISSIONS } from '../types';

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ close: [] }>();
const { t } = useI18n();

const d = reactive({ ...filters });
watch(() => props.open, (o) => o && Object.assign(d, filters));

const brandOptions = computed(() => brands.value.map((b) => ({ id: b.id!, label: b.name })));
const modelOptions = computed(() =>
  models.value.filter((m) => !d.brandId || m.brandId === d.brandId).map((m) => ({ id: m.id!, label: m.name })),
);
const yearOptions = computed(() => years.value.map((y) => ({ id: y, label: String(y) })));

function onBrand(id: number | null) {
  d.brandId = id;
  if (d.modelId && !models.value.some((m) => m.id === d.modelId && (!id || m.brandId === id))) d.modelId = null;
}
const num = (v: unknown) => (v === '' || v == null ? null : Number(v));

function apply() {
  d.kmFrom = num(d.kmFrom);
  d.kmTo = num(d.kmTo);
  Object.assign(filters, d);
  emit('close');
}
function reset() {
  resetFilters();
  Object.assign(d, filters);
  emit('close');
}

const input = 'h-12 w-full rounded-lg border border-slate-300 bg-white px-3 outline-none focus:border-indigo-500';
const lbl = 'mb-1 block text-sm font-medium text-slate-700';
</script>

<template>
  <BottomSheet :open="open" :title="t('filter')" @close="emit('close')">
    <div class="space-y-3">
      <BaseSelect :model-value="d.brandId" :options="brandOptions" :label="t('fields.brand')" :placeholder="t('select.all')" clearable @update:model-value="onBrand" />
      <BaseSelect v-model="d.modelId" :options="modelOptions" :label="t('fields.model')" :placeholder="t('select.all')" clearable />
      <div class="grid grid-cols-2 gap-2">
        <BaseSelect v-model="d.yearFrom" :options="yearOptions" :label="t('fields.yearFrom')" :placeholder="t('select.all')" clearable />
        <BaseSelect v-model="d.yearTo" :options="yearOptions" :label="t('fields.yearTo')" :placeholder="t('select.all')" clearable />
      </div>
      <div class="grid grid-cols-2 gap-2">
        <div><label :class="lbl">{{ t('fields.kmFrom') }}</label><input v-model="d.kmFrom" inputmode="numeric" :class="input" /></div>
        <div><label :class="lbl">{{ t('fields.kmTo') }}</label><input v-model="d.kmTo" inputmode="numeric" :class="input" /></div>
      </div>
      <div>
        <label :class="lbl">{{ t('fields.transmission') }}</label>
        <select v-model="d.transmission" :class="input"><option value="">{{ t('select.all') }}</option><option v-for="o in TRANSMISSIONS" :key="o" :value="o">{{ t(`enum.transmission.${o}`) }}</option></select>
      </div>
      <div>
        <label :class="lbl">{{ t('fields.bodyType') }}</label>
        <select v-model="d.bodyType" :class="input"><option value="">{{ t('select.all') }}</option><option v-for="o in BODY_TYPES" :key="o" :value="o">{{ t(`enum.bodyType.${o}`) }}</option></select>
      </div>
      <div>
        <label :class="lbl">{{ t('fields.condition') }}</label>
        <select v-model="d.condition" :class="input"><option value="">{{ t('select.all') }}</option><option v-for="o in CONDITIONS" :key="o" :value="o">{{ t(`enum.condition.${o}`) }}</option></select>
      </div>
      <div>
        <label :class="lbl">{{ t('fields.status') }}</label>
        <select v-model="d.status" :class="input"><option value="">{{ t('select.all') }}</option><option v-for="o in STATUSES" :key="o" :value="o">{{ t(`enum.status.${o}`) }}</option></select>
      </div>
    </div>
    <template #footer>
      <div class="grid grid-cols-2 gap-2">
        <button class="h-12 rounded-lg bg-slate-200 font-medium text-slate-800 active:bg-slate-300" @click="reset">{{ t('actions.reset') }}</button>
        <button class="h-12 rounded-lg bg-indigo-600 font-medium text-white active:bg-indigo-700" @click="apply">{{ t('actions.apply') }}</button>
      </div>
    </template>
  </BottomSheet>
</template>
