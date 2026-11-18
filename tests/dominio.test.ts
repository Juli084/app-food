import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { agruparPorSecao, FILTROS_INICIAIS, filtrarRestaurantes, reais, textoDaEntrega } from '../src/dominio/filtros';
import { adicionar, calcularTotais, mudarQuantidade, recomecarCom, restaurarSacola, SACOLA_VAZIA, type Sacola } from '../src/dominio/sacola';
import { CATEGORIAS, type Produto, type Restaurante } from '../src/dominio/tipos';

const dados = JSON.parse(readFileSync('db.json', 'utf-8')) as { restaurantes: Restaurante[]; produtos: Produto[] };
const produtos = new Map(dados.produtos.map((produto) => [produto.id, produto]));
const restaurantes = new Map(dados.restaurantes.map((restaurante) => [restaurante.id, restaurante]));
const produto = (id: string) => produtos.get(id)!;

function adicionarOk(sacola: Sacola, id: string, quantidade = 1, observacao = ''): Sacola {
  const resultado = adicionar(sacola, produto(id), quantidade, observacao);
  if (resultado.tipo !== 'ok') throw new Error('esperava ok');
  return resultado.sacola;
}

describe('dados de exemplo', () => {
  it('não usam nome de rede ou marca registrada', () => {
    const texto = JSON.stringify(dados).toLowerCase();
    for (const marca of ['kfc', "mcdonald", 'outback', 'catupiry', 'coca-cola', 'ifood']) expect(texto).not.toContain(marca);
  });

  it('têm preços em centavos inteiros e produtos de restaurantes que existem', () => {
    const categorias = new Set(CATEGORIAS.map((c) => c.id));
    for (const r of dados.restaurantes) {
      expect(categorias.has(r.categoria), r.id).toBe(true);
      expect(Number.isInteger(r.taxaEntrega) && Number.isInteger(r.pedidoMinimo), r.id).toBe(true);
      expect(r.tempoMin).toBeLessThan(r.tempoMax);
    }
    for (const p of dados.produtos) {
      expect(restaurantes.has(p.restauranteId), p.id).toBe(true);
      expect(Number.isInteger(p.preco) && p.preco > 0, p.id).toBe(true);
    }
  });
});

describe('sacola', () => {
  it('junta o mesmo produto com a mesma observação', () => {
    let sacola = adicionarOk(SACOLA_VAZIA, '301');
    sacola = adicionarOk(sacola, '301', 2);
    sacola = adicionarOk(sacola, '301', 1, 'sem picles');
    expect(sacola.itens).toEqual([
      { produtoId: '301', quantidade: 3, observacao: '' },
      { produtoId: '301', quantidade: 1, observacao: 'sem picles' },
    ]);
  });

  it('não mistura restaurantes e permite recomeçar a sacola', () => {
    const sacola = adicionarOk(SACOLA_VAZIA, '301');
    expect(adicionar(sacola, produto('101'))).toEqual({ tipo: 'outro-restaurante', restauranteAtual: '3' });
    expect(recomecarCom(produto('101'), 2)).toEqual({ restauranteId: '1', itens: [{ produtoId: '101', quantidade: 2, observacao: '' }] });
  });

  it('calcula subtotal, taxa, total e quanto falta para o mínimo', () => {
    const sacola = adicionarOk(SACOLA_VAZIA, '305', 2);
    const totais = calcularTotais(sacola, produtos, restaurantes.get('3'));
    expect(totais).toEqual({ quantidade: 2, subtotal: 1400, taxaEntrega: 499, total: 1899, faltaParaMinimo: 1100 });
  });

  it('remove o item ao chegar a zero e esvazia a sacola sem itens', () => {
    const sacola = adicionarOk(SACOLA_VAZIA, '305');
    expect(mudarQuantidade(sacola, 0, 0)).toEqual(SACOLA_VAZIA);
  });

  it('restaura do aparelho só o que bate com o cardápio', () => {
    const salvo = {
      restauranteId: '3',
      itens: [
        { produtoId: '301', quantidade: 2, observacao: '', preco: 1 },
        { produtoId: '101', quantidade: 1, observacao: '' },
        { produtoId: 'sumiu', quantidade: 1, observacao: '' },
        { produtoId: '305', quantidade: 0, observacao: '' },
      ],
    };
    const sacola = restaurarSacola(salvo, produtos);
    expect(sacola.itens).toEqual([{ produtoId: '301', quantidade: 2, observacao: '' }]);
    expect(calcularTotais(sacola, produtos, restaurantes.get('3')).subtotal).toBe(7380);
    expect(restaurarSacola('lixo', produtos)).toEqual(SACOLA_VAZIA);
  });
});

describe('busca e filtros', () => {
  const nomes = (filtros: Partial<typeof FILTROS_INICIAIS>, favoritos = new Set<string>()) =>
    filtrarRestaurantes(dados.restaurantes, dados.produtos, { ...FILTROS_INICIAIS, ...filtros }, favoritos).map((r) => r.nome);

  it('acha restaurante pelo prato, sem acento', () => {
    expect(nomes({ busca: 'picanha' })).toEqual(['Brasa & Cia']);
    expect(nomes({ busca: 'acai' })).toEqual(['Açaí do Parque']);
  });

  it('filtra por entrega grátis, tempo e nota', () => {
    expect(nomes({ entregaGratis: true }).sort()).toEqual(['Açaí do Parque', 'Marmitaria da Vila']);
    expect(nomes({ ate30Minutos: true })).toEqual(['Açaí do Parque']);
    expect(nomes({ nota45: true })).not.toContain('Forno da Esquina');
  });

  it('ordena por taxa e põe favoritos na frente na relevância', () => {
    expect(nomes({ ordem: 'taxa' }).slice(-1)).toEqual(['Sakura Delivery']);
    expect(nomes({}, new Set(['6']))[0]).toBe('Forno da Esquina');
  });

  it('agrupa o cardápio por seção, na ordem dos dados', () => {
    const secoes = agruparPorSecao(dados.produtos.filter((p) => p.restauranteId === '3')).map((g) => g.secao);
    expect(secoes).toEqual(['Mais pedidos', 'Lanches', 'Porções', 'Bebidas']);
  });

  it('formata reais e a taxa de entrega', () => {
    expect(reais(123456)).toBe('R$ 1.234,56');
    expect(textoDaEntrega(0)).toBe('Entrega grátis');
    expect(textoDaEntrega(599)).toBe('Entrega R$ 5,99');
  });
});
