<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import SubPage from './SubPage.vue';
import BaseSelect from './BaseSelect.vue';
import NameSheet from './NameSheet.vue';
import { brandUsage, modelUsage } from '../stores/cars';
import {
  addBrand, addModel, addYear, brands, models, removeBrand, removeModel, removeYear, renameBrand, renameModel, years,
} from '../stores/catalog';

defineEmits<{ back: [] }>();
const { t } = useI18n();

const page = ref<'' | 'brands' | 'models' | 'years'>('');
const brandId = ref<number | null>(null);
// sheet: null = kapalı, id = null → yeni kayıt
const sheet = ref<{ id: number | null } | null>(null);

const brandOptions = computed(() => brands.value.map((b) => ({ id: b.id!, label: b.name })));
const currentBrand = computed(() => brandId.value ?? brands.value[0]?.id ?? null);
const brandModels = computed(() => models.value.filter((m) => m.brandId === currentBrand.value));
const customYears = computed(() => {
  const cur = new Date().getFullYear();
  return years.value.filter((y) => y > cur + 1 || y < cur - 40);
});

const cards = computed(() => [
  { id: 'brands' as const, icon: '🏷️', title: t('catalog.brands'), count: brands.value.length },
  { id: 'models' as const, icon: '🚘', title: t('catalog.models'), count: models.value.length },
  { id: 'years' as const, icon: '📅', title: t('catalog.years'), count: customYears.value.length },
]);

const sheetValue = computed(() => {
  const id = sheet.value?.id;
  if (id == null) return '';
  if (page.value === 'brands') return brands.value.find((b) => b.id === id)?.name ?? '';
  if (page.value === 'models') return models.value.find((m) => m.id === id)?.name ?? '';
  return String(id);
});
const sheetTitle = computed(() => {
  const add = sheet.value?.id == null;
  if (page.value === 'brands') return add ? t('catalog.addBrand') : t('fields.brand');
  if (page.value === 'models') return add ? t('catalog.addModel') : t('fields.model');
  return t('catalog.addYear');
});

async function onSave(text: string) {
  const id = sheet.value?.id ?? null;
  if (page.value === 'brands') {
    if (id == null) brandId.value = await addBrand(text);
    else await renameBrand(brands.value.find((b) => b.id === id)!, text);
  } else if (page.value === 'models') {
    if (id == null) {
      if (currentBrand.value) await addModel(currentBrand.value, text);
    } else await renameModel(models.value.find((m) => m.id === id)!, text);
  } else {
    await addYear(text);
  }
  sheet.value = null;
}

async function onDelete() {
  const id = sheet.value?.id;
  if (id == null) return;
  if (page.value === 'brands') {
    const ids = models.value.filter((m) => m.brandId === id).map((m) => m.id!);
    const n = brandUsage(id) + ids.reduce((s, m) => s + modelUsage(m), 0);
    if (n) return alert(t('catalog.inUse', { n }));
    if (!confirm(t('catalog.confirmDelete'))) return;
    await removeBrand(id);
    if (brandId.value === id) brandId.value = null;
  } else if (page.value === 'models') {
    const n = modelUsage(id);
    if (n) return alert(t('catalog.inUse', { n }));
    if (!confirm(t('catalog.confirmDelete'))) return;
    await removeModel(id);
  } else {
    await removeYear(id);
  }
  sheet.value = null;
}

const row = 'flex h-14 w-full items-center justify-between rounded-xl bg-white px-4 text-left shadow-sm active:bg-slate-50';
const addBtn = 'h-12 w-full rounded-lg bg-indigo-600 font-medium text-white active:bg-indigo-700';
</script>

<template>
  <SubPage :title="t('catalog.title')" @back="$emit('back')">
    <div class="space-y-3">
      <button v-for="c in cards" :key="c.id" class="flex h-24 w-full items-center gap-4 rounded-2xl bg-white px-5 text-left shadow-sm active:bg-slate-50" @click="page = c.id">
        <span class="text-4xl">{{ c.icon }}</span>
        <span class="flex-1">
          <span class="block text-lg font-semibold text-slate-900">{{ c.title }}</span>
          <span class="text-slate-500">{{ c.count }}</span>
        </span>
        <span class="text-2xl text-slate-400">›</span>
      </button>
    </div>
  </SubPage>

  <SubPage v-if="page" :title="cards.find((c) => c.id === page)?.title ?? ''" @back="page = ''">
    <div class="space-y-3">
      <template v-if="page === 'brands'">
        <button :class="addBtn" @click="sheet = { id: null }">+ {{ t('catalog.addBrand') }}</button>
        <button v-for="b in brands" :key="b.id" :class="row" @click="sheet = { id: b.id! }">
          {{ b.name }}<span class="text-sm text-slate-400">{{ models.filter((m) => m.brandId === b.id).length }} ›</span>
        </button>
      </template>

      <template v-else-if="page === 'models'">
        <BaseSelect v-model="brandId" :options="brandOptions" :label="t('fields.brand')" :placeholder="brandOptions[0]?.label ?? t('form.selectBrand')" />
        <button v-if="currentBrand" :class="addBtn" @click="sheet = { id: null }">+ {{ t('catalog.addModel') }}</button>
        <p v-if="!brandModels.length" class="py-4 text-center text-slate-400">{{ t('catalog.noModels') }}</p>
        <button v-for="m in brandModels" :key="m.id" :class="row" @click="sheet = { id: m.id! }">{{ m.name }}<span class="text-slate-400">›</span></button>
      </template>

      <template v-else>
        <button :class="addBtn" @click="sheet = { id: null }">+ {{ t('catalog.addYear') }}</button>
        <button v-for="y in customYears" :key="y" :class="row" @click="sheet = { id: y }">{{ y }}<span class="text-slate-400">›</span></button>
      </template>
    </div>
  </SubPage>

  <NameSheet
    :open="!!sheet" :title="sheetTitle" :value="sheetValue" :can-delete="sheet?.id != null"
    :numeric="page === 'years'" @close="sheet = null" @save="onSave" @delete="onDelete"
  />
</template>
