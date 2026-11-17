import { FlatList } from 'react-native';
import { RestaurantItem } from './horizontal';
import { Aviso, SEM_API } from '../Aviso';
import { useDados } from '../../hooks/useDados';
import { contem, type Restaurante } from '../../services/api';

export function Restaurants({ busca }: { busca: string }) {
  const estado = useDados<Restaurante[]>('/restaurants');

  if (estado.tipo === 'carregando') return <Aviso texto="Carregando..." />;
  if (estado.tipo === 'erro') return <Aviso texto={SEM_API} />;

  const restaurantes = estado.dados.filter((restaurante) => contem(restaurante.name, busca));
  if (restaurantes.length === 0) return <Aviso texto="Nenhum restaurante encontrado." />;

  return (
    <FlatList
      data={restaurantes}
      keyExtractor={(restaurante) => restaurante.id}
      renderItem={({ item }) => <RestaurantItem item={item} />}
      horizontal
      contentContainerStyle={{ gap: 14, paddingLeft: 16, paddingRight: 16 }}
      showsHorizontalScrollIndicator={false}
    />
  );
}
