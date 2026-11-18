/** Valores em centavos, para a soma não acumular erro de ponto flutuante. */
export type Centavos = number;

export type Categoria = 'lanches' | 'brasileira' | 'japonesa' | 'pizza' | 'saudavel' | 'doces';

export const CATEGORIAS: { id: Categoria; nome: string }[] = [
  { id: 'lanches', nome: 'Lanches' },
  { id: 'brasileira', nome: 'Brasileira' },
  { id: 'japonesa', nome: 'Japonesa' },
  { id: 'pizza', nome: 'Pizza' },
  { id: 'saudavel', nome: 'Saudável' },
  { id: 'doces', nome: 'Açaí e doces' },
];

export interface Restaurante {
  id: string;
  nome: string;
  categoria: Categoria;
  nota: number;
  avaliacoes: number;
  tempoMin: number;
  tempoMax: number;
  taxaEntrega: Centavos;
  pedidoMinimo: Centavos;
  capa: string | null;
  bairro: string;
}

export interface Produto {
  id: string;
  restauranteId: string;
  secao: string;
  nome: string;
  descricao: string | null;
  preco: Centavos;
  imagem: string | null;
  emAlta: boolean;
}

export interface ItemDaSacola {
  produtoId: string;
  quantidade: number;
  observacao: string;
}

export interface Pedido {
  id: string;
  restauranteId: string;
  restauranteNome: string;
  itens: { produtoId: string; nome: string; quantidade: number; precoUnitario: Centavos; observacao: string }[];
  subtotal: Centavos;
  taxaEntrega: Centavos;
  total: Centavos;
  endereco: string;
  pagamento: 'pix' | 'cartao' | 'dinheiro';
  criadoEm: string;
}
