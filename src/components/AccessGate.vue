<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { activate } from '../access';
import { settings } from '../stores/settings';
import { CONTACT_EMAIL, CONTACT_PHONE } from '../config';

const { t } = useI18n();
const code = ref('');
const error = ref('');
const busy = ref(false);

function format(v: string) {
  const s = v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 16);
  return s.replace(/(.{4})(?=.)/g, '$1-');
}

async function submit() {
  busy.value = true;
  error.value = '';
  const r = await activate(code.value);
  busy.value = false;
  if (r === 'wrong') error.value = t('lock.wrong');
  else if (r === 'clock') error.value = t('lock.clock');
}
</script>

<template>
  <div class="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-50 p-6">
    <div class="w-full max-w-sm space-y-4 text-center">
      <div class="text-5xl">🔒</div>
      <h1 class="text-xl font-semibold text-slate-900">{{ settings.accessUntil ? t('lock.expiredTitle') : t('lock.title') }}</h1>
      <p class="text-slate-500">{{ t('lock.hint') }}</p>

      <form class="space-y-3" @submit.prevent="submit">
        <input
          :value="code"
          :placeholder="t('lock.placeholder')"
          autocomplete="off" autocapitalize="characters" spellcheck="false"
          class="h-14 w-full rounded-lg border bg-white px-3 text-center text-lg tracking-widest outline-none focus:border-indigo-500"
          :class="error ? 'border-red-500' : 'border-slate-300'"
          @input="code = format(($event.target as HTMLInputElement).value)"
        />
        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
        <button type="submit" :disabled="busy || code.length < 4" class="h-12 w-full rounded-lg bg-indigo-600 font-medium text-white disabled:opacity-50 active:bg-indigo-700">
          {{ t('lock.activate') }}
        </button>
      </form>

      <div class="pt-2 text-sm text-slate-500">
        <a :href="`tel:${CONTACT_PHONE}`" class="block py-1 text-indigo-600">{{ CONTACT_PHONE }}</a>
        <a :href="`mailto:${CONTACT_EMAIL}`" class="block py-1 text-indigo-600">{{ CONTACT_EMAIL }}</a>
      </div>
      <div class="flex justify-center gap-2 pt-2">
        <button v-for="l in (['tm', 'ru'] as const)" :key="l" class="rounded-full px-4 py-1.5 text-sm" :class="settings.lang === l ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'" @click="settings.lang = l">{{ l === 'tm' ? 'Türkmençe' : 'Русский' }}</button>
      </div>
    </div>
  </div>
</template>
