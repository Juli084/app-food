import { View, Pressable, Text, Image } from "react-native";
import PagerView from "react-native-pager-view";

export default function Banner() {
 return (
   <View className="w-full h-36 rounded-2xl mt-5 mb-4">
        <PagerView style={{ flex: 1 }} initialPage={0} pageMargin={14}>
          <Pressable
            className="w-full h-36 rounded-2xl"
            key="1"
            onPress={() => console.log("clicou")}
          >
            <Image
              source={require("../../assets/foto1.png")}
              className="w-full h-36 rounded-2xl"
            />
          </Pressable>
        </PagerView>
   </View>
 );
}