import { Text } from 'react-native';

export function Aviso({ texto }: { texto: string }) {
  return <Text className="px-4 text-neutral-700">{texto}</Text>;
}

export const SEM_API = 'Não foi possível carregar. Confira se a API (npm run api) está rodando.';
