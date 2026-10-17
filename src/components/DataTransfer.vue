<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import SubPage from './SubPage.vue';
import { exportAll, importAll } from '../db';
import { loadCars } from '../stores/cars';
import { loadCatalog } from '../stores/catalog';
import { loadGrid } from '../stores/grid';

defineEmits<{ back: [] }>();
const { t } = useI18n();

const mode = ref<'' | 'export' | 'import'>('');
const text = ref('');
const copied = ref(false);
const msg = ref<{ ok: boolean; text: string } | null>(null);

async function doExport() {
  mode.value = 'export';
  msg.value = null;
  text.value = JSON.stringify(await exportAll(), null, 2);
}
function doImport() {
  mode.value = 'import';
  msg.value = null;
  text.value = '';
}
async function copy() {
  try {
    await navigator.clipboard.writeText(text.value);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text.value;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
  copied.value = true;
  setTimeout(() => (copied.value = false), 1500);
}
async function runImport() {
  let data;
  try {
    data = JSON.parse(text.value);
  } catch {
    msg.value = { ok: false, text: t('transfer.invalid') };
    return;
  }
  if (!confirm(t('transfer.confirm'))) return;
  try {
    await importAll(data);
  } catch {
    msg.value = { ok: false, text: t('transfer.invalid') };
    return;
  }
  await Promise.all([loadCatalog(), loadGrid()]);
  await loadCars();
  text.value = '';
  msg.value = { ok: true, text: t('transfer.done') };
}

const btn = 'h-12 rounded-lg font-medium';
</script>

<template>
  <SubPage :title="t('transfer.title')" @back="$emit('back')">
    <div class="space-y-3">
      <div class="grid grid-cols-2 gap-2">
        <button :class="[btn, mode === 'export' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 shadow-sm']" @click="doExport">{{ t('transfer.export') }}</button>
        <button :class="[btn, mode === 'import' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 shadow-sm']" @click="doImport">{{ t('transfer.import') }}</button>
      </div>

      <template v-if="mode === 'export'">
        <div class="flex items-center justify-between">
          <span class="text-sm text-slate-500">JSON</span>
          <button class="flex h-10 items-center gap-1 rounded-lg bg-white px-3 text-slate-700 shadow-sm active:bg-slate-50" :aria-label="t('transfer.copy')" @click="copy">
            <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg>
            <span v-if="copied" class="text-sm text-green-600">{{ t('transfer.copied') }}</span>
          </button>
        </div>
        <textarea :value="text" readonly rows="14" class="w-full rounded-lg border border-slate-300 bg-white p-3 font-mono text-xs text-slate-800 outline-none" />
      </template>

      <template v-else-if="mode === 'import'">
        <textarea v-model="text" rows="14" :placeholder="t('transfer.paste')" class="w-full rounded-lg border border-slate-300 bg-white p-3 font-mono text-xs text-slate-800 outline-none focus:border-indigo-500" />
        <button :class="[btn, 'w-full bg-indigo-600 text-white active:bg-indigo-700 disabled:opacity-50']" :disabled="!text.trim()" @click="runImport">OK</button>
      </template>

      <p v-if="msg" class="text-center text-sm" :class="msg.ok ? 'text-green-600' : 'text-red-600'">{{ msg.text }}</p>
    </div>
  </SubPage>
</template>
