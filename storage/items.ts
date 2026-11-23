import { GroceryItem } from '../types/GroceryItem';
import { getDb } from './db';

type ItemRow = GroceryItem & { notificationIds?: string | null };

function mapRow(row: ItemRow): GroceryItem {
  return {
    id: row.id,
    name: row.name,
    weight: row.weight ?? undefined,
    expirationDate: row.expirationDate,
    notes: row.notes ?? undefined,
    createdAt: row.createdAt,
    source: row.source,
  };
}

export async function listItems(): Promise<GroceryItem[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<ItemRow>('SELECT * FROM items ORDER BY expirationDate ASC');
  return rows.map(mapRow);
}

export async function getItem(id: string): Promise<GroceryItem | null> {
  const db = await getDb();
  const rows = await db.getAllAsync<ItemRow>('SELECT * FROM items WHERE id = ?', [id]);
  if (!rows.length) return null;
  return mapRow(rows[0]);
}

export async function createItem(item: GroceryItem): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO items (id, name, weight, expirationDate, notes, createdAt, source, notificationIds)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      item.id,
      item.name,
      item.weight ?? null,
      item.expirationDate,
      item.notes ?? null,
      item.createdAt,
      item.source,
      null,
    ]
  );
}

export async function updateItem(item: GroceryItem): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE items
     SET name = ?, weight = ?, expirationDate = ?, notes = ?, source = ?
     WHERE id = ?`,
    [item.name, item.weight ?? null, item.expirationDate, item.notes ?? null, item.source, item.id]
  );
}

export async function deleteItem(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM items WHERE id = ?', [id]);
}

export async function getNotificationIds(itemId: string): Promise<string[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<ItemRow>('SELECT notificationIds FROM items WHERE id = ?', [
    itemId,
  ]);
  if (!rows.length || !rows[0].notificationIds) return [];
  try {
    return JSON.parse(rows[0].notificationIds) as string[];
  } catch {
    return [];
  }
}

export async function setNotificationIds(itemId: string, ids: string[]): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE items SET notificationIds = ? WHERE id = ?', [
    JSON.stringify(ids),
    itemId,
  ]);
}

export async function clearNotificationIds(itemId: string): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE items SET notificationIds = NULL WHERE id = ?', [itemId]);
}
