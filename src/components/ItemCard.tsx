import { useState } from 'react';
import type { Item } from '../lib/types';
import { tagLabel } from '../lib/dietaryTags';
import PhotoLightbox from './PhotoLightbox';

function formatPrice(v: number): string {
  return 'R$ ' + v.toFixed(2).replace('.', ',');
}

export default function ItemCard({ item, compact = false }: { item: Item; compact?: boolean }) {
  const [photoFailed, setPhotoFailed] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const showPhoto = !compact && item.photo_url && !photoFailed;

  return (
    <div className={`item-card ${compact ? 'item-card--compact' : ''}`}>
      {!compact &&
        (showPhoto ? (
          <button
            type="button"
            className="item-photo-btn"
            aria-label={`Ver foto de ${item.name} ampliada`}
            onClick={() => setLightboxOpen(true)}
          >
            <img
              className="item-photo"
              src={item.photo_url!}
              alt={item.name}
              loading="lazy"
              decoding="async"
              onError={() => setPhotoFailed(true)}
            />
          </button>
        ) : (
          <div className="item-photo-ph">FT</div>
        ))}
      <div className="item-body">
        <div className="item-row-top">
          <span className="item-name">{item.name}</span>
          <span className="item-leader" />
          <span className="item-price">{formatPrice(item.price)}</span>
        </div>
        {item.description && <p className="item-desc">{item.description}</p>}
        {item.tags && item.tags.length > 0 && (
          <div className="item-tags">
            {item.tags.map((t) => (
              <span key={t} className="item-tag">
                {tagLabel(t)}
              </span>
            ))}
          </div>
        )}
      </div>

      {lightboxOpen && item.photo_url && (
        <PhotoLightbox
          src={item.photo_url}
          alt={item.name}
          caption={`${item.name} · ${formatPrice(item.price)}`}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}
