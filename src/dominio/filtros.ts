import type { Categoria, Produto, Restaurante } from './tipos';

export interface Filtros {
  busca: string;
  categoria: Categoria | null;
  entregaGratis: boolean;
  ate30Minutos: boolean;
  nota45: boolean;
  ordem: 'relevancia' | 'tempo' | 'taxa' | 'nota';
}

export const FILTROS_INICIAIS: Filtros = {
  busca: '',
  categoria: null,
  entregaGratis: false,
  ate30Minutos: false,
  nota45: false,
  ordem: 'relevancia',
};

export function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();
}

/**
 * A busca encontra o restaurante pelo nome ou por um prato do cardápio: quem digita
 * "picanha" vê os restaurantes que servem picanha.
 */
export function filtrarRestaurantes(
  restaurantes: readonly Restaurante[],
  produtos: readonly Produto[],
  filtros: Filtros,
  favoritos: ReadonlySet<string> = new Set(),
): Restaurante[] {
  const termo = normalizar(filtros.busca);
  const comPrato = new Set(
    termo ? produtos.filter((produto) => normalizar(produto.nome).includes(termo)).map((p) => p.restauranteId) : [],
  );
  const lista = restaurantes.filter((restaurante) => {
    if (termo && !normalizar(restaurante.nome).includes(termo) && !comPrato.has(restaurante.id)) return false;
    if (filtros.categoria && restaurante.categoria !== filtros.categoria) return false;
    if (filtros.entregaGratis && restaurante.taxaEntrega > 0) return false;
    if (filtros.ate30Minutos && restaurante.tempoMax > 30) return false;
    if (filtros.nota45 && restaurante.nota < 4.5) return false;
    return true;
  });
  const ordenar: Record<Filtros['ordem'], (a: Restaurante, b: Restaurante) => number> = {
    // Relevância: favoritos primeiro, depois a nota ponderada pelo número de avaliações.
    relevancia: (a, b) =>
      Number(favoritos.has(b.id)) - Number(favoritos.has(a.id)) || b.nota * Math.log10(b.avaliacoes + 10) - a.nota * Math.log10(a.avaliacoes + 10),
    tempo: (a, b) => a.tempoMax - b.tempoMax,
    taxa: (a, b) => a.taxaEntrega - b.taxaEntrega,
    nota: (a, b) => b.nota - a.nota,
  };
  return [...lista].sort(ordenar[filtros.ordem]);
}

/** Seções do cardápio na ordem em que aparecem nos dados. */
export function agruparPorSecao(produtos: readonly Produto[]): { secao: string; produtos: Produto[] }[] {
  const grupos = new Map<string, Produto[]>();
  for (const produto of produtos) {
    grupos.set(produto.secao, [...(grupos.get(produto.secao) ?? []), produto]);
  }
  return [...grupos].map(([secao, lista]) => ({ secao, produtos: lista }));
}

const formatoReal = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
export function reais(centavos: number): string {
  // O Intl separa "R$" do número com espaço não separável; vira espaço comum.
  return formatoReal.format(centavos / 100).replace(/\s/g, ' ');
}

export function textoDaEntrega(taxa: number): string {
  return taxa === 0 ? 'Entrega grátis' : `Entrega ${reais(taxa)}`;
}
