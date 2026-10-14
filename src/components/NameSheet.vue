<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import BottomSheet from './BottomSheet.vue';

const props = defineProps<{ open: boolean; title: string; value: string; canDelete?: boolean; numeric?: boolean }>();
const emit = defineEmits<{ close: []; save: [text: string]; delete: [] }>();
const { t } = useI18n();
const text = ref('');
const el = ref<HTMLInputElement>();

watch(() => props.open, async (o) => {
  if (!o) return;
  text.value = props.value;
  await nextTick();
  el.value?.focus();
});
function submit() {
  if (text.value.trim()) emit('save', text.value.trim());
}
</script>

<template>
  <BottomSheet :open="open" :title="title" @close="emit('close')">
    <form class="space-y-3" @submit.prevent="submit">
      <input
        ref="el" v-model="text" :inputmode="numeric ? 'numeric' : undefined" :placeholder="t('select.name')"
        class="h-12 w-full rounded-lg border border-slate-300 bg-white px-3 outline-none focus:border-indigo-500"
      />
      <div class="grid gap-2" :class="canDelete ? 'grid-cols-2' : 'grid-cols-1'">
        <button v-if="canDelete" type="button" class="h-12 rounded-lg bg-red-100 font-medium text-red-700 active:bg-red-200" @click="emit('delete')">{{ t('actions.delete') }}</button>
        <button type="submit" class="h-12 rounded-lg bg-indigo-600 font-medium text-white active:bg-indigo-700">{{ t('actions.save') }}</button>
      </div>
    </form>
  </BottomSheet>
</template>
