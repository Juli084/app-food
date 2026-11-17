import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import Constants from 'expo-constants';

import { Header } from '../components/header';
import { Banner } from '../components/banner';
import { Search } from '../components/search';
import { Section } from '../components/section';
import { TrendingFoods } from '../components/trending';
import { Restaurants } from '../components/restaurants';
import { RestaurantVerticalList } from '../components/restaurantsList';

const statusBarHeight = Constants.statusBarHeight;

export default function Index() {
  const [busca, setBusca] = useState('');

  return (
    <ScrollView style={{ flex: 1 }} className="bg-slate-200" showsVerticalScrollIndicator={false}>
      <View className="w-full px-4" style={{ marginTop: statusBarHeight + 8 }}>
        <Header />
        <Banner />
        <Search valor={busca} aoMudar={setBusca} />
      </View>

      <Section name="Comidas em alta" size="text-2xl" />
      <TrendingFoods busca={busca} />

      <Section name="Famosos" size="text-xl" />
      <Restaurants busca={busca} />

      <Section name="Restaurantes" size="text-xl" />
      <RestaurantVerticalList busca={busca} />
    </ScrollView>
  );
}
