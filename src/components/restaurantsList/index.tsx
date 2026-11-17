import { View } from 'react-native';
import { RestaurantItem } from './item';
import { Aviso, SEM_API } from '../Aviso';
import { useDados } from '../../hooks/useDados';
import { contem, type Restaurante } from '../../services/api';

export function RestaurantVerticalList({ busca }: { busca: string }) {
  const estado = useDados<Restaurante[]>('/restaurants');

  if (estado.tipo === 'carregando') return <Aviso texto="Carregando..." />;
  if (estado.tipo === 'erro') return <Aviso texto={SEM_API} />;

  const restaurantes = estado.dados.filter((restaurante) => contem(restaurante.name, busca));
  if (restaurantes.length === 0) return <Aviso texto="Nenhum restaurante encontrado." />;

  return (
    <View className="px-4 flex-1 w-full h-full mb-11 gap-4">
      {restaurantes.map((item) => (
        <RestaurantItem item={item} key={item.id} />
      ))}
    </View>
  );
}
