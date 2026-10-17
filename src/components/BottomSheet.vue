<script setup lang="ts">
import { useBackLayer } from '../nav';

const props = defineProps<{ open: boolean; title?: string }>();
const emit = defineEmits<{ close: [] }>();
useBackLayer(() => props.open, () => emit('close'));
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-50 flex items-end justify-center bg-black/40" @click.self="emit('close')">
      <div class="flex max-h-[85vh] w-full max-w-xl flex-col rounded-t-2xl bg-white shadow-xl">
        <div class="flex items-center justify-between px-4 pt-4">
          <h2 class="text-lg font-semibold text-slate-900">{{ title }}</h2>
          <button class="-mr-2 h-10 w-10 rounded-full text-2xl text-slate-500 active:bg-slate-100" aria-label="close" @click="emit('close')">×</button>
        </div>
        <div v-if="$slots.header" class="px-4 pt-2">
          <slot name="header" />
        </div>
        <div class="overflow-y-auto px-4 pb-6 pt-2" :style="$slots.footer ? undefined : 'padding-bottom: calc(1.5rem + env(safe-area-inset-bottom))'">
          <slot />
        </div>
        <div v-if="$slots.footer" class="border-t border-slate-200 px-4 pt-3" style="padding-bottom: calc(0.75rem + env(safe-area-inset-bottom))">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>
