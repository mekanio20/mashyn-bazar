<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import SubPage from './SubPage.vue';
import BottomSheet from './BottomSheet.vue';
import { countWhere, unassign } from '../stores/cars';
import { addCol, addRow, cellId, grid, moveLine, removeCol, removeRow, renameLine, toggleCell } from '../stores/grid';

defineEmits<{ back: [] }>();
const { t } = useI18n();

const edit = ref<{ kind: 'rows' | 'cols'; id: string } | null>(null);
const name = ref('');
const line = computed(() => (edit.value ? grid.value[edit.value.kind].find((l) => l.id === edit.value!.id) : undefined));
const canDelete = computed(() => !!edit.value && grid.value[edit.value.kind].length > 1);

function open(kind: 'rows' | 'cols', id: string) {
  edit.value = { kind, id };
  name.value = grid.value[kind].find((l) => l.id === id)!.name;
}
async function saveName() {
  if (line.value) await renameLine(line.value, name.value);
  edit.value = null;
}
async function move(dir: -1 | 1) {
  if (edit.value) await moveLine(edit.value.kind, edit.value.id, dir);
}
async function del() {
  const e = edit.value;
  if (!e) return;
  const match = e.kind === 'rows' ? (c: string) => c.startsWith(`${e.id}-`) : (c: string) => c.endsWith(`-${e.id}`);
  const n = countWhere(match);
  if (n && !confirm(t('grid.confirmRemove', { n }))) return;
  await unassign(match);
  await (e.kind === 'rows' ? removeRow(e.id) : removeCol(e.id));
  edit.value = null;
}
async function toggle(id: string) {
  if (!grid.value.disabled.includes(id)) {
    const n = countWhere((c) => c === id);
    if (n && !confirm(t('grid.confirmClose', { n }))) return;
    await unassign((c) => c === id);
  }
  await toggleCell(id);
}
const head = 'min-w-10 rounded bg-indigo-100 px-2 py-2 text-sm font-semibold text-indigo-700 active:bg-indigo-200';
const plus = 'h-10 min-w-10 rounded bg-indigo-600 text-xl text-white active:bg-indigo-700';
</script>

<template>
  <SubPage :title="t('grid.title')" @back="$emit('back')">
    <p class="mb-3 text-sm text-slate-500">{{ t('grid.tapHint') }}</p>
    <div class="overflow-x-auto rounded-xl bg-white p-2 shadow-sm">
      <table class="border-separate border-spacing-1">
        <thead>
          <tr>
            <th></th>
            <th v-for="c in grid.cols" :key="c.id"><button :class="head" @click="open('cols', c.id)">{{ c.name }}</button></th>
            <th><button :class="plus" :aria-label="t('grid.addCol')" @click="addCol">+</button></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in grid.rows" :key="r.id">
            <th><button :class="head" @click="open('rows', r.id)">{{ r.name }}</button></th>
            <td v-for="c in grid.cols" :key="c.id">
              <button
                class="h-10 w-full min-w-10 rounded text-sm"
                :class="grid.disabled.includes(cellId(r, c)) ? 'bg-slate-100 text-slate-300 line-through' : 'bg-green-500 text-white'"
                @click="toggle(cellId(r, c))"
              >{{ r.name }}{{ c.name }}</button>
            </td>
          </tr>
          <tr>
            <th><button :class="plus + ' w-full'" :aria-label="t('grid.addRow')" @click="addRow">+</button></th>
          </tr>
        </tbody>
      </table>
    </div>
  </SubPage>

  <BottomSheet :open="!!edit" :title="edit?.kind === 'rows' ? t('grid.rows') : t('grid.cols')" @close="edit = null">
    <form class="space-y-3" @submit.prevent="saveName">
      <input v-model="name" :placeholder="t('grid.name')" class="h-12 w-full rounded-lg border border-slate-300 bg-white px-3 outline-none focus:border-indigo-500" />
      <div class="grid grid-cols-2 gap-2">
        <button type="button" class="h-12 rounded-lg bg-slate-200 font-medium text-slate-800 active:bg-slate-300" @click="move(-1)">← {{ t('grid.moveBack') }}</button>
        <button type="button" class="h-12 rounded-lg bg-slate-200 font-medium text-slate-800 active:bg-slate-300" @click="move(1)">{{ t('grid.moveFwd') }} →</button>
      </div>
      <div class="grid gap-2" :class="canDelete ? 'grid-cols-2' : 'grid-cols-1'">
        <button v-if="canDelete" type="button" class="h-12 rounded-lg bg-red-100 font-medium text-red-700 active:bg-red-200" @click="del">{{ t('actions.delete') }}</button>
        <button type="submit" class="h-12 rounded-lg bg-indigo-600 font-medium text-white active:bg-indigo-700">{{ t('actions.save') }}</button>
      </div>
    </form>
  </BottomSheet>
</template>
