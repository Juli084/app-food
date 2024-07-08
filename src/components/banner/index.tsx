import { View, Pressable, Text, Image } from "react-native";
import PagerView from "react-native-pager-view";

export function Banner () {
    return (
        <View className="w-full h-36 md:h-60 rounded-2xl mt-5 mb-4">
            <PagerView style={{ flex: 1}} initialPage={0} pageMargin={12}>
                <Pressable 
                    className="w-full h-36 md:h-60 rounded-2xl" 
                    key="1"
                    onPress={() => console.log("clicou no banner 1")}                
                >
                <Image 
                    source={require("../../assets/banner.png")}
                    className="w-full h-36 md:h-60 rounded-2xl"
                />
                </Pressable>

                <Pressable 
                    className="w-full h-36 md:h-60 rounded-2xl"
                    key="2"
                    onPress={() => console.log("clicou no banner 2")}                
                >
                <Image 
                    source={require("../../assets/banner1.png")}
                    className="w-full h-36 md:h-60 rounded-2xl"
                />
                </Pressable>

                <Pressable 
                    className="w-full h-36 md:h-60 rounded-2xl" 
                    key="3"
                    onPress={() => console.log("clicou no banner 3")}                
                >
                <Image 
                    source={require("../../assets/banner2.png")}
                    className="w-full h-36 md:h-60 rounded-2xl"
                />
                </Pressable>

                <Pressable 
                    className="w-full h-36 md:h-60 rounded-2xl" 
                    key="4"
                    onPress={() => console.log("clicou no banner 4")}                
                >
                <Image 
                    source={require("../../assets/banner3.png")}
                    className="w-full h-36 md:h-60 rounded-2xl"
                />
                </Pressable>
            </PagerView>
        </View>
    );
}