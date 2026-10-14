<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { accessActive, touchAccess, now } from './access';
import AccessGate from './components/AccessGate.vue';
import AppHeader from './components/AppHeader.vue';
import BottomNav from './components/BottomNav.vue';
import CarDetail from './components/CarDetail.vue';
import CarForm from './components/CarForm.vue';
import CarsView from './views/CarsView.vue';
import MapView from './views/MapView.vue';
import MenuView from './views/MenuView.vue';
import { confirmExit, exitConfirm, initBackNavigation } from './nav';
import { loadCars } from './stores/cars';
import { loadCatalog } from './stores/catalog';
import { loadGrid } from './stores/grid';
import { loadSettings } from './stores/settings';
import { openForm, ui } from './stores/ui';
import { watch } from 'vue';

const { t } = useI18n();
const ready = ref(false);

onMounted(async () => {
  await loadSettings();
  await Promise.all([loadCatalog(), loadGrid()]);
  await loadCars();
  now.value = Date.now();
  touchAccess();
  ready.value = true;
  initBackNavigation();
});
watch(now, touchAccess);
</script>

<template>
  <template v-if="ready">
    <AccessGate v-if="!accessActive" />
    <div v-else class="mx-auto min-h-screen max-w-xl">
      <AppHeader :title="t(`tabs.${ui.tab}`)" :show-add="ui.tab !== 'menu'" @add="openForm()" />
      <CarsView v-if="ui.tab === 'cars'" />
      <MapView v-else-if="ui.tab === 'map'" />
      <MenuView v-else />
      <BottomNav />
      <CarForm v-if="ui.formOpen" @close="ui.formOpen = false" />
      <CarDetail />
    </div>
  </template>
  <div v-if="exitConfirm" class="fixed inset-0 z-[300] flex items-center justify-center bg-black/50 p-6" @click.self="exitConfirm = false">
    <div class="w-full max-w-xs space-y-4 rounded-2xl bg-white p-5 shadow-xl">
      <p class="text-center text-lg font-medium text-slate-900">{{ t('nav.exitConfirm') }}</p>
      <div class="grid grid-cols-2 gap-2">
        <button class="h-12 rounded-lg bg-slate-200 font-medium text-slate-800 active:bg-slate-300" @click="exitConfirm = false">{{ t('nav.no') }}</button>
        <button class="h-12 rounded-lg bg-red-600 font-medium text-white active:bg-red-700" @click="confirmExit">{{ t('nav.yes') }}</button>
      </div>
    </div>
  </div>
</template>
