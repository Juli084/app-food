import type { Centavos, ItemDaSacola, Produto, Restaurante } from './tipos';

/*
 * A sacola tem itens de um restaurante só, como nos apps de delivery: cada restaurante
 * entrega o próprio pedido. Adicionar de outro restaurante pede para trocar a sacola.
 */

export const QUANTIDADE_MAXIMA = 20;

export interface Sacola {
  restauranteId: string | null;
  itens: ItemDaSacola[];
}

export const SACOLA_VAZIA: Sacola = { restauranteId: null, itens: [] };

export type ResultadoAoAdicionar = { tipo: 'ok'; sacola: Sacola } | { tipo: 'outro-restaurante'; restauranteAtual: string };

export function adicionar(sacola: Sacola, produto: Produto, quantidade = 1, observacao = ''): ResultadoAoAdicionar {
  if (sacola.restauranteId && sacola.restauranteId !== produto.restauranteId && sacola.itens.length > 0) {
    return { tipo: 'outro-restaurante', restauranteAtual: sacola.restauranteId };
  }
  const obs = observacao.trim().slice(0, 140);
  const existente = sacola.itens.find((item) => item.produtoId === produto.id && item.observacao === obs);
  const itens = existente
    ? sacola.itens.map((item) =>
        item === existente ? { ...item, quantidade: Math.min(QUANTIDADE_MAXIMA, item.quantidade + quantidade) } : item,
      )
    : [...sacola.itens, { produtoId: produto.id, quantidade: Math.min(QUANTIDADE_MAXIMA, quantidade), observacao: obs }];
  return { tipo: 'ok', sacola: { restauranteId: produto.restauranteId, itens } };
}

/** Troca a sacola inteira pelo produto de outro restaurante. */
export function recomecarCom(produto: Produto, quantidade = 1, observacao = ''): Sacola {
  const resultado = adicionar(SACOLA_VAZIA, produto, quantidade, observacao);
  return resultado.tipo === 'ok' ? resultado.sacola : SACOLA_VAZIA;
}

export function mudarQuantidade(sacola: Sacola, indice: number, quantidade: number): Sacola {
  const itens =
    quantidade <= 0
      ? sacola.itens.filter((_, i) => i !== indice)
      : sacola.itens.map((item, i) => (i === indice ? { ...item, quantidade: Math.min(QUANTIDADE_MAXIMA, quantidade) } : item));
  return itens.length === 0 ? SACOLA_VAZIA : { ...sacola, itens };
}

export interface Totais {
  quantidade: number;
  subtotal: Centavos;
  taxaEntrega: Centavos;
  total: Centavos;
  /** Quanto falta para o pedido mínimo do restaurante; 0 quando já passou. */
  faltaParaMinimo: Centavos;
}

export function calcularTotais(sacola: Sacola, produtos: ReadonlyMap<string, Produto>, restaurante: Restaurante | undefined): Totais {
  let subtotal = 0;
  let quantidade = 0;
  for (const item of sacola.itens) {
    const produto = produtos.get(item.produtoId);
    if (!produto) continue;
    subtotal += produto.preco * item.quantidade;
    quantidade += item.quantidade;
  }
  const taxaEntrega = restaurante && quantidade > 0 ? restaurante.taxaEntrega : 0;
  return {
    quantidade,
    subtotal,
    taxaEntrega,
    total: subtotal + taxaEntrega,
    faltaParaMinimo: restaurante ? Math.max(0, restaurante.pedidoMinimo - subtotal) : 0,
  };
}

/**
 * Sacola salva no aparelho, conferida contra o cardápio atual: produto que saiu, de outro
 * restaurante ou quantidade estranha é descartado. O preço nunca vem do que foi salvo.
 */
export function restaurarSacola(bruto: unknown, produtos: ReadonlyMap<string, Produto>): Sacola {
  if (typeof bruto !== 'object' || bruto === null) return SACOLA_VAZIA;
  const { restauranteId, itens } = bruto as { restauranteId?: unknown; itens?: unknown };
  if (typeof restauranteId !== 'string' || !Array.isArray(itens)) return SACOLA_VAZIA;
  const validos: ItemDaSacola[] = [];
  for (const item of itens.slice(0, 50)) {
    if (typeof item !== 'object' || item === null) continue;
    const { produtoId, quantidade, observacao } = item as Record<string, unknown>;
    if (typeof produtoId !== 'string' || typeof quantidade !== 'number' || typeof observacao !== 'string') continue;
    const produto = produtos.get(produtoId);
    if (!produto || produto.restauranteId !== restauranteId) continue;
    if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > QUANTIDADE_MAXIMA) continue;
    validos.push({ produtoId, quantidade, observacao: observacao.slice(0, 140) });
  }
  return validos.length ? { restauranteId, itens: validos } : SACOLA_VAZIA;
}
