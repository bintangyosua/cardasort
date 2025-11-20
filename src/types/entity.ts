export type User = {
  id: string; // UUID (PK)
  firstName: string;
  lastName: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'NURSE' | 'SUPPORT';
  created_at: string;
};

export type Tag = {
  id: number;
  name: string;
};

export type EntityCategory = {
  id: number;
  name: string;
  label?: string | null;
  _count?: {
    entities: number;
  };
};

export type Entity = {
  id: number;
  name: string;
  imageUrl?: string | null;
  categoryId: number;
  category?: EntityCategory;
  tags?: Tag[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
};
