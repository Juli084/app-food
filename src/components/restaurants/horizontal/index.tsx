import { Pressable, Text } from "react-native";
import { RestaurantsProps } from "..";

export function RestaurantItem({ item }: {item: RestaurantsProps }) {
 return (
   <Pressable>
        <Text>{item.name}</Text>
   </Pressable>
 );
}