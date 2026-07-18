import { useState } from 'react';
import type { Item } from '../lib/types';

function formatPrice(v: number): string {
  return 'R$ ' + v.toFixed(2).replace('.', ',');
}

export default function ItemCard({ item }: { item: Item }) {
  const [photoFailed, setPhotoFailed] = useState(false);
  const showPhoto = item.photo_url && !photoFailed;

  return (
    <div className="item-card">
      {showPhoto ? (
        <img
          className="item-photo"
          src={item.photo_url!}
          alt={item.name}
          loading="lazy"
          decoding="async"
          onError={() => setPhotoFailed(true)}
        />
      ) : (
        <div className="item-photo-ph">FT</div>
      )}
      <div className="item-body">
        <div className="item-row-top">
          <span className="item-name">{item.name}</span>
          <span className="item-leader" />
          <span className="item-price">{formatPrice(item.price)}</span>
        </div>
        {item.description && <p className="item-desc">{item.description}</p>}
      </div>
    </div>
  );
}