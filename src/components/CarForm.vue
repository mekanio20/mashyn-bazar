<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import BaseSelect from './BaseSelect.vue';
import CellPicker from './CellPicker.vue';
import { addBrand, addModel, addYear, brands, models, years } from '../stores/catalog';
import { plateTaken, saveCar } from '../stores/cars';
import { cellExists } from '../stores/grid';
import { useBackLayer } from '../nav';
import { ui } from '../stores/ui';
import { BODY_TYPES, CONDITIONS, STATUSES, TRANSMISSIONS, type Car } from '../types';

const { t } = useI18n();
const emit = defineEmits<{ close: [] }>();
useBackLayer(() => true, () => emit('close'));
const car: Car | null = ui.editing;

const f = reactive({
  brandId: car?.brandId ?? (null as number | null),
  modelId: car?.modelId ?? (null as number | null),
  year: car?.year ?? (null as number | null),
  cellId: (car?.cellId ?? ui.presetCell) as string | null,
  status: car?.status ?? 'available',
  mileage: car?.mileage != null ? String(car.mileage) : '',
  transmission: car?.transmission ?? '',
  bodyType: car?.bodyType ?? '',
  condition: car?.condition ?? '',
  plate: car?.plate ?? '',
  color: car?.color ?? '',
  ownerName: car?.ownerName ?? '',
  ownerPhone: car?.ownerPhone ?? '',
  note: car?.note ?? '',
});
if (f.cellId && !cellExists(f.cellId)) f.cellId = null;

const more = ref(!!car);
const tried = ref(false);

const brandOptions = computed(() => brands.value.map((b) => ({ id: b.id!, label: b.name })));
const modelOptions = computed(() =>
  models.value.filter((m) => m.brandId === f.brandId).map((m) => ({ id: m.id!, label: m.name })),
);
const yearOptions = computed(() => years.value.map((y) => ({ id: y, label: String(y) })));

const errors = computed(() => ({
  brand: !f.brandId ? t('form.required') : '',
  model: !f.modelId ? t('form.required') : '',
  year: !f.year ? t('form.required') : '',
  cell: !f.cellId ? t('form.required') : '',
  plate: plateTaken(f.plate, car?.id) ? t('form.plateTaken') : '',
}));
const show = (k: keyof typeof errors.value) => (tried.value ? errors.value[k] : '');

function onBrand(id: number | null) {
  if (id !== f.brandId) f.modelId = null;
  f.brandId = id;
}

async function createBrand(name: string) {
  onBrand(await addBrand(name));
}
async function createModel(name: string) {
  if (f.brandId) f.modelId = await addModel(f.brandId, name);
}
async function createYear(text: string) {
  const y = await addYear(text);
  if (y) f.year = y;
}

async function submit() {
  tried.value = true;
  if (Object.values(errors.value).some(Boolean)) return;
  const km = f.mileage.trim() === '' ? undefined : Number(f.mileage);
  await saveCar(
    {
      brandId: f.brandId!, modelId: f.modelId!, year: f.year!, cellId: f.cellId, status: f.status,
      mileage: Number.isFinite(km) ? km : undefined,
      transmission: (f.transmission || undefined) as Car['transmission'],
      bodyType: (f.bodyType || undefined) as Car['bodyType'],
      condition: (f.condition || undefined) as Car['condition'],
      plate: f.plate.trim() || undefined,
      color: f.color.trim() || undefined,
      ownerName: f.ownerName.trim() || undefined,
      ownerPhone: f.ownerPhone.trim() || undefined,
      note: f.note.trim() || undefined,
    },
    car,
  );
  emit('close');
}

const input = 'h-12 w-full rounded-lg border border-slate-300 bg-white px-3 outline-none focus:border-indigo-500';
const lbl = 'mb-1 block text-sm font-medium text-slate-700';
</script>

