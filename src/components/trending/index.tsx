import { FlatList } from 'react-native';
import { CardFood } from './food';
import { Aviso, SEM_API } from '../Aviso';
import { useDados } from '../../hooks/useDados';
import { contem, type Comida } from '../../services/api';

export function TrendingFoods({ busca }: { busca: string }) {
  const estado = useDados<Comida[]>('/foods');

  if (estado.tipo === 'carregando') return <Aviso texto="Carregando..." />;
  if (estado.tipo === 'erro') return <Aviso texto={SEM_API} />;

  const comidas = estado.dados.filter((comida) => contem(comida.name, busca));
  if (comidas.length === 0) return <Aviso texto="Nenhuma comida encontrada." />;

  return (
    <FlatList
      data={comidas}
      keyExtractor={(comida) => comida.id}
      renderItem={({ item }) => <CardFood food={item} />}
      horizontal
      contentContainerStyle={{ gap: 14, paddingLeft: 16, paddingRight: 16 }}
      showsHorizontalScrollIndicator={false}
    />
  );
}
