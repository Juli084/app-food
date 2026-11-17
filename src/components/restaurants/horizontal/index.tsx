import { Image, Text, View } from 'react-native';
import type { Restaurante } from '../../../services/api';

export function RestaurantItem({ item }: { item: Restaurante }) {
  return (
    <View className="flex flex-col items-center justify-center">
      <Image source={{ uri: item.image }} alt={item.name} className="w-20 h-20 rounded-full" />
      <Text className="text-sm mt-2 w-20 text-center leading-4 text-black" numberOfLines={2}>
        {item.name}
      </Text>
    </View>
  );
}
