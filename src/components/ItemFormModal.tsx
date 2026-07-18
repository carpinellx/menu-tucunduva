import { useEffect, useState, type FormEvent } from 'react';
import type { Category, Item } from '../lib/types';
import { createItem, deleteItem, deleteItemPhoto, updateItem, uploadItemPhoto } from '../lib/api';

interface Props {
  categories: Category[];
  items: Item[];
  editingItem: Item | null;
  onClose: () => void;
  onSaved: () => void;
  showToast: (msg: string) => void;
}

export default function ItemFormModal({ categories, items, editingItem, onClose, onSaved, showToast }: Props) {
  const sortedCats = [...categories].sort((a, b) => a.sort_order - b.sort_order);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [visible, setVisible] = useState(true);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoRemoved, setPhotoRemoved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setName(editingItem.name);
      setDescription(editingItem.description ?? '');
      setPrice(String(editingItem.price));
      setCategoryId(editingItem.category_id);
      setVisible(editingItem.visible);
      setPhotoUrl(editingItem.photo_url);
    } else {
      setName('');
      setDescription('');
      setPrice('');
      setCategoryId(sortedCats[0]?.id ?? '');
      setVisible(true);
      setPhotoUrl(null);
    }
    setPhotoFile(null);
    setPhotoRemoved(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingItem]);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoRemoved(false);
    setPhotoUrl(URL.createObjectURL(file));
    e.target.value = '';
  }

  function handleRemovePhoto() {
    setPhotoFile(null);
    setPhotoUrl(null);
    setPhotoRemoved(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const priceNum = parseFloat(price);
    if (!name.trim() || Number.isNaN(priceNum) || !categoryId) return;

    setSaving(true);
    try {
      let finalPhotoUrl: string | null | undefined = undefined;

      if (photoFile) {
        finalPhotoUrl = await uploadItemPhoto(photoFile);
        if (editingItem?.photo_url) await deleteItemPhoto(editingItem.photo_url);
      } else if (photoRemoved) {
        if (editingItem?.photo_url) await deleteItemPhoto(editingItem.photo_url);
        finalPhotoUrl = null;
      }

      if (editingItem) {
        await updateItem(editingItem.id, {
          name: name.trim(),
          description: description.trim(),
          price: priceNum,
          category_id: categoryId,
          visible,
          ...(finalPhotoUrl !== undefined ? { photo_url: finalPhotoUrl } : {}),
        });
      } else {
        const maxOrder = items.filter((i) => i.category_id === categoryId).reduce((m, i) => Math.max(m, i.sort_order), -1);
        await createItem({
          name: name.trim(),
          description: description.trim(),
          price: priceNum,
          category_id: categoryId,
          visible,
          photo_url: finalPhotoUrl ?? null,
          sort_order: maxOrder + 1,
        });
      }
      onSaved();
      showToast('Item salvo.');
    } catch (err) {
      console.error(err);
      showToast('Não foi possível salvar o item.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!editingItem) return;
    if (!confirm('Excluir este item permanentemente?')) return;
    try {
      if (editingItem.photo_url) await deleteItemPhoto(editingItem.photo_url);
      await deleteItem(editingItem.id);
      onSaved();
      showToast('Item excluído.');
    } catch (err) {
      console.error(err);
      showToast('Não foi possível excluir o item.');
    }
  }

  if (sortedCats.length === 0) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-box" onClick={(e) => e.stopPropagation()}>
          <h3>Nenhuma categoria</h3>
          <p>Crie uma categoria antes de adicionar itens.</p>
          <div className="btn-row">
            <button className="btn btn-primary" onClick={onClose}>
              Entendi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3>{editingItem ? 'Editar item' : 'Novo item'}</h3>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Foto</label>
            <div className="photo-uploader">
              {photoUrl ? (
                <img className="photo-preview" src={photoUrl} alt="" />
              ) : (
                <div className="photo-preview-ph">sem foto</div>
              )}
              <div className="photo-actions">
                <label className="btn btn-ghost">
                  Escolher foto
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                </label>
                {photoUrl && (
                  <button type="button" className="btn btn-danger" onClick={handleRemovePhoto}>
                    Remover foto
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="field">
            <label htmlFor="itemName">Nome do item</label>
            <input id="itemName" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="field">
            <label htmlFor="itemDesc">Descrição</label>
            <textarea
              id="itemDesc"
              placeholder="Ingredientes, modo de preparo, origem..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="itemPrice">Preço (R$)</label>
            <input
              id="itemPrice"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          <div className="field">
            <label htmlFor="itemCat">Categoria</label>
            <select id="itemCat" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
              {sortedCats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              className={`toggle ${visible ? 'on' : ''}`}
              aria-pressed={visible}
              aria-label="Visível no cardápio"
              onClick={() => setVisible((v) => !v)}
            />
            <label style={{ margin: 0, textTransform: 'none', fontWeight: 600, color: 'var(--ink)', fontSize: 14 }}>
              Visível no cardápio
            </label>
          </div>

          <div className="btn-row spread">
            {editingItem ? (
              <button type="button" className="btn btn-danger" onClick={handleDelete}>
                Excluir item
              </button>
            ) : (
              <span />
            )}
            <div className="btn-row" style={{ margin: 0 }}>
              <button type="button" className="btn btn-ghost" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Salvando…' : 'Salvar'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
