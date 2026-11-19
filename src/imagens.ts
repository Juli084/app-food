import type { ImageSourcePropType } from 'react-native';

/*
 * Fotos dos restaurantes e dos pratos, empacotadas com o app. A API guarda só a chave
 * ("picanha"), e o app resolve a foto aqui: não depende de servidor de imagens externo e
 * funciona sem rede depois de instalado. Chave desconhecida volta null, e a tela mostra o
 * monograma do restaurante ou o item sem foto.
 */

const RESTAURANTES: Record<string, ImageSourcePropType> = {
  'brasa-e-cia': require('../assets/restaurantes/brasa-e-cia.webp'),
  'marmitaria-da-vila': require('../assets/restaurantes/marmitaria-da-vila.webp'),
  'chapa-quente': require('../assets/restaurantes/chapa-quente.webp'),
  sakura: require('../assets/restaurantes/sakura.webp'),
  'acai-do-parque': require('../assets/restaurantes/acai-do-parque.webp'),
  'forno-da-esquina': require('../assets/restaurantes/forno-da-esquina.webp'),
};

const PRATOS: Record<string, ImageSourcePropType> = {
  'frango-assado': require('../assets/pratos/frango-assado.webp'),
  picanha: require('../assets/pratos/picanha.webp'),
  'mandioca-frita': require('../assets/pratos/mandioca-frita.webp'),
  'refrigerante-2l': require('../assets/pratos/refrigerante-2l.webp'),
  'marmita-fit-frango': require('../assets/pratos/marmita-fit-frango.webp'),
  'marmita-carne-de-panela': require('../assets/pratos/marmita-carne-de-panela.webp'),
  'marmita-vegetariana': require('../assets/pratos/marmita-vegetariana.webp'),
  'suco-natural': require('../assets/pratos/suco-natural.webp'),
  'smash-duplo': require('../assets/pratos/smash-duplo.webp'),
  'burger-da-casa': require('../assets/pratos/burger-da-casa.webp'),
  'x-salada': require('../assets/pratos/x-salada.webp'),
  'batata-frita': require('../assets/pratos/batata-frita.webp'),
  'refrigerante-lata': require('../assets/pratos/refrigerante-lata.webp'),
  'combinado-20': require('../assets/pratos/combinado-20.webp'),
  'hot-roll': require('../assets/pratos/hot-roll.webp'),
  yakisoba: require('../assets/pratos/yakisoba.webp'),
  'acai-300': require('../assets/pratos/acai-300.webp'),
  'acai-500': require('../assets/pratos/acai-500.webp'),
  'agua-de-coco': require('../assets/pratos/agua-de-coco.webp'),
  'pizza-margherita': require('../assets/pratos/pizza-margherita.webp'),
  'pizza-calabresa': require('../assets/pratos/pizza-calabresa.webp'),
  'pizza-frango-requeijao': require('../assets/pratos/pizza-frango-requeijao.webp'),
};

export function fotoDoRestaurante(chave: string | null): ImageSourcePropType | null {
  return chave ? (RESTAURANTES[chave] ?? null) : null;
}

export function fotoDoPrato(chave: string | null): ImageSourcePropType | null {
  return chave ? (PRATOS[chave] ?? null) : null;
}

/** Chaves conhecidas, para os testes conferirem a API contra as fotos empacotadas. */
export const CHAVES = { restaurantes: Object.keys(RESTAURANTES), pratos: Object.keys(PRATOS) };
