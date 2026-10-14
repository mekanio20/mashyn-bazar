import { reactive } from 'vue';
import type { Car } from '../types';

export const ui = reactive({
  tab: 'cars' as 'cars' | 'map' | 'menu',
  formOpen: false,
  editing: null as Car | null,
  presetCell: null as string | null,
  detailId: null as number | null,
  focusCell: null as string | null,
});

export function openForm(car: Car | null = null, cell: string | null = null) {
  ui.editing = car;
  ui.presetCell = cell;
  ui.formOpen = true;
}

export function showOnMap(cell: string | null) {
  ui.detailId = null;
  ui.tab = 'map';
  ui.focusCell = cell;
  if (cell) setTimeout(() => (ui.focusCell = null), 4000);
}
