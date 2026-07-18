import type { Category, Item } from '../lib/types';
import { toggleItemVisibility } from '../lib/api';

function formatPrice(v: number): string {
  return 'R$ ' + v.toFixed(2).replace('.', ',');
}

interface Props {
  categories: Category[];
  items: Item[];
  onChange: () => void;
  onEdit: (item: Item) => void;
  onNew: () => void;
  showToast: (msg: string) => void;
}

export default function ItemManager({ categories, items, onChange, onEdit, onNew, showToast }: Props) {
  const sortedCats = [...categories].sort((a, b) => a.sort_order - b.sort_order);

  async function handleToggle(item: Item) {
    try {
      await toggleItemVisibility(item.id, !item.visible);
      onChange();
    } catch (e) {
      console.error(e);
      showToast('Não foi possível atualizar a visibilidade.');
    }
  }

  return (
    <section className="admin-section">
      <div className="btn-row spread" style={{ marginTop: 0, marginBottom: 16 }}>
        <h3 style={{ margin: 0 }}>Itens</h3>
        <button className="btn btn-primary" onClick={onNew}>
          + Novo item
        </button>
      </div>

      {items.length === 0 && <p className="empty-hint">Nenhum item cadastrado ainda.</p>}

      {sortedCats.map((c) => {
        const catItems = items
          .filter((i) => i.category_id === c.id)
          .sort((a, b) => a.sort_order - b.sort_order);
        if (catItems.length === 0) return null;
        return (
          <div key={c.id} style={{ marginBottom: 6 }}>
            <p
              style={{
                fontSize: 11,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--ink-soft)',
                fontWeight: 700,
                margin: '14px 0 4px',
              }}
            >
              {c.name}
            </p>
            {catItems.map((item) => (
              <div className="item-row" key={item.id}>
                {item.photo_url ? (
                  <img className="thumb-mini" src={item.photo_url} alt="" />
                ) : (
                  <div className="thumb-mini-ph" />
                )}
                <span className="item-row-name">
                  {item.name}
                  <small>{formatPrice(item.price)}</small>
                </span>
                <button
                  type="button"
                  className={`toggle ${item.visible ? 'on' : ''}`}
                  title="Visível no cardápio"
                  aria-pressed={item.visible}
                  aria-label={item.visible ? `Ocultar ${item.name} do cardápio` : `Mostrar ${item.name} no cardápio`}
                  onClick={() => handleToggle(item)}
                />
                <button className="icon-btn" title="Editar" aria-label={`Editar ${item.name}`} onClick={() => onEdit(item)}>
                  ✎
                </button>
              </div>
            ))}
          </div>
        );
      })}
    </section>
  );
}
