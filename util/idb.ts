/**
 * IndexedDb Utilities
 */

import { openDB } from 'idb';

const dbName = 'built-environment';
const store = 'objects';

const getDb = () => openDB(dbName, 1, {
  upgrade(db) {
    db.createObjectStore(store);
  },
});

export const storeFile: (name: string, file: File) => Promise<string> =
  async (name: string, file: File): Promise<string> => {
    const db = await getDb();
    const data = await file.arrayBuffer();
    await db.put(store, data, name);
    return name;
  };

export const getFile: (name: string) => Promise<ArrayBuffer> =
  async (name: string): Promise<ArrayBuffer> => {
    const db = await getDb();
    return db.get(store, name);
  };

export const deleteFile: (name: string) => Promise<void> =
  async (name: string): Promise<void> => {
    const db = await getDb();
    return db.delete(store, name);
  };
