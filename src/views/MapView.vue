<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import BottomSheet from '../components/BottomSheet.vue';
import CarCard from '../components/CarCard.vue';
import { cars, carsInCell } from '../stores/cars';
import { cellId, cellName, grid } from '../stores/grid';
import { openForm, ui } from '../stores/ui';

const { t } = useI18n();
const size = ref(56);
const openCell = ref<string | null>(null);

const counts = computed(() => {
  const m = new Map<string, number>();
  for (const c of cars.value) if (c.cellId) m.set(c.cellId, (m.get(c.cellId) ?? 0) + 1);
  return m;
});
const cellCars = computed(() => (openCell.value ? carsInCell(openCell.value) : []));

function cellClass(id: string) {
  const n = counts.value.get(id) ?? 0;
  if (ui.focusCell === id) return 'bg-amber-400 text-amber-950 ring-4 ring-amber-300 animate-pulse';
  return n ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500';
}

function addHere() {
  const id = openCell.value;
  openCell.value = null;
  openForm(null, id);
}

watch(() => ui.focusCell, async (id) => {
  if (!id) return;
  await nextTick();
  document.getElementById(`cell-${id}`)?.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' });
}, { immediate: true });
</script>

<template>
  <div class="space-y-3 p-4 pb-24">
    <div class="flex items-center justify-between">
      <p class="text-sm text-slate-500">{{ t('map.hint') }}</p>
      <div class="flex gap-1">
        <button class="h-10 w-10 rounded-lg bg-white text-xl shadow-sm active:bg-slate-50" :aria-label="t('map.zoomOut')" @click="size = Math.max(36, size - 8)">−</button>
        <button class="h-10 w-10 rounded-lg bg-white text-xl shadow-sm active:bg-slate-50" :aria-label="t('map.zoomIn')" @click="size = Math.min(112, size + 8)">+</button>
      </div>
    </div>

    <div class="overflow-auto rounded-xl bg-white p-2 shadow-sm">
      <table class="border-separate border-spacing-1">
        <thead>
          <tr>
            <th></th>
            <th v-for="c in grid.cols" :key="c.id" class="text-xs font-medium text-slate-400">{{ c.name }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in grid.rows" :key="r.id">
            <th class="pr-1 text-xs font-medium text-slate-400">{{ r.name }}</th>
            <td v-for="c in grid.cols" :key="c.id">
              <div v-if="grid.disabled.includes(cellId(r, c))" :style="{ width: size + 'px', height: size + 'px' }"></div>
              <button
                v-else
                :id="`cell-${cellId(r, c)}`"
                class="relative flex items-center justify-center rounded-lg font-semibold transition-colors"
                :class="cellClass(cellId(r, c))"
                :style="{ width: size + 'px', height: size + 'px', fontSize: Math.max(11, size / 4) + 'px' }"
                @click="openCell = cellId(r, c)"
              >
                {{ r.name }}{{ c.name }}
                <span v-if="counts.get(cellId(r, c))" class="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-700 px-1 text-xs text-white">{{ counts.get(cellId(r, c)) }}</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <BottomSheet :open="!!openCell" :title="`${cellName(openCell)} · ${cellCars.length} ${t('map.cars')}`" @close="openCell = null">
      <button class="mb-3 h-12 w-full rounded-lg bg-indigo-600 font-medium text-white active:bg-indigo-700" @click="addHere">+ {{ t('map.addHere') }}</button>
      <p v-if="!cellCars.length" class="py-4 text-center text-slate-400">{{ t('map.empty') }}</p>
      <div class="space-y-2">
        <CarCard v-for="c in cellCars" :key="c.id" :car="c" @click="(openCell = null), (ui.detailId = c.id!)" />
      </div>
    </BottomSheet>
  </div>
</template>
