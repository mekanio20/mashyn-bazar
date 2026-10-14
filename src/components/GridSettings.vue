<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import SubPage from './SubPage.vue';
import { countWhere, unassign } from '../stores/cars';
import { addCol, addRow, cellId, grid, removeCol, removeRow, renameLine, toggleCell } from '../stores/grid';

defineEmits<{ back: [] }>();
const { t } = useI18n();

async function delRow(id: string) {
  const n = countWhere((c) => c.startsWith(`${id}-`));
  if (n && !confirm(t('grid.confirmRemove', { n }))) return;
  await unassign((c) => c.startsWith(`${id}-`));
  await removeRow(id);
}
async function delCol(id: string) {
  const n = countWhere((c) => c.endsWith(`-${id}`));
  if (n && !confirm(t('grid.confirmRemove', { n }))) return;
  await unassign((c) => c.endsWith(`-${id}`));
  await removeCol(id);
}
async function toggle(id: string) {
  if (!grid.value.disabled.includes(id)) {
    const n = countWhere((c) => c === id);
    if (n && !confirm(t('grid.confirmClose', { n }))) return;
    await unassign((c) => c === id);
  }
  await toggleCell(id);
}
const input = 'h-11 min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 outline-none focus:border-indigo-500';
</script>

<template>
  <SubPage :title="t('grid.title')" @back="$emit('back')">
    <div class="space-y-6">
      <section>
        <h2 class="mb-2 font-semibold text-slate-800">{{ t('grid.rows') }}</h2>
        <div class="space-y-2">
          <div v-for="r in grid.rows" :key="r.id" class="flex gap-2">
            <input :value="r.name" :class="input" @change="renameLine(r, ($event.target as HTMLInputElement).value)" />
            <button class="h-11 w-11 rounded-lg bg-red-100 text-red-700 active:bg-red-200" :disabled="grid.rows.length <= 1" @click="delRow(r.id)">🗑</button>
          </div>
        </div>
        <button class="mt-2 h-11 w-full rounded-lg bg-indigo-100 font-medium text-indigo-700 active:bg-indigo-200" @click="addRow">+ {{ t('grid.addRow') }}</button>
      </section>

      <section>
        <h2 class="mb-2 font-semibold text-slate-800">{{ t('grid.cols') }}</h2>
        <div class="space-y-2">
          <div v-for="c in grid.cols" :key="c.id" class="flex gap-2">
            <input :value="c.name" :class="input" @change="renameLine(c, ($event.target as HTMLInputElement).value)" />
            <button class="h-11 w-11 rounded-lg bg-red-100 text-red-700 active:bg-red-200" :disabled="grid.cols.length <= 1" @click="delCol(c.id)">🗑</button>
          </div>
        </div>
        <button class="mt-2 h-11 w-full rounded-lg bg-indigo-100 font-medium text-indigo-700 active:bg-indigo-200" @click="addCol">+ {{ t('grid.addCol') }}</button>
      </section>

      <section>
        <h2 class="mb-2 font-semibold text-slate-800">{{ t('grid.cells') }}</h2>
        <div class="overflow-x-auto rounded-lg bg-white p-2">
          <table class="border-separate border-spacing-1">
            <thead><tr><th></th><th v-for="c in grid.cols" :key="c.id" class="text-xs text-slate-400">{{ c.name }}</th></tr></thead>
            <tbody>
              <tr v-for="r in grid.rows" :key="r.id">
                <th class="pr-1 text-xs text-slate-400">{{ r.name }}</th>
                <td v-for="c in grid.cols" :key="c.id">
                  <button
                    class="h-10 w-10 rounded text-sm"
                    :class="grid.disabled.includes(cellId(r, c)) ? 'bg-slate-100 text-slate-300 line-through' : 'bg-green-500 text-white'"
                    @click="toggle(cellId(r, c))"
                  >{{ r.name }}{{ c.name }}</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </SubPage>
</template>
