import { Feather } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Carregando } from '../components/comuns';
import { useLoja } from '../contexto/Loja';
import { reais } from '../dominio/filtros';
import { adicionar, SACOLA_VAZIA } from '../dominio/sacola';
import type { Pedido } from '../dominio/tipos';
import { api } from '../services/api';

const NOMES_DO_PAGAMENTO: Record<Pedido['pagamento'], string> = { pix: 'Pix', cartao: 'Cartão', dinheiro: 'Dinheiro' };

function quando(iso: string): string {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}

export default function TelaDePedidos() {
  const { novo } = useLocalSearchParams<{ novo?: string }>();
  const { produtosPorId, definirSacola } = useLoja();
  const [pedidos, setPedidos] = useState<Pedido[] | null>(null);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    let cancelado = false;
    api
      .pedidos()
      .then((lista) => {
        if (!cancelado) setPedidos([...lista].sort((a, b) => b.criadoEm.localeCompare(a.criadoEm)));
      })
      .catch(() => {
        if (!cancelado) setErro(true);
      });
    return () => {
      cancelado = true;
    };
  }, []);

  function pedirDeNovo(pedido: Pedido) {
    // O preço vem do cardápio de hoje, não do pedido antigo; item que saiu do cardápio fica de fora.
    let sacola = SACOLA_VAZIA;
    for (const item of pedido.itens) {
      const produto = produtosPorId.get(item.produtoId);
      if (!produto) continue;
      const resultado = adicionar(sacola, produto, item.quantidade, item.observacao);
      if (resultado.tipo === 'ok') sacola = resultado.sacola;
    }
    definirSacola(sacola);
    router.push('/sacola');
  }

  return (
    <View className="flex-1 bg-fundo">
      <View className="flex-row items-center gap-2 border-b border-linha bg-white px-3 pb-3" style={{ paddingTop: Constants.statusBarHeight + 8 }}>
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          className="h-11 w-11 items-center justify-center"
        >
          <Feather name="arrow-left" size={20} color="#1f1d1a" />
        </Pressable>
        <Text accessibilityRole="header" className="text-lg font-bold text-tinta">
          Meus pedidos
        </Text>
      </View>

      {erro ? (
        <Text className="p-6 text-center text-suave">Não deu para carregar os pedidos.</Text>
      ) : pedidos === null ? (
        <Carregando />
      ) : pedidos.length === 0 ? (
        <Text className="p-6 text-center text-suave">Você ainda não fez nenhum pedido.</Text>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
          {novo ? (
            <View accessibilityRole="alert" className="flex-row items-center gap-3 rounded-2xl bg-[#e6f4ea] p-4">
              <Feather name="check-circle" size={22} color="#2b8a3e" />
              <Text className="flex-1 font-semibold text-[#1e6b30]">Pedido enviado ao restaurante.</Text>
            </View>
          ) : null}
          {pedidos.map((pedido) => (
            <View key={pedido.id} className={`rounded-2xl bg-white p-4 ${pedido.id === novo ? 'border-2 border-verde' : ''}`}>
              <View className="flex-row items-center justify-between">
                <Text className="text-base font-bold text-tinta">{pedido.restauranteNome}</Text>
                <Text className="text-sm text-suave">{quando(pedido.criadoEm)}</Text>
              </View>
              {pedido.itens.map((item) => (
                <Text key={`${item.produtoId}-${item.observacao}`} className="mt-1 text-sm text-suave">
                  {item.quantidade}x {item.nome}
                </Text>
              ))}
              <View className="mt-3 flex-row items-center justify-between">
                <Text className="font-semibold text-tinta">
                  {reais(pedido.total)} · {NOMES_DO_PAGAMENTO[pedido.pagamento]}
                </Text>
                <Pressable onPress={() => pedirDeNovo(pedido)} accessibilityRole="button" className="rounded-xl border border-marca px-3 py-2">
                  <Text className="font-semibold text-marca">Pedir de novo</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
