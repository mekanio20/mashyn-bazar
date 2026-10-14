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
import { exitHint, initBackNavigation } from './nav';
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
  <div v-if="exitHint" class="pointer-events-none fixed inset-x-0 bottom-24 z-[200] flex justify-center px-4">
    <span class="rounded-full bg-slate-800 px-4 py-2 text-sm text-white shadow-lg">{{ t('nav.exitHint') }}</span>
  </div>
</template>
