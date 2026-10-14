<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { daysLeft } from '../access';
import CatalogSettings from '../components/CatalogSettings.vue';
import GridSettings from '../components/GridSettings.vue';
import SubPage from '../components/SubPage.vue';
import { APP_VERSION, CONTACT_EMAIL, CONTACT_PHONE } from '../config';
import { settings } from '../stores/settings';

const { t } = useI18n();
const page = ref<'' | 'grid' | 'catalog' | 'about' | 'contact'>('');
const item = 'flex h-14 w-full items-center justify-between rounded-xl bg-white px-4 text-left shadow-sm active:bg-slate-50';
</script>

<template>
  <div class="space-y-6 p-4 pb-24">
    <section class="space-y-2">
      <h2 class="text-sm font-semibold uppercase text-slate-500">{{ t('menu.language') }}</h2>
      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="l in (['tm', 'ru'] as const)" :key="l" class="h-12 rounded-xl font-medium"
          :class="settings.lang === l ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 shadow-sm'"
          @click="settings.lang = l"
        >{{ l === 'tm' ? 'Türkmençe' : 'Русский' }}</button>
      </div>
    </section>

    <section class="space-y-2">
      <h2 class="text-sm font-semibold uppercase text-slate-500">{{ t('menu.settings') }}</h2>
      <button :class="item" @click="page = 'grid'">🗺️ {{ t('menu.gridSettings') }}<span class="text-slate-400">›</span></button>
      <button :class="item" @click="page = 'catalog'">🚗 {{ t('menu.catalog') }}<span class="text-slate-400">›</span></button>
      <div :class="item">
        <span>🎨 {{ t('menu.theme') }}</span>
        <span class="flex gap-1">
          <button v-for="th in (['light', 'dark'] as const)" :key="th" class="rounded-full px-3 py-1 text-sm" :class="settings.theme === th ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'" @click="settings.theme = th">{{ t(`menu.${th}`) }}</button>
        </span>
      </div>
      <div :class="item"><span>🔑 {{ t('menu.access') }}</span><span class="text-slate-500">{{ t('menu.daysLeft', { n: daysLeft }) }}</span></div>
      <button :class="item" @click="page = 'contact'">📞 {{ t('menu.contact') }}<span class="text-slate-400">›</span></button>
      <button :class="item" @click="page = 'about'">ℹ️ {{ t('menu.about') }}<span class="text-slate-400">›</span></button>
    </section>

    <GridSettings v-if="page === 'grid'" @back="page = ''" />
    <CatalogSettings v-if="page === 'catalog'" @back="page = ''" />
    <SubPage v-if="page === 'about'" :title="t('menu.about')" @back="page = ''">
      <div class="space-y-4">
        <div class="text-center">
          <div class="text-6xl">🚗</div>
          <h2 class="mt-2 text-xl font-semibold text-slate-900">{{ t('menu.appName') }}</h2>
          <p class="text-sm text-slate-500">{{ t('menu.version') }}: {{ APP_VERSION }}</p>
        </div>
        <p class="whitespace-pre-line rounded-xl bg-white p-4 leading-relaxed text-slate-700 shadow-sm">{{ t('menu.aboutText') }}</p>
      </div>
    </SubPage>
    <SubPage v-if="page === 'contact'" :title="t('menu.contact')" @back="page = ''">
      <div class="space-y-3">
        <a :href="`tel:${CONTACT_PHONE}`" :class="item">{{ t('menu.phone') }}<span class="text-indigo-600">{{ CONTACT_PHONE }}</span></a>
        <a :href="`mailto:${CONTACT_EMAIL}`" :class="item">{{ t('menu.email') }}<span class="text-indigo-600">{{ CONTACT_EMAIL }}</span></a>
      </div>
    </SubPage>
  </div>
</template>
