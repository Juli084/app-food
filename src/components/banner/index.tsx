import { useState } from 'react';
import { Image, ScrollView, View, type LayoutChangeEvent } from 'react-native';

const BANNERS = [require('../../assets/banner1.png'), require('../../assets/banner2.png')];

// ScrollView paginado funciona igual no Android, no iOS e na web.
export function Banner() {
  const [largura, setLargura] = useState(0);

  return (
    <View
      className="w-full h-36 md:h-60 rounded-2xl mt-5 mb-4 overflow-hidden"
      onLayout={(event: LayoutChangeEvent) => setLargura(event.nativeEvent.layout.width)}
    >
      <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
        {BANNERS.map((imagem, indice) => (
          <Image
            key={indice}
            source={imagem}
            alt={`Promoção ${indice + 1}`}
            style={{ width: largura }}
            className="h-36 md:h-60 rounded-2xl"
            resizeMode="cover"
          />
        ))}
      </ScrollView>
    </View>
  );
}
