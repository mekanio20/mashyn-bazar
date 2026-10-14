import { createI18n } from 'vue-i18n';
import tm from './tm.json';
import ru from './ru.json';

export const i18n = createI18n({
  legacy: false,
  locale: 'tm',
  fallbackLocale: 'ru',
  messages: { tm, ru },
});
export const t = i18n.global.t;
