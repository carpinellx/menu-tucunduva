import { useState } from 'react';
import type { Category, Item } from '../lib/types';
import { createCategory, deleteCategory, renameCategory, reorderCategories } from '../lib/api';

interface Props {
  categories: Category[];
  items: Item[];
  onChange: () => void;
  showToast: (msg: string) => void;
}

export default function CategoryManager({ categories, items, onChange, showToast }: Props) {
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [busy, setBusy] = useState(false);

  const sorted = [...categories].sort((a, b) => a.sort_order - b.sort_order);

  async function handleAdd() {
    const name = newName.trim();
    if (!name) return;
    setBusy(true);
    try {
      const maxOrder = categories.reduce((m, c) => Math.max(m, c.sort_order), -1);
      await createCategory(name, maxOrder + 1);
      setNewName('');
      onChange();
      showToast('Categoria adicionada.');
    } catch (e) {
      console.error(e);
      showToast('Não foi possível adicionar a categoria.');
    } finally {
      setBusy(false);
    }
  }

  async function handleMove(id: string, dir: -1 | 1) {
    const idx = sorted.findIndex((c) => c.id === id);
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const a = sorted[idx];
    const b = sorted[swapIdx];
    try {
      await reorderCategories([
        { id: a.id, sort_order: b.sort_order },
        { id: b.id, sort_order: a.sort_order },
      ]);
      onChange();
    } catch (e) {
      console.error(e);
      showToast('Não foi possível reordenar.');
    }
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setEditValue(cat.name);
  }

  async function commitEdit() {
    const val = editValue.trim();
    if (editingId && val) {
      try {
        await renameCategory(editingId, val);
        onChange();
      } catch (e) {
        console.error(e);
        showToast('Não foi possível renomear.');
      }
    }
    setEditingId(null);
  }

  async function handleDelete(id: string) {
    const hasItems = items.some((i) => i.category_id === id);
    if (hasItems) {
      alert('Essa categoria tem itens. Mova ou exclua os itens dela antes de removê-la.');
      return;
    }
    if (!confirm('Excluir esta categoria?')) return;
    try {
      await deleteCategory(id);
      onChange();
      showToast('Categoria excluída.');
    } catch (e) {
      console.error(e);
      showToast('Não foi possível excluir a categoria.');
    }
  }

  return (
    <section className="admin-section">
      <h3>Categorias</h3>
      {sorted.length === 0 && <p className="empty-hint">Nenhuma categoria ainda. Adicione a primeira abaixo.</p>}
      {sorted.map((c, idx) => (
        <div className="cat-row" key={c.id}>
          <button
            className="icon-btn"
            disabled={idx === 0}
            title="Mover para cima"
            aria-label={`Mover categoria ${c.name} para cima`}
            onClick={() => handleMove(c.id, -1)}
          >
            ↑
          </button>
          <button
            className="icon-btn"
            disabled={idx === sorted.length - 1}
            title="Mover para baixo"
            aria-label={`Mover categoria ${c.name} para baixo`}
            onClick={() => handleMove(c.id, 1)}
          >
            ↓
          </button>
          {editingId === c.id ? (
            <input
              className="cat-inline-input"
              autoFocus
              aria-label={`Renomear categoria ${c.name}`}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={commitEdit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitEdit();
                if (e.key === 'Escape') setEditingId(null);
              }}
            />
          ) : (
            <span className="cat-row-name">{c.name}</span>
          )}
          <button className="icon-btn" title="Renomear" aria-label={`Renomear categoria ${c.name}`} onClick={() => startEdit(c)}>
            ✎
          </button>
          <button className="icon-btn" title="Excluir" aria-label={`Excluir categoria ${c.name}`} onClick={() => handleDelete(c.id)}>
            ✕
          </button>
        </div>
      ))}
      <div className="add-row">
        <input
          type="text"
          placeholder="Nova categoria, ex.: Entradas"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button className="btn btn-primary" disabled={busy} onClick={handleAdd}>
          Adicionar
        </button>
      </div>
    </section>
  );
}
