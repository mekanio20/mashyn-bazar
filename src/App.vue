<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import * as db from './db';
import type { Item } from './db';

const items = ref<Item[]>([]);
const search = ref('');
const showForm = ref(false);
const editing = ref<Item | null>(null);
const form = ref({ title: '', note: '' });

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase();
  return items.value
    .filter((i) => !q || i.title.toLowerCase().includes(q) || i.note.toLowerCase().includes(q))
    .sort((a, b) => b.createdAt - a.createdAt);
});

async function load() {
  items.value = await db.getAll();
}

function openNew() {
  editing.value = null;
  form.value = { title: '', note: '' };
  showForm.value = true;
}

function openEdit(item: Item) {
  editing.value = item;
  form.value = { title: item.title, note: item.note };
  showForm.value = true;
}

async function save() {
  const title = form.value.title.trim();
  if (!title) return;
  if (editing.value) {
    await db.put({ ...editing.value, title, note: form.value.note.trim() });
  } else {
    await db.add({ title, note: form.value.note.trim(), createdAt: Date.now() });
  }
  showForm.value = false;
  await load();
}

async function del(item: Item) {
  if (!confirm(`"${item.title}" silinsin mi?`)) return;
  await db.remove(item.id!);
  await load();
}

onMounted(load);
</script>

<template>
  <div class="mx-auto flex min-h-screen max-w-xl flex-col">
    <header class="sticky top-0 z-10 bg-indigo-600 px-4 py-3 text-white shadow">
      <h1 class="text-lg font-semibold">Kayıtlarım</h1>
      <input
        v-model="search"
        type="search"
        placeholder="Ara..."
        class="mt-2 w-full rounded-lg bg-white/20 px-3 py-2 text-sm text-white placeholder-white/70 outline-none focus:bg-white/30"
      />
    </header>

    <main class="flex-1 space-y-3 p-4 pb-24">
      <p v-if="!filtered.length" class="py-16 text-center text-slate-500">
        {{ items.length ? 'Sonuç bulunamadı.' : 'Henüz kayıt yok. + ile ekleyin.' }}
      </p>

      <article v-for="item in filtered" :key="item.id" class="rounded-xl bg-white p-4 shadow-sm">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0">
            <h2 class="truncate font-medium text-slate-900">{{ item.title }}</h2>
            <p v-if="item.note" class="mt-1 whitespace-pre-line text-sm text-slate-600">{{ item.note }}</p>
            <p class="mt-2 text-xs text-slate-400">{{ new Date(item.createdAt).toLocaleString('tr-TR') }}</p>
          </div>
          <div class="flex shrink-0 gap-1">
            <button class="rounded-lg px-3 py-1.5 text-sm text-indigo-600 active:bg-indigo-50" @click="openEdit(item)">Düzenle</button>
            <button class="rounded-lg px-3 py-1.5 text-sm text-red-600 active:bg-red-50" @click="del(item)">Sil</button>
          </div>
        </div>
      </article>
    </main>

    <button
      class="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-3xl text-white shadow-lg active:bg-indigo-700"
      aria-label="Yeni kayıt"
      @click="openNew"
    >+</button>

    <div v-if="showForm" class="fixed inset-0 z-20 flex items-end bg-black/40 sm:items-center sm:justify-center" @click.self="showForm = false">
      <form class="w-full max-w-xl space-y-3 rounded-t-2xl bg-white p-5 sm:rounded-2xl" @submit.prevent="save">
        <h2 class="text-lg font-semibold">{{ editing ? 'Kaydı düzenle' : 'Yeni kayıt' }}</h2>
        <input v-model="form.title" required autofocus placeholder="Başlık" class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500" />
        <textarea v-model="form.note" rows="4" placeholder="Not" class="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-indigo-500"></textarea>
        <div class="flex justify-end gap-2">
          <button type="button" class="rounded-lg px-4 py-2 text-slate-600" @click="showForm = false">İptal</button>
          <button type="submit" class="rounded-lg bg-indigo-600 px-4 py-2 text-white active:bg-indigo-700">Kaydet</button>
        </div>
      </form>
    </div>
  </div>
</template>
