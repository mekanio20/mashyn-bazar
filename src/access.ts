import { computed } from 'vue';
import { ACCESS_CODES, ACCESS_SALT } from './access-hash';
import { settings } from './stores/settings';
import { ref } from 'vue';

const DAY = 24 * 60 * 60 * 1000;

export const now = ref(Date.now());
setInterval(() => (now.value = Date.now()), 30_000);
document.addEventListener('visibilitychange', () => (now.value = Date.now()));

const normalize = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, '');

async function sha256Hex(text: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** Telefon saati geri alınmışsa (son açılıştan >1 gün geride) erişim verilmez. */
const clockTampered = (t: number) => t < settings.lastSeenAt - DAY;

export const accessActive = computed(
  () => settings.accessUntil > now.value && !clockTampered(now.value),
);
export const daysLeft = computed(() => Math.max(0, Math.ceil((settings.accessUntil - now.value) / DAY)));

export function touchAccess() {
  if (accessActive.value && now.value > settings.lastSeenAt) settings.lastSeenAt = now.value;
}

export type ActivateResult = 'ok' | 'wrong' | 'clock';

export async function activate(code: string): Promise<ActivateResult> {
  const t = Date.now();
  if (clockTampered(t)) return 'clock';
  const hash = await sha256Hex(ACCESS_SALT + normalize(code));
  const entry = ACCESS_CODES.find((c) => c.hash === hash);
  if (!entry) return 'wrong';
  now.value = t;
  settings.accessUntil = t + entry.days * DAY;
  settings.lastSeenAt = t;
  return 'ok';
}
