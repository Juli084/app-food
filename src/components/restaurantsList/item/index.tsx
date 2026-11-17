import { Image, Text, View } from 'react-native';
import type { Restaurante } from '../../../services/api';

export function RestaurantItem({ item }: { item: Restaurante }) {
  return (
    <View className="flex flex-row items-center justify-start gap-2">
      <Image source={{ uri: item.image }} alt={item.name} className="w-20 h-20 rounded-full" />
      <Text className="text-base text-black leading-4 font-bold" numberOfLines={2}>
        {item.name}
      </Text>
    </View>
  );
}
