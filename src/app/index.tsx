import { Feather, Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { BarraDaSacola, CartaoRestaurante, Carregando, FalhaNaApi } from '../components/comuns';
import { useLoja } from '../contexto/Loja';
import { FILTROS_INICIAIS, filtrarRestaurantes, reais, type Filtros } from '../dominio/filtros';
import { CATEGORIAS } from '../dominio/tipos';

const ORDENS: { valor: Filtros['ordem']; nome: string }[] = [
  { valor: 'relevancia', nome: 'Relevância' },
  { valor: 'tempo', nome: 'Mais rápidos' },
  { valor: 'taxa', nome: 'Menor taxa' },
  { valor: 'nota', nome: 'Melhor nota' },
];

function Chip({ rotulo, ativo, onPress }: { rotulo: string; ativo: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: ativo }}
      className={`rounded-full border px-3.5 py-2 ${ativo ? 'border-tinta bg-tinta' : 'border-linha bg-white'}`}
    >
      <Text className={`text-sm font-medium ${ativo ? 'text-white' : 'text-tinta'}`}>{rotulo}</Text>
    </Pressable>
  );
}

export default function Inicio() {
  const { catalogo, favoritos } = useLoja();
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_INICIAIS);
  const mudar = (mudanca: Partial<Filtros>) => setFiltros((atuais) => ({ ...atuais, ...mudanca }));

  const restaurantes = useMemo(
    () => (catalogo.estado === 'ok' ? filtrarRestaurantes(catalogo.restaurantes, catalogo.produtos, filtros, favoritos) : []),
    [catalogo, filtros, favoritos],
  );
  const emAlta = catalogo.estado === 'ok' ? catalogo.produtos.filter((produto) => produto.emAlta && produto.imagem) : [];
  const filtrando = filtros.busca.trim() !== '' || filtros.categoria !== null || filtros.entregaGratis || filtros.ate30Minutos || filtros.nota45;
  const ordemAtual = ORDENS.find((ordem) => ordem.valor === filtros.ordem) ?? ORDENS[0]!;

  return (
    <View className="flex-1 bg-fundo">
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
        <View className="px-4" style={{ paddingTop: Constants.statusBarHeight + 12 }}>
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-xs text-suave">Entregando em</Text>
              <View className="flex-row items-center gap-1">
                <Feather name="map-pin" size={14} color="#d9480f" />
                <Text className="text-base font-bold text-tinta">Sorocaba - SP</Text>
              </View>
            </View>
            <Pressable
              onPress={() => router.push('/pedidos')}
              accessibilityRole="button"
              className="flex-row items-center gap-1.5 rounded-full border border-linha bg-white px-3 py-2"
            >
              <Feather name="file-text" size={15} color="#1f1d1a" />
              <Text className="text-sm font-medium text-tinta">Meus pedidos</Text>
            </Pressable>
          </View>

          <View className="mt-4 flex-row items-center gap-2 rounded-2xl border border-linha bg-white px-3">
            <Feather name="search" size={18} color="#6b6660" />
            <TextInput
              value={filtros.busca}
              onChangeText={(busca) => mudar({ busca })}
              placeholder="Buscar restaurante ou prato"
              placeholderTextColor="#9b958d"
              accessibilityLabel="Buscar restaurante ou prato"
              className="h-12 flex-1 text-base text-tinta"
            />
            {filtros.busca ? (
              <Pressable onPress={() => mudar({ busca: '' })} accessibilityLabel="Limpar busca" className="h-10 w-10 items-center justify-center">
                <Feather name="x" size={18} color="#6b6660" />
              </Pressable>
            ) : null}
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingVertical: 14 }}>
          {CATEGORIAS.map((categoria) => (
            <Chip
              key={categoria.id}
              rotulo={categoria.nome}
              ativo={filtros.categoria === categoria.id}
              onPress={() => mudar({ categoria: filtros.categoria === categoria.id ? null : categoria.id })}
            />
          ))}
        </ScrollView>

        {!filtrando ? (
          <Pressable
            onPress={() => mudar({ entregaGratis: true })}
            accessibilityRole="button"
            className="mx-4 mb-2 flex-row items-center gap-3 rounded-2xl bg-marca px-4 py-4"
          >
            <Ionicons name="bicycle" size={30} color="#ffffff" />
            <View className="flex-1">
              <Text className="text-base font-bold text-white">Entrega grátis perto de você</Text>
              <Text className="text-sm text-white/90">Veja os restaurantes que não cobram taxa</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#ffffff" />
          </Pressable>
        ) : null}

        {catalogo.estado === 'carregando' ? <Carregando /> : null}
        {catalogo.estado === 'erro' ? <FalhaNaApi /> : null}

        {catalogo.estado === 'ok' && !filtrando && emAlta.length > 0 ? (
          <View className="mt-3">
            <Text className="px-4 text-xl font-bold text-tinta">Em alta hoje</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingHorizontal: 16, paddingTop: 10 }}>
              {emAlta.map((produto) => (
                <Pressable
                  key={produto.id}
                  onPress={() => router.push({ pathname: '/restaurante/[id]', params: { id: produto.restauranteId, produto: produto.id } })}
                  accessibilityRole="button"
                  accessibilityLabel={`${produto.nome}, ${reais(produto.preco)}`}
                  className="w-40"
                >
                  <Image source={{ uri: produto.imagem! }} alt="" className="h-32 w-40 rounded-2xl bg-linha" />
                  <Text className="mt-1.5 font-semibold text-tinta" numberOfLines={1}>
                    {produto.nome}
                  </Text>
                  <Text className="text-sm text-suave">{reais(produto.preco)}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ) : null}

        {catalogo.estado === 'ok' ? (
          <View className="mt-6 px-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-bold text-tinta">Restaurantes</Text>
              <Pressable
                onPress={() => {
                  const indice = ORDENS.findIndex((ordem) => ordem.valor === filtros.ordem);
                  mudar({ ordem: ORDENS[(indice + 1) % ORDENS.length]!.valor });
                }}
                accessibilityRole="button"
                accessibilityLabel={`Ordenar: ${ordemAtual.nome}. Toque para trocar`}
                className="flex-row items-center gap-1 py-2"
              >
                <Feather name="sliders" size={14} color="#6b6660" />
                <Text className="text-sm text-suave">{ordemAtual.nome}</Text>
              </Pressable>
            </View>
            <View className="mt-2 flex-row flex-wrap gap-2">
              <Chip rotulo="Entrega grátis" ativo={filtros.entregaGratis} onPress={() => mudar({ entregaGratis: !filtros.entregaGratis })} />
              <Chip rotulo="Até 30 min" ativo={filtros.ate30Minutos} onPress={() => mudar({ ate30Minutos: !filtros.ate30Minutos })} />
              <Chip rotulo="Nota 4,5+" ativo={filtros.nota45} onPress={() => mudar({ nota45: !filtros.nota45 })} />
            </View>
            <View className="mt-2">
              {restaurantes.length === 0 ? (
                <View className="items-center py-10">
                  <Text className="text-base font-semibold text-tinta">Nenhum restaurante com esses filtros.</Text>
                  <Pressable onPress={() => setFiltros(FILTROS_INICIAIS)} accessibilityRole="button" className="mt-3 py-2">
                    <Text className="font-semibold text-marca">Limpar filtros</Text>
                  </Pressable>
                </View>
              ) : (
                restaurantes.map((restaurante) => (
                  <CartaoRestaurante
                    key={restaurante.id}
                    restaurante={restaurante}
                    onAbrir={() => router.push({ pathname: '/restaurante/[id]', params: { id: restaurante.id } })}
                  />
                ))
              )}
            </View>
          </View>
        ) : null}
      </ScrollView>
      <BarraDaSacola onAbrir={() => router.push('/sacola')} />
    </View>
  );
}