<template>
  <div class="fixed inset-0 z-30 flex flex-col bg-slate-50">
    <header class="flex items-center gap-2 bg-indigo-600 px-2 py-2 text-white" style="padding-top: calc(0.5rem + env(safe-area-inset-top))">
      <button class="h-11 w-11 rounded-full text-2xl active:bg-white/20" :aria-label="t('actions.back')" @click="emit('close')">←</button>
      <h1 class="text-lg font-semibold">{{ car ? t('form.editTitle') : t('form.newTitle') }}</h1>
    </header>

    <form id="car-form" class="flex-1 space-y-4 overflow-y-auto p-4" @submit.prevent="submit">
      <BaseSelect
        :model-value="f.brandId" :options="brandOptions" :label="t('fields.brand')" :placeholder="t('form.selectBrand')"
        allow-create :error="show('brand')" @update:model-value="onBrand" @create="createBrand"
      />
      <BaseSelect
        v-model="f.modelId" :options="modelOptions" :label="t('fields.model')"
        :placeholder="f.brandId ? t('form.selectModel') : t('form.selectBrandFirst')"
        allow-create :disabled="!f.brandId" :error="show('model')" @create="createModel"
      />
      <BaseSelect
        v-model="f.year" :options="yearOptions" :label="t('fields.year')" :placeholder="t('form.selectYear')"
        allow-create numeric :error="show('year')" @create="createYear"
      />
      <CellPicker v-model="f.cellId" :label="t('fields.cell')" :error="show('cell')" />

      <div>
        <label :class="lbl">{{ t('fields.status') }}</label>
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="s in STATUSES" :key="s" type="button" class="h-12 rounded-lg border text-sm"
            :class="f.status === s ? 'border-indigo-600 bg-indigo-600 font-medium text-white' : 'border-slate-300 bg-white text-slate-700'"
            @click="f.status = s"
          >{{ t(`enum.status.${s}`) }}</button>
        </div>
      </div>

      <button type="button" class="flex h-12 w-full items-center justify-between rounded-lg bg-slate-200 px-3 font-medium text-slate-700" @click="more = !more">
        {{ t('form.more') }}<span>{{ more ? '▴' : '▾' }}</span>
      </button>

      <div v-show="more" class="space-y-4">
        <div><label :class="lbl">{{ t('fields.mileage') }}</label><input v-model="f.mileage" inputmode="numeric" :class="input" /></div>
        <div>
          <label :class="lbl">{{ t('fields.transmission') }}</label>
          <select v-model="f.transmission" :class="input"><option value=""></option><option v-for="o in TRANSMISSIONS" :key="o" :value="o">{{ t(`enum.transmission.${o}`) }}</option></select>
        </div>
        <div>
          <label :class="lbl">{{ t('fields.bodyType') }}</label>
          <select v-model="f.bodyType" :class="input"><option value=""></option><option v-for="o in BODY_TYPES" :key="o" :value="o">{{ t(`enum.bodyType.${o}`) }}</option></select>
        </div>
        <div>
          <label :class="lbl">{{ t('fields.condition') }}</label>
          <select v-model="f.condition" :class="input"><option value=""></option><option v-for="o in CONDITIONS" :key="o" :value="o">{{ t(`enum.condition.${o}`) }}</option></select>
        </div>
        <div>
          <label :class="lbl">{{ t('fields.plate') }}</label>
          <input v-model="f.plate" :class="[input, errors.plate ? 'border-red-500' : '']" />
          <p v-if="errors.plate" class="mt-1 text-sm text-red-600">{{ errors.plate }}</p>
        </div>
        <div><label :class="lbl">{{ t('fields.color') }}</label><input v-model="f.color" :class="input" /></div>
        <div><label :class="lbl">{{ t('fields.ownerName') }}</label><input v-model="f.ownerName" :class="input" /></div>
        <div><label :class="lbl">{{ t('fields.ownerPhone') }}</label><input v-model="f.ownerPhone" type="tel" :class="input" /></div>
        <div><label :class="lbl">{{ t('fields.note') }}</label><textarea v-model="f.note" rows="3" :class="input + ' h-auto py-2'"></textarea></div>
      </div>
    </form>

    <div class="border-t border-slate-200 bg-white p-3" style="padding-bottom: calc(0.75rem + env(safe-area-inset-bottom))">
      <button type="submit" form="car-form" class="h-12 w-full rounded-lg bg-indigo-600 text-base font-medium text-white active:bg-indigo-700">{{ t('actions.save') }}</button>
    </div>
  </div>
</template>
