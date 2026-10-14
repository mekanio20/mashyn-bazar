<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import SubPage from './SubPage.vue';
import { clearAll, exportAll, importAll } from '../db';
import { loadCars } from '../stores/cars';
import { loadCatalog } from '../stores/catalog';
import { loadGrid } from '../stores/grid';

defineEmits<{ back: [] }>();
const { t } = useI18n();
const message = ref('');
const paste = ref('');

async function reloadAll() {
  await Promise.all([loadCatalog(), loadGrid(), loadCars()]);
}

async function doExport() {
  const json = JSON.stringify(await exportAll(), null, 2);
  try { await navigator.clipboard.writeText(json); } catch { /* bazı WebView'larda kapalı */ }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
  a.download = `cars-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  message.value = t('data.exportHint');
}

async function doImport(text: string) {
  if (!confirm(t('data.importWarn'))) return;
  try {
    await importAll(JSON.parse(text));
    await reloadAll();
    paste.value = '';
    message.value = t('data.importOk');
  } catch {
    message.value = t('data.importFail');
  }
}
async function onFile(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0];
  if (f) await doImport(await f.text());
  (e.target as HTMLInputElement).value = '';
}
async function doClear() {
  if (!confirm(t('data.clearConfirm'))) return;
  await clearAll();
  await reloadAll();
  message.value = t('data.cleared');
}
const btn = 'h-12 w-full rounded-lg font-medium';
</script>

<template>
  <SubPage :title="t('data.title')" @back="$emit('back')">
    <div class="space-y-6">
      <p v-if="message" class="rounded-lg bg-indigo-50 p-3 text-indigo-700">{{ message }}</p>
      <button :class="btn + ' bg-indigo-600 text-white active:bg-indigo-700'" @click="doExport">{{ t('data.export') }}</button>

      <section class="space-y-2">
        <h2 class="font-semibold text-slate-800">{{ t('data.import') }}</h2>
        <label :class="btn + ' flex items-center justify-center bg-slate-200 text-slate-800 active:bg-slate-300'">
          {{ t('data.importFile') }}<input type="file" accept="application/json,.json" class="hidden" @change="onFile" />
        </label>
        <textarea v-model="paste" rows="4" :placeholder="t('data.importPaste')" class="w-full rounded-lg border border-slate-300 bg-white p-3 outline-none focus:border-indigo-500"></textarea>
        <button v-if="paste.trim()" :class="btn + ' bg-slate-800 text-white'" @click="doImport(paste)">{{ t('data.import') }}</button>
      </section>

      <button :class="btn + ' bg-red-100 text-red-700 active:bg-red-200'" @click="doClear">{{ t('data.clear') }}</button>
    </div>
  </SubPage>
</template>
