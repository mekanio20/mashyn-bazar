<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import BottomSheet from './BottomSheet.vue';

export interface Option { id: number; label: string }

const props = defineProps<{
  modelValue: number | null;
  options: Option[];
  label?: string;
  placeholder?: string;
  allowCreate?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  numeric?: boolean;
  error?: string;
}>();
const emit = defineEmits<{ 'update:modelValue': [value: number | null]; create: [text: string] }>();
const { t } = useI18n();

const open = ref(false);
const creating = ref(false);
const query = ref('');
const newName = ref('');
const searchEl = ref<HTMLInputElement>();
const newEl = ref<HTMLInputElement>();

const selected = computed(() => props.options.find((o) => o.id === props.modelValue));
const list = computed(() => {
  const q = query.value.trim().toLowerCase();
  return q ? props.options.filter((o) => o.label.toLowerCase().includes(q)) : props.options;
});
const canAddQuery = computed(() => {
  const q = query.value.trim();
  return props.allowCreate && q && !props.options.some((o) => o.label.toLowerCase() === q.toLowerCase());
});

async function openList() {
  if (props.disabled) return;
  query.value = '';
  open.value = true;
  await nextTick();
  searchEl.value?.focus();
}
function pick(id: number | null) {
  emit('update:modelValue', id);
  open.value = false;
}
function addFromQuery() {
  emit('create', query.value.trim());
  open.value = false;
}
async function openCreate() {
  if (props.disabled) return;
  newName.value = '';
  creating.value = true;
  await nextTick();
  newEl.value?.focus();
}
function submitCreate() {
  const text = newName.value.trim();
  if (!text) return;
  emit('create', text);
  creating.value = false;
}
</script>

<template>
  <div>
    <label v-if="label" class="mb-1 block text-sm font-medium text-slate-700">{{ label }}</label>
    <div class="flex gap-2">
      <button
        type="button"
        class="flex h-12 min-w-0 flex-1 items-center justify-between rounded-lg border bg-white px-3 text-left"
        :class="[error ? 'border-red-500' : 'border-slate-300', disabled ? 'opacity-50' : 'active:bg-slate-50']"
        @click="openList"
      >
        <span class="truncate" :class="selected ? 'text-slate-900' : 'text-slate-400'">{{ selected?.label ?? placeholder }}</span>
        <span class="ml-2 shrink-0 text-slate-400">▾</span>
      </button>
      <button
        v-if="clearable && selected"
        type="button"
        class="h-12 w-12 shrink-0 rounded-lg border border-slate-300 bg-white text-xl text-slate-500 active:bg-slate-50"
        :aria-label="t('select.clear')"
        @click="pick(null)"
      >×</button>
      <button
        v-if="allowCreate"
        type="button"
        class="h-12 w-12 shrink-0 rounded-lg bg-indigo-600 text-2xl text-white active:bg-indigo-700"
        :class="{ 'opacity-50': disabled }"
        :aria-label="t('select.addNew')"
        @click="openCreate"
      >+</button>
    </div>
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>

    <BottomSheet :open="open" :title="label" @close="open = false">
      <input
        ref="searchEl"
        v-model="query"
        type="search"
        :inputmode="numeric ? 'numeric' : undefined"
        :placeholder="t('select.search')"
        class="mb-2 h-12 w-full rounded-lg border border-slate-300 bg-white px-3 outline-none focus:border-indigo-500"
      />
      <button v-if="canAddQuery" type="button" class="mb-1 flex h-12 w-full items-center gap-2 rounded-lg bg-indigo-50 px-3 text-indigo-700 active:bg-indigo-100" @click="addFromQuery">
        <span class="text-xl">+</span> {{ t('select.add') }}: «{{ query.trim() }}»
      </button>
      <p v-if="!list.length && !canAddQuery" class="py-6 text-center text-slate-400">{{ t('select.empty') }}</p>
      <ul>
        <li v-for="o in list" :key="o.id">
          <button
            type="button"
            class="flex h-12 w-full items-center justify-between rounded-lg px-3 text-left active:bg-slate-100"
            :class="o.id === modelValue ? 'font-semibold text-indigo-700' : 'text-slate-900'"
            @click="pick(o.id)"
          >
            {{ o.label }}<span v-if="o.id === modelValue">✓</span>
          </button>
        </li>
      </ul>
    </BottomSheet>

    <BottomSheet :open="creating" :title="`${label ?? ''} — ${t('select.addNew')}`" @close="creating = false">
      <form class="space-y-3" @submit.prevent="submitCreate">
        <input
          ref="newEl"
          v-model="newName"
          :inputmode="numeric ? 'numeric' : undefined"
          :placeholder="t('select.name')"
          class="h-12 w-full rounded-lg border border-slate-300 bg-white px-3 outline-none focus:border-indigo-500"
        />
        <button type="submit" class="h-12 w-full rounded-lg bg-indigo-600 font-medium text-white active:bg-indigo-700">{{ t('select.add') }}</button>
      </form>
    </BottomSheet>
  </div>
</template>
