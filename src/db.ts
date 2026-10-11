import { openDB, type DBSchema } from 'idb';

export interface Item {
  id?: number;
  title: string;
  note: string;
  createdAt: number;
}

interface AppDB extends DBSchema {
  items: { key: number; value: Item };
}

const dbPromise = openDB<AppDB>('crud-pwa', 1, {
  upgrade(db) {
    db.createObjectStore('items', { keyPath: 'id', autoIncrement: true });
  },
});

export const getAll = async () => (await dbPromise).getAll('items');
export const add = async (item: Omit<Item, 'id'>) => (await dbPromise).add('items', item as Item);
export const put = async (item: Item) => (await dbPromise).put('items', item);
export const remove = async (id: number) => (await dbPromise).delete('items', id);
