import { supabase, MENU_PHOTOS_BUCKET } from './supabaseClient';
import type { Category, Item } from './types';

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchItems(): Promise<Item[]> {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createCategory(name: string, sortOrder: number): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .insert({ name, sort_order: sortOrder })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function renameCategory(id: string, name: string): Promise<void> {
  const { error } = await supabase.from('categories').update({ name }).eq('id', id);
  if (error) throw error;
}

export async function reorderCategories(updates: { id: string; sort_order: number }[]): Promise<void> {
  await Promise.all(
    updates.map((u) => supabase.from('categories').update({ sort_order: u.sort_order }).eq('id', u.id))
  );
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}

export async function createItem(item: Omit<Item, 'id' | 'created_at'>): Promise<Item> {
  const { data, error } = await supabase.from('items').insert(item).select().single();
  if (error) throw error;
  return data;
}

export async function updateItem(id: string, item: Partial<Omit<Item, 'id' | 'created_at'>>): Promise<void> {
  const { error } = await supabase.from('items').update(item).eq('id', id);
  if (error) throw error;
}

export async function deleteItem(id: string): Promise<void> {
  const { error } = await supabase.from('items').delete().eq('id', id);
  if (error) throw error;
}

export async function toggleItemVisibility(id: string, visible: boolean): Promise<void> {
  const { error } = await supabase.from('items').update({ visible }).eq('id', id);
  if (error) throw error;
}

/** Redimensiona e comprime a imagem no navegador antes do upload. */
function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const maxDim = 1000;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas não suportado'));
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Falha ao gerar imagem'))), 'image/jpeg', 0.8);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export async function uploadItemPhoto(file: File): Promise<string> {
  const compressed = await compressImage(file);
  const fileName = `${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage.from(MENU_PHOTOS_BUCKET).upload(fileName, compressed, {
    contentType: 'image/jpeg',
    cacheControl: '3600',
  });
  if (error) throw error;
  const { data } = supabase.storage.from(MENU_PHOTOS_BUCKET).getPublicUrl(fileName);
  return data.publicUrl;
}

export async function deleteItemPhoto(photoUrl: string): Promise<void> {
  const fileName = photoUrl.split('/').pop();
  if (!fileName) return;
  await supabase.storage.from(MENU_PHOTOS_BUCKET).remove([fileName]);
}
