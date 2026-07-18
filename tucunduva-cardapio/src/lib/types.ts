export interface Category {
  id: string;
  name: string;
  sort_order: number;
  created_at: string;
}

export interface Item {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  photo_url: string | null;
  visible: boolean;
  sort_order: number;
  created_at: string;
}
