export interface dietaryTag {
  id: string;
  label: string;
}

/** Lista fixa de tags — mantém o cadastro consistente (evita "Vegano", "vegano ", "VEGANO" como itens diferentes). */
export const DIETARY_TAGS: dietaryTag[] = [
  { id: 'vegetariano', label: 'Vegetariano' },
  { id: 'vegano', label: 'Vegano' },
  { id: 'sem_gluten', label: 'Sem glúten' },
  { id: 'sem_lactose', label: 'Sem lactose' },
  { id: 'picante', label: 'Picante' },
  { id: 'contem_nozes', label: 'Contém nozes/castanhas' },
];

export function tagLabel(id: string): string {
  return DIETARY_TAGS.find((t) => t.id === id)?.label ?? id;
}
