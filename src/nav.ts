import { onScopeDispose, ref, watch } from 'vue';
import { accessActive } from './access';
import { ui } from './stores/ui';

/**
 * Android "geri" düwmesi. Capacitor WebView geri basylanda history-de yer bar bolsa
 * "popstate" berýär, ýok bolsa programmadan çykýar. Şonuň üçin hemişe bir sany
 * "garawul" ýazgy saklaýarys: geri basylanda ýapyk sheet/sahypa ýa-da tab yza gidýär.
 */
interface Layer { close: () => void }
const layers: Layer[] = [];
export const exitHint = ref(false);

/** Açyk wagtynda "geri" düwmesi bilen ýapylýan gatlak (sheet, sahypa, forma). */
export function useBackLayer(isOpen: () => boolean, close: () => void) {
  const layer: Layer = { close };
  const remove = () => {
    const i = layers.indexOf(layer);
    if (i >= 0) layers.splice(i, 1);
  };
  watch(isOpen, (open) => {
    remove();
    if (open) layers.push(layer);
  }, { immediate: true });
  onScopeDispose(remove);
}

const arm = () => history.pushState({ guard: true }, '');

export function initBackNavigation() {
  arm();
  window.addEventListener('popstate', () => {
    const top = layers[layers.length - 1];
    if (accessActive.value && top) {
      top.close();
      return arm();
    }
    if (accessActive.value && ui.tab !== 'cars') {
      ui.tab = 'cars';
      return arm();
    }
    // Kök ekran: 2 sekunt içinde ýene basylsa çykýar (garawul ýazgy ýok).
    exitHint.value = true;
    setTimeout(() => {
      exitHint.value = false;
      arm();
    }, 2000);
  });
}
