<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import BottomSheet from './BottomSheet.vue';
import StatusBadge from './StatusBadge.vue';
import { cars, carTitle, removeCar } from '../stores/cars';
import { cellName } from '../stores/grid';
import { openForm, showOnMap, ui } from '../stores/ui';

const { t } = useI18n();
const car = computed(() => cars.value.find((c) => c.id === ui.detailId) ?? null);
const close = () => (ui.detailId = null);

const rows = computed(() => {
  const c = car.value;
  if (!c) return [];
  const e = (k: string, v?: string) => (v ? t(`enum.${k}.${v}`) : '');
  return [
    [t('fields.cell'), cellName(c.cellId) || t('map.noPlace')],
    [t('fields.mileage'), c.mileage != null ? c.mileage.toLocaleString('ru-RU') : ''],
    [t('fields.transmission'), e('transmission', c.transmission)],
    [t('fields.bodyType'), e('bodyType', c.bodyType)],
    [t('fields.condition'), e('condition', c.condition)],
    [t('fields.plate'), c.plate ?? ''],
    [t('fields.color'), c.color ?? ''],
    [t('fields.ownerName'), c.ownerName ?? ''],
    [t('fields.ownerPhone'), c.ownerPhone ?? ''],
    [t('fields.note'), c.note ?? ''],
  ].filter(([, v]) => v);
});

function edit() {
  const c = car.value!;
  close();
  openForm(c);
}
async function del() {
  if (!confirm(t('actions.confirmDelete'))) return;
  await removeCar(car.value!.id!);
  close();
}
</script>

<template>
  <BottomSheet :open="!!car" :title="car ? carTitle(car) : ''" @close="close">
    <template v-if="car">
      <div class="mb-3"><StatusBadge :status="car.status" /></div>
      <dl class="divide-y divide-slate-100">
        <div v-for="[k, v] in rows" :key="k" class="flex justify-between gap-4 py-2">
          <dt class="text-slate-500">{{ k }}</dt>
          <dd class="text-right font-medium text-slate-900">{{ v }}</dd>
        </div>
      </dl>
      <div class="mt-4 grid grid-cols-2 gap-2">
        <a v-if="car.ownerPhone" :href="`tel:${car.ownerPhone}`" class="flex h-12 items-center justify-center rounded-lg bg-green-600 font-medium text-white active:bg-green-700">📞 {{ t('actions.call') }}</a>
        <button v-if="car.cellId" class="h-12 rounded-lg bg-indigo-100 font-medium text-indigo-700 active:bg-indigo-200" @click="showOnMap(car.cellId)">{{ t('actions.showOnMap') }}</button>
        <button class="h-12 rounded-lg bg-slate-200 font-medium text-slate-800 active:bg-slate-300" @click="edit">{{ t('actions.edit') }}</button>
        <button class="h-12 rounded-lg bg-red-100 font-medium text-red-700 active:bg-red-200" @click="del">{{ t('actions.delete') }}</button>
      </div>
    </template>
  </BottomSheet>
</template>
