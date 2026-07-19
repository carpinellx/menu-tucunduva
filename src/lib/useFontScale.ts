import { useEffect, useState } from 'react';

export type FontScale = 'normal' | 'grande' | 'maior';

function getInitialScale(): FontScale {
  try {
    const saved = localStorage.getItem('tucunduva:fontScale');
    if (saved === 'normal' || saved === 'grande' || saved === 'maior') return saved;
  } catch {
    /* localStorage indisponível — segue com o padrão */
  }
  return 'normal';
}

export function useFontScale() {
  const [scale, setScale] = useState<FontScale>(getInitialScale);

  useEffect(() => {
    document.documentElement.setAttribute('data-fontsize', scale);
    try {
      localStorage.setItem('tucunduva:fontScale', scale);
    } catch {
      /* sem problema, só não persiste entre visitas */
    }
  }, [scale]);

  return { scale, setScale };
}
