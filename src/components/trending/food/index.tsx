import { Image, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { moeda, type Comida } from '../../../services/api';

export function CardFood({ food }: { food: Comida }) {
  return (
    <View className="flex flex-col rounded-xl relative">
      <Image source={{ uri: food.image }} alt={food.name} className="w-44 h-36 rounded-xl" />

      <View className="flex flex-row bg-neutral-900/80 gap-1 rounded-full absolute top-2 right-3 px-2 py-1">
        <Ionicons name="star" size={15} color="#ca8a04" />
        <Text className="text-white text-sm">{food.rating.toFixed(1)}</Text>
      </View>

      <Text className="text-green-800 font-medium">{moeda.format(food.price)}</Text>
      <Text className="text-black mt-1.5">{food.name}</Text>
      <Text className="text-neutral-700 text-sm">
        {food.time} · entrega {moeda.format(food.delivery)}
      </Text>
    </View>
  );
}
