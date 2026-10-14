<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import BottomSheet from './BottomSheet.vue';

export interface Option { id: number; label: string }

const props = defineProps<{ icon: string; label: string; options: Option[]; modelValue: number | null }>();
const emit = defineEmits<{ 'update:modelValue': [value: number | null] }>();
const { t } = useI18n();
const open = ref(false);
const selected = computed(() => props.options.find((o) => o.id === props.modelValue));

function pick(id: number | null) {
  emit('update:modelValue', id);
  open.value = false;
}
</script>

<template>
  <button
    type="button"
    class="flex h-12 min-w-0 items-center justify-center gap-1 rounded-lg px-2 text-sm font-medium shadow-sm"
    :class="selected ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 active:bg-slate-50'"
    @click="open = true"
  >
    <span>{{ icon }}</span><span class="truncate">{{ selected?.label ?? label }}</span>
  </button>

  <BottomSheet :open="open" :title="label" @close="open = false">
    <button type="button" class="flex h-12 w-full items-center justify-between rounded-lg px-3 text-left active:bg-slate-100" :class="!selected ? 'font-semibold text-indigo-700' : 'text-slate-900'" @click="pick(null)">
      {{ t('select.all') }}<span v-if="!selected">✓</span>
    </button>
    <p v-if="!options.length" class="py-6 text-center text-slate-400">{{ t('select.empty') }}</p>
    <button
      v-for="o in options" :key="o.id" type="button"
      class="flex h-12 w-full items-center justify-between rounded-lg px-3 text-left active:bg-slate-100"
      :class="o.id === modelValue ? 'font-semibold text-indigo-700' : 'text-slate-900'"
      @click="pick(o.id)"
    >{{ o.label }}<span v-if="o.id === modelValue">✓</span></button>
  </BottomSheet>
</template>
