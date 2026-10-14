<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import SubPage from './SubPage.vue';
import BaseSelect from './BaseSelect.vue';
import { brandUsage, modelUsage } from '../stores/cars';
import {
  addBrand, addModel, addYear, brands, models, removeBrand, removeModel, removeYear, renameBrand, renameModel, years,
} from '../stores/catalog';

defineEmits<{ back: [] }>();
const { t } = useI18n();

const brandId = ref<number | null>(null);
const brandOptions = computed(() => brands.value.map((b) => ({ id: b.id!, label: b.name })));
const brandModels = computed(() => models.value.filter((m) => m.brandId === brandId.value));

const newBrand = ref('');
const newModel = ref('');
const newYear = ref('');
const customYears = computed(() => years.value.filter((y) => !isDefault(y)));
const isDefault = (y: number) => {
  const cur = new Date().getFullYear();
  return y <= cur + 1 && y >= cur - 40;
};

async function delBrand(id: number) {
  const inModels = models.value.filter((m) => m.brandId === id).map((m) => m.id!);
  const n = brandUsage(id) + inModels.reduce((s, m) => s + modelUsage(m), 0);
  if (n) return alert(t('catalog.inUse', { n }));
  if (!confirm(t('catalog.confirmDelete'))) return;
  await removeBrand(id);
  if (brandId.value === id) brandId.value = null;
}
async function delModel(id: number) {
  const n = modelUsage(id);
  if (n) return alert(t('catalog.inUse', { n }));
  if (confirm(t('catalog.confirmDelete'))) await removeModel(id);
}
async function submitBrand() {
  if (!newBrand.value.trim()) return;
  brandId.value = await addBrand(newBrand.value);
  newBrand.value = '';
}
async function submitModel() {
  if (!newModel.value.trim() || !brandId.value) return;
  await addModel(brandId.value, newModel.value);
  newModel.value = '';
}
async function submitYear() {
  await addYear(newYear.value);
  newYear.value = '';
}
const input = 'h-11 min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 outline-none focus:border-indigo-500';
const addBtn = 'h-11 shrink-0 rounded-lg bg-indigo-600 px-4 font-medium text-white active:bg-indigo-700';
</script>

<template>
  <SubPage :title="t('catalog.title')" @back="$emit('back')">
    <div class="space-y-6">
      <section>
        <h2 class="mb-2 font-semibold text-slate-800">{{ t('catalog.brands') }}</h2>
        <form class="mb-2 flex gap-2" @submit.prevent="submitBrand">
          <input v-model="newBrand" :placeholder="t('catalog.addBrand')" :class="input" /><button :class="addBtn">+</button>
        </form>
        <div class="space-y-2">
          <div v-for="b in brands" :key="b.id" class="flex gap-2">
            <input :value="b.name" :class="input" @change="renameBrand(b, ($event.target as HTMLInputElement).value)" />
            <button class="h-11 w-11 rounded-lg bg-red-100 text-red-700 active:bg-red-200" @click="delBrand(b.id!)">🗑</button>
          </div>
        </div>
      </section>

      <section>
        <h2 class="mb-2 font-semibold text-slate-800">{{ t('catalog.models') }}</h2>
        <BaseSelect v-model="brandId" :options="brandOptions" :label="t('fields.brand')" :placeholder="t('form.selectBrand')" />
        <template v-if="brandId">
          <form class="my-2 flex gap-2" @submit.prevent="submitModel">
            <input v-model="newModel" :placeholder="t('catalog.addModel')" :class="input" /><button :class="addBtn">+</button>
          </form>
          <p v-if="!brandModels.length" class="text-slate-400">{{ t('catalog.noModels') }}</p>
          <div class="space-y-2">
            <div v-for="m in brandModels" :key="m.id" class="flex gap-2">
              <input :value="m.name" :class="input" @change="renameModel(m, ($event.target as HTMLInputElement).value)" />
              <button class="h-11 w-11 rounded-lg bg-red-100 text-red-700 active:bg-red-200" @click="delModel(m.id!)">🗑</button>
            </div>
          </div>
        </template>
      </section>

      <section>
        <h2 class="mb-2 font-semibold text-slate-800">{{ t('catalog.years') }}</h2>
        <form class="mb-2 flex gap-2" @submit.prevent="submitYear">
          <input v-model="newYear" inputmode="numeric" :placeholder="t('catalog.addYear')" :class="input" /><button :class="addBtn">+</button>
        </form>
        <div class="flex flex-wrap gap-2">
          <button v-for="y in customYears" :key="y" class="rounded-full bg-slate-200 px-3 py-1 text-slate-700" @click="removeYear(y)">{{ y }} ×</button>
        </div>
      </section>
    </div>
  </SubPage>
</template>
