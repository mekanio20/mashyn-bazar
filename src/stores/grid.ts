import { ref } from 'vue';
import { kvGet, kvSet } from '../db';
import type { Grid, Line } from '../types';

function defaultGrid(): Grid {
  const rows = 'ABCDE'.split('').map((name, i) => ({ id: `r${i + 1}`, name }));
  const cols = [1, 2, 3, 4, 5, 6].map((n) => ({ id: `c${n}`, name: String(n) }));
  return { rows, cols, disabled: [], seq: 7 };
}

export const grid = ref<Grid>(defaultGrid());

export const cellId = (r: Line, c: Line) => `${r.id}-${c.id}`;

export function cellName(id: string | null | undefined): string {
  if (!id) return '';
  const [rid, cid] = id.split('-');
  const r = grid.value.rows.find((x) => x.id === rid);
  const c = grid.value.cols.find((x) => x.id === cid);
  return r && c ? `${r.name}${c.name}` : '';
}

export const cellExists = (id: string | null | undefined) => !!cellName(id) && !grid.value.disabled.includes(id!);

export async function loadGrid() {
  const saved = await kvGet<Grid>('grid');
  if (saved) grid.value = saved;
}

const persist = () => kvSet('grid', JSON.parse(JSON.stringify(grid.value)));

const letter = (i: number) => (i < 26 ? String.fromCharCode(65 + i) : `R${i + 1}`);

export function addRow() {
  const g = grid.value;
  g.rows.push({ id: `r${g.seq++}`, name: letter(g.rows.length) });
  return persist();
}
export function addCol() {
  const g = grid.value;
  const max = Math.max(0, ...g.cols.map((c) => Number(c.name) || 0));
  g.cols.push({ id: `c${g.seq++}`, name: String(max + 1) });
  return persist();
}
export function renameLine(line: Line, name: string) {
  line.name = name.trim() || line.name;
  return persist();
}
export function removeRow(id: string) {
  grid.value.rows = grid.value.rows.filter((r) => r.id !== id);
  grid.value.disabled = grid.value.disabled.filter((d) => !d.startsWith(`${id}-`));
  return persist();
}
export function removeCol(id: string) {
  grid.value.cols = grid.value.cols.filter((c) => c.id !== id);
  grid.value.disabled = grid.value.disabled.filter((d) => !d.endsWith(`-${id}`));
  return persist();
}
export function toggleCell(id: string) {
  const d = grid.value.disabled;
  const i = d.indexOf(id);
  if (i >= 0) d.splice(i, 1);
  else d.push(id);
  return persist();
}
