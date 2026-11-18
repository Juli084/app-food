import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  adicionar as adicionarNaSacola,
  calcularTotais,
  mudarQuantidade,
  recomecarCom,
  restaurarSacola,
  SACOLA_VAZIA,
  type ResultadoAoAdicionar,
  type Sacola,
  type Totais,
} from '../dominio/sacola';
import type { Produto, Restaurante } from '../dominio/tipos';
import { api } from '../services/api';

/*
 * Estado compartilhado pelas telas: o catálogo (restaurantes e produtos, carregados uma
 * vez), a sacola e os favoritos. Sacola e favoritos ficam guardados no aparelho.
 */

const CHAVE_SACOLA = 'app-food:sacola';
const CHAVE_FAVORITOS = 'app-food:favoritos';

type Catalogo =
  | { estado: 'carregando' }
  | { estado: 'erro' }
  | { estado: 'ok'; restaurantes: Restaurante[]; produtos: Produto[] };

interface ValorDaLoja {
  catalogo: Catalogo;
  recarregar: () => void;
  restaurantesPorId: ReadonlyMap<string, Restaurante>;
  produtosPorId: ReadonlyMap<string, Produto>;
  sacola: Sacola;
  totais: Totais;
  adicionar: (produto: Produto, quantidade?: number, observacao?: string) => ResultadoAoAdicionar;
  trocarSacolaPor: (produto: Produto, quantidade?: number, observacao?: string) => void;
  mudarQuantidade: (indice: number, quantidade: number) => void;
  esvaziar: () => void;
  definirSacola: (sacola: Sacola) => void;
  favoritos: ReadonlySet<string>;
  alternarFavorito: (restauranteId: string) => void;
}

const Contexto = createContext<ValorDaLoja | null>(null);

async function lerJson(chave: string): Promise<unknown> {
  try {
    const texto = await AsyncStorage.getItem(chave);
    return texto ? JSON.parse(texto) : null;
  } catch {
    return null;
  }
}

function gravarJson(chave: string, valor: unknown) {
  AsyncStorage.setItem(chave, JSON.stringify(valor)).catch(() => {
    // Sem armazenamento, o app funciona; só não lembra na próxima vez.
  });
}

export function ProvedorDaLoja({ children }: { children: ReactNode }) {
  const [catalogo, setCatalogo] = useState<Catalogo>({ estado: 'carregando' });
  const [tentativa, setTentativa] = useState(0);
  const [sacola, setSacola] = useState<Sacola>(SACOLA_VAZIA);
  const [favoritos, setFavoritos] = useState<ReadonlySet<string>>(new Set());
  const [restaurado, setRestaurado] = useState(false);

  useEffect(() => {
    let cancelado = false;
    Promise.all([api.restaurantes(), api.produtos()])
      .then(async ([restaurantes, produtos]) => {
        if (cancelado) return;
        setCatalogo({ estado: 'ok', restaurantes, produtos });
        // A sacola salva só é restaurada depois do catálogo, para ser conferida contra ele.
        const [sacolaSalva, favoritosSalvos] = await Promise.all([lerJson(CHAVE_SACOLA), lerJson(CHAVE_FAVORITOS)]);
        if (cancelado) return;
        setSacola(restaurarSacola(sacolaSalva, new Map(produtos.map((p) => [p.id, p]))));
        const ids = new Set(restaurantes.map((r) => r.id));
        setFavoritos(new Set(Array.isArray(favoritosSalvos) ? favoritosSalvos.filter((id): id is string => typeof id === 'string' && ids.has(id)) : []));
        setRestaurado(true);
      })
      .catch(() => {
        if (!cancelado) setCatalogo({ estado: 'erro' });
      });
    return () => {
      cancelado = true;
    };
  }, [tentativa]);

  useEffect(() => {
    if (restaurado) gravarJson(CHAVE_SACOLA, sacola);
  }, [sacola, restaurado]);

  useEffect(() => {
    if (restaurado) gravarJson(CHAVE_FAVORITOS, [...favoritos]);
  }, [favoritos, restaurado]);

  const restaurantesPorId = useMemo(
    () => new Map(catalogo.estado === 'ok' ? catalogo.restaurantes.map((r) => [r.id, r]) : []),
    [catalogo],
  );
  const produtosPorId = useMemo(
    () => new Map(catalogo.estado === 'ok' ? catalogo.produtos.map((p) => [p.id, p]) : []),
    [catalogo],
  );

  const adicionar = useCallback(
    (produto: Produto, quantidade = 1, observacao = '') => {
      const resultado = adicionarNaSacola(sacola, produto, quantidade, observacao);
      if (resultado.tipo === 'ok') setSacola(resultado.sacola);
      return resultado;
    },
    [sacola],
  );

  const valor: ValorDaLoja = {
    catalogo,
    recarregar: () => {
      setCatalogo({ estado: 'carregando' });
      setTentativa((n) => n + 1);
    },
    restaurantesPorId,
    produtosPorId,
    sacola,
    totais: calcularTotais(sacola, produtosPorId, sacola.restauranteId ? restaurantesPorId.get(sacola.restauranteId) : undefined),
    adicionar,
    trocarSacolaPor: (produto, quantidade = 1, observacao = '') => setSacola(recomecarCom(produto, quantidade, observacao)),
    mudarQuantidade: (indice, quantidade) => setSacola((atual) => mudarQuantidade(atual, indice, quantidade)),
    esvaziar: () => setSacola(SACOLA_VAZIA),
    definirSacola: setSacola,
    favoritos,
    alternarFavorito: (id) =>
      setFavoritos((atuais) => {
        const novos = new Set(atuais);
        if (novos.has(id)) novos.delete(id);
        else novos.add(id);
        return novos;
      }),
  };

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useLoja(): ValorDaLoja {
  const valor = useContext(Contexto);
  if (!valor) throw new Error('useLoja fora do ProvedorDaLoja');
  return valor;
}
