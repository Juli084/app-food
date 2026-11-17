// Endereço do json-server. No emulador Android use http://10.0.2.2:3000; num
// celular físico, o IP do computador na rede local (ver README).
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export interface Comida {
  id: string;
  name: string;
  price: number;
  time: string;
  delivery: number;
  rating: number;
  image: string;
  restaurantId: string;
}

export interface Restaurante {
  id: string;
  name: string;
  image: string;
}

export async function buscar<T>(caminho: string): Promise<T> {
  const resposta = await fetch(`${API_URL}${caminho}`);
  if (!resposta.ok) throw new Error(`A API respondeu ${resposta.status}`);
  return resposta.json() as Promise<T>;
}

export const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

// Busca sem diferenciar maiúsculas nem acentos.
const normalizar = (texto: string) => texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
export const contem = (texto: string, busca: string) => normalizar(texto).includes(normalizar(busca.trim()));
