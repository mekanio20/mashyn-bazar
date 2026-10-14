<script setup lang="ts">
import { cellId, cellName, grid } from '../stores/grid';

defineProps<{ modelValue: string | null; label?: string; error?: string }>();
defineEmits<{ 'update:modelValue': [value: string] }>();
</script>

<template>
  <div>
    <label v-if="label" class="mb-1 block text-sm font-medium text-slate-700">
      {{ label }}<span v-if="modelValue" class="ml-2 rounded bg-indigo-100 px-2 py-0.5 text-indigo-700">{{ cellName(modelValue) }}</span>
    </label>
    <div class="overflow-x-auto rounded-lg border bg-white p-2" :class="error ? 'border-red-500' : 'border-slate-300'">
      <table class="border-separate border-spacing-1">
        <thead>
          <tr>
            <th></th>
            <th v-for="c in grid.cols" :key="c.id" class="min-w-10 text-xs font-medium text-slate-400">{{ c.name }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in grid.rows" :key="r.id">
            <th class="pr-1 text-xs font-medium text-slate-400">{{ r.name }}</th>
            <td v-for="c in grid.cols" :key="c.id">
              <span v-if="grid.disabled.includes(cellId(r, c))" class="block h-10 w-10 rounded bg-slate-100 opacity-40"></span>
              <button
                v-else
                type="button"
                class="h-10 w-10 rounded text-sm"
                :class="modelValue === cellId(r, c) ? 'bg-indigo-600 font-semibold text-white' : 'bg-slate-100 text-slate-600 active:bg-indigo-100'"
                @click="$emit('update:modelValue', cellId(r, c))"
              >{{ r.name }}{{ c.name }}</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
  </div>
</template>
