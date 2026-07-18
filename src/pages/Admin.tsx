import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '../lib/useAdminAuth';
import { useToast } from '../lib/useToast';
import { fetchCategories, fetchItems } from '../lib/api';
import type { Category, Item } from '../lib/types';
import Login from '../components/Login';
import CategoryManager from '../components/CategoryManager';
import ItemManager from '../components/ItemManager';
import ItemFormModal from '../components/ItemFormModal';
import Toast from '../components/Toast';

export default function Admin() {
  const { isAdmin, checking, login, logout } = useAdminAuth();
  const { toastMessage, showToast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [cats, its] = await Promise.all([fetchCategories(), fetchItems()]);
      setCategories(cats);
      setItems(its);
    } catch (e) {
      console.error(e);
      showToast('Não foi possível carregar os dados.');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isAdmin) loadData();
  }, [isAdmin, loadData]);

  if (checking) {
    return (
      <div className="center-page">
        <p className="empty-hint">Verificando sessão…</p>
      </div>
    );
  }

  if (!isAdmin) {
    return <Login onLogin={login} />;
  }

  function openNewItem() {
    setEditingItem(null);
    setModalOpen(true);
  }
  function openEditItem(item: Item) {
    setEditingItem(item);
    setModalOpen(true);
  }
  function closeModal() {
    setModalOpen(false);
    setEditingItem(null);
  }
  async function handleSaved() {
    closeModal();
    await loadData();
  }

  return (
    <div className="admin-page">
      <div className="admin-topbar">
        <h2>Painel administrativo</h2>
        <div className="btn-row">
          <Link to="/" className="btn btn-ghost" style={{ textDecoration: 'none' }}>
            Ver cardápio
          </Link>
          <button className="btn btn-ghost" onClick={logout}>
            Sair
          </button>
        </div>
      </div>

      <div className="admin-content">
        {loading ? (
          <p className="empty-hint">Carregando…</p>
        ) : (
          <>
            <CategoryManager categories={categories} items={items} onChange={loadData} showToast={showToast} />
            <ItemManager
              categories={categories}
              items={items}
              onChange={loadData}
              onEdit={openEditItem}
              onNew={openNewItem}
              showToast={showToast}
            />
          </>
        )}
      </div>

      {modalOpen && (
        <ItemFormModal
          categories={categories}
          items={items}
          editingItem={editingItem}
          onClose={closeModal}
          onSaved={handleSaved}
          showToast={showToast}
        />
      )}

      <Toast message={toastMessage} />
    </div>
  );
}
