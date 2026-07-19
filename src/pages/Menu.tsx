import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchCategories, fetchItems } from '../lib/api';
import type { Category, Item } from '../lib/types';
import ItemCard from '../components/ItemCard';
import { useTheme } from '../lib/useTheme';
import { useFontScale } from '../lib/useFontScale';

export default function Menu() {
  const { theme, toggleTheme } = useTheme();
  const { scale, setScale } = useFontScale();
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [showPhotos, setShowPhotos] = useState<boolean>(() => {
    try {
      return localStorage.getItem('tucunduva:showPhotos') !== 'false';
    } catch {
      return true;
    }
  });
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const pillRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const isClickScrolling = useRef(false);
  const clickScrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [cats, its] = await Promise.all([fetchCategories(), fetchItems()]);
        setCategories(cats);
        setItems(its);
      } catch (e) {
        console.error(e);
        setError('Não foi possível carregar o cardápio agora. Tente novamente em instantes.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const visibleCats = useMemo(() => {
    return [...categories]
      .sort((a, b) => a.sort_order - b.sort_order)
      .filter((c) => items.some((i) => i.category_id === c.id && i.visible));
  }, [categories, items]);

  useEffect(() => {
  if (visibleCats.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      if (isClickScrolling.current) return;

      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id.replace('sec-', '');
          setActiveCat(id);
        }
      });
    },
    { rootMargin: '-30% 0px -60% 0px' }
  );

  visibleCats.forEach((c) => {
    const el = sectionRefs.current[c.id];
    if (el) observer.observe(el);
  });

  return () => observer.disconnect();
}, [visibleCats]);

useEffect(() => {
  if (!activeCat) return;

  pillRefs.current[activeCat]?.scrollIntoView({
    behavior: 'smooth',
    inline: 'center',
    block: 'nearest',
  });
}, [activeCat]);

useEffect(() => {
  try {
    localStorage.setItem('tucunduva:showPhotos', String(showPhotos));
  } catch {
    /* localStorage indisponível (modo privado, etc.) — sem problema, só não persiste */
  }
}, [showPhotos]);

useEffect(() => {
  return () => {
    if (clickScrollTimeout.current) clearTimeout(clickScrollTimeout.current);
  };
}, []);

function itemsFor(catId: string): Item[] {
    return items
      .filter((i) => i.category_id === catId && i.visible)
      .sort((a, b) => a.sort_order - b.sort_order);
  }

  function scrollToCat(id: string) {
    isClickScrolling.current = true;
    setActiveCat(id);
    sectionRefs.current[id]?.scrollIntoView({ behavior: 'auto', block: 'start' });

    if (clickScrollTimeout.current) clearTimeout(clickScrollTimeout.current);
    clickScrollTimeout.current = setTimeout(() => {
      isClickScrolling.current = false;
    }, 150);
  }

  return (
    <div>
      <header className="site-header">
        <div className="header-inner">
          <p className="eyebrow">Fazenda Tucunduva</p>
          <h1>Cardápio</h1>
          <p className="tagline">Da terra à mesa, todos os dias.</p>

          <div className="view-toggle" role="group" aria-label="Modo de exibição do cardápio">
            <button
              type="button"
              className={`view-toggle-btn ${showPhotos ? 'active' : ''}`}
              aria-pressed={showPhotos}
              onClick={() => setShowPhotos(true)}
            >
              Ilustrado
            </button>
            <button
              type="button"
              className={`view-toggle-btn ${!showPhotos ? 'active' : ''}`}
              aria-pressed={!showPhotos}
              onClick={() => setShowPhotos(false)}
            >
              Clássico
            </button>
          </div>

          <div className="a11y-bar">
            <div className="font-scale" role="group" aria-label="Tamanho da letra">
              <button
                type="button"
                className={`font-scale-btn ${scale === 'normal' ? 'active' : ''}`}
                aria-pressed={scale === 'normal'}
                aria-label="Letra tamanho normal"
                onClick={() => setScale('normal')}
              >
                A
              </button>
              <button
                type="button"
                className={`font-scale-btn font-scale-md ${scale === 'grande' ? 'active' : ''}`}
                aria-pressed={scale === 'grande'}
                aria-label="Letra grande"
                onClick={() => setScale('grande')}
              >
                A
              </button>
              <button
                type="button"
                className={`font-scale-btn font-scale-lg ${scale === 'maior' ? 'active' : ''}`}
                aria-pressed={scale === 'maior'}
                aria-label="Letra maior"
                onClick={() => setScale('maior')}
              >
                A
              </button>
            </div>

            <button
              type="button"
              className="theme-toggle-btn"
              aria-pressed={theme === 'dark'}
              aria-label={theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
              onClick={toggleTheme}
            >
              {theme === 'dark' ? '☀︎' : '☾'}
            </button>
          </div>
        </div>
      </header>

      {!loading && !error && visibleCats.length > 0 && (
        <nav className="cat-nav">
          {visibleCats.map((c) => (
          <button
            key={c.id}
            ref={(el) => {
              pillRefs.current[c.id] = el;
            }}
            className={`cat-pill ${activeCat === c.id ? 'active' : ''}`}
            onClick={() => scrollToCat(c.id)}
          >
            {c.name}
          </button>
          ))}
        </nav>
      )}

      <main className="menu-main">
        {loading && (
          <div className="skeleton-wrap" aria-label="Carregando cardápio" role="status">
            {[0, 1].map((section) => (
              <div key={section} className="cat-section">
                <div className="skeleton skeleton-title" />
                {[0, 1, 2].map((row) => (
                  <div key={row} className="item-card">
                    {showPhotos && <div className="skeleton skeleton-photo" />}
                    <div className="item-body">
                      <div className="skeleton skeleton-line" style={{ width: '55%' }} />
                      <div className="skeleton skeleton-line" style={{ width: '85%' }} />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="empty-state">
            <h2>Ops</h2>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && visibleCats.length === 0 && (
          <div className="empty-state">
            <h2>Em breve</h2>
            <p>O cardápio está sendo preparado.</p>
          </div>
        )}

        {!loading &&
          !error &&
          visibleCats.map((c) => (
            <section
              key={c.id}
              id={`sec-${c.id}`}
              className="cat-section"
              ref={(el) => {
                sectionRefs.current[c.id] = el;
              }}
            >
              <div className="cat-section-head">
                <h2>{c.name}</h2>
                <div className="cat-rule" />
              </div>
              {itemsFor(c.id).map((item) => (
                <ItemCard key={item.id} item={item} compact={!showPhotos} />
              ))}
            </section>
          ))}
      </main>

      <footer className="site-footer">
        <div className="footer-contact">
          <p className="footer-line">Rod. Dom Gabriel Paulino Bueno Couto, km 92,5 — Pedregulho, Cabreúva</p>
          <p className="footer-line">Sábado e domingo, das 12h às 17h</p>
          <p className="footer-line">
            <a href="https://wa.me/5511980435834" target="_blank" rel="noopener noreferrer">
              (11) 98043-5834
            </a>
            {' · '}
            <a
              href="https://instagram.com/fazendatucunduva"
              target="_blank"
              rel="noopener noreferrer"
            >
              @fazendatucunduva
            </a>
          </p>
        </div>
        <Link to="/admin" className="admin-link">
          Área administrativa
        </Link>
      </footer>
    </div>
  );
}
