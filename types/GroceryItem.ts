export type GrocerySource = 'manual' | 'photo';

export interface GroceryItem {
  id: string;
  name: string;
  weight?: string;
  expirationDate: string;
  notes?: string;
  createdAt: string;
  source: GrocerySource;
}
