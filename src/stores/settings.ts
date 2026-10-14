import { reactive, watch } from 'vue';
import { kvGet, kvSet } from '../db';
import type { Settings } from '../types';
import { i18n } from '../i18n';

export const settings = reactive<Settings>({ lang: 'tm', theme: 'light', accessUntil: 0, lastSeenAt: 0 });

function apply() {
  i18n.global.locale.value = settings.lang;
  document.documentElement.lang = settings.lang === 'tm' ? 'tk' : 'ru';
  document.documentElement.classList.toggle('dark', settings.theme === 'dark');
}

export async function loadSettings() {
  Object.assign(settings, await kvGet<Settings>('settings'));
  apply();
  watch(settings, () => {
    apply();
    save();
  });
}

export function save() {
  return kvSet('settings', { ...settings });
}
