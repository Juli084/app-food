import type { Pedido, Produto, Restaurante } from '../dominio/tipos';
import { apiLocal } from './apiLocal';

// Endereço do json-server. No emulador Android use http://10.0.2.2:3000; num
// celular físico, o IP do computador na rede local (ver README).
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

/** Na demonstração publicada (EXPO_PUBLIC_MODO=demonstracao), o app não chama servidor nenhum. */
export const MODO_DEMONSTRACAO = process.env.EXPO_PUBLIC_MODO === 'demonstracao';

async function pedir<T>(caminho: string, opcoes?: RequestInit): Promise<T> {
  const resposta = await fetch(`${API_URL}${caminho}`, opcoes);
  if (!resposta.ok) throw new Error(`A API respondeu ${resposta.status}`);
  return resposta.json() as Promise<T>;
}

const apiRemota = {
  restaurantes: () => pedir<Restaurante[]>('/restaurantes'),
  produtos: () => pedir<Produto[]>('/produtos'),
  pedidos: () => pedir<Pedido[]>('/pedidos'),
  criarPedido: (pedido: Omit<Pedido, 'id'>) =>
    pedir<Pedido>('/pedidos', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(pedido),
    }),
};

export const api = MODO_DEMONSTRACAO ? apiLocal : apiRemota;
