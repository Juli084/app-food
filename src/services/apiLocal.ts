import AsyncStorage from '@react-native-async-storage/async-storage';
import dados from '../../db.json';
import type { Pedido, Produto, Restaurante } from '../dominio/tipos';

/*
 * API da demonstração publicada: restaurantes e cardápio vêm do db.json empacotado, e os
 * pedidos ficam guardados no próprio aparelho. Assim a versão web funciona sem servidor e
 * nenhum pedido de quem testa sai do navegador dela.
 */

const CHAVE_PEDIDOS = 'app-food:pedidos-demonstracao:v1';
const LIMITE_DE_PEDIDOS = 30;

function pedidoValido(item: unknown): item is Pedido {
  if (typeof item !== 'object' || item === null) return false;
  const p = item as Record<string, unknown>;
  return (
    typeof p.id === 'string' &&
    typeof p.restauranteId === 'string' &&
    typeof p.restauranteNome === 'string' &&
    Array.isArray(p.itens) &&
    Number.isInteger(p.total) &&
    typeof p.criadoEm === 'string'
  );
}

async function lerPedidos(): Promise<Pedido[]> {
  try {
    const texto = await AsyncStorage.getItem(CHAVE_PEDIDOS);
    const lista: unknown = texto ? JSON.parse(texto) : [];
    return Array.isArray(lista) ? lista.filter(pedidoValido) : [];
  } catch {
    return [];
  }
}

export const apiLocal = {
  restaurantes: async () => dados.restaurantes as Restaurante[],
  produtos: async () => dados.produtos as Produto[],
  pedidos: lerPedidos,
  criarPedido: async (pedido: Omit<Pedido, 'id'>): Promise<Pedido> => {
    const novo: Pedido = { ...pedido, id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}` };
    const lista = await lerPedidos();
    await AsyncStorage.setItem(CHAVE_PEDIDOS, JSON.stringify([novo, ...lista].slice(0, LIMITE_DE_PEDIDOS)));
    return novo;
  },
};
