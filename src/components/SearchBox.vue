<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { search, setSearch } from '../stores/cars';

const { t } = useI18n();
</script>

<template>
  <div class="relative">
    <input
      :value="search" type="search" :placeholder="t('search')"
      class="h-12 w-full rounded-lg border border-slate-300 bg-white pl-3 pr-10 outline-none focus:border-indigo-500"
      @input="setSearch(($event.target as HTMLInputElement).value)"
    />
  </div>
</template>
