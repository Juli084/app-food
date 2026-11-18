import { Feather } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useLoja } from '../contexto/Loja';
import { reais } from '../dominio/filtros';
import type { Pedido } from '../dominio/tipos';
import { api } from '../services/api';

const PAGAMENTOS: { valor: Pedido['pagamento']; nome: string; detalhe: string }[] = [
  { valor: 'pix', nome: 'Pix', detalhe: 'Na entrega, pelo QR Code do entregador' },
  { valor: 'cartao', nome: 'Cartão', detalhe: 'Maquininha na entrega' },
  { valor: 'dinheiro', nome: 'Dinheiro', detalhe: 'Avise o troco nas observações' },
];

export default function TelaDaSacola() {
  const { sacola, totais, produtosPorId, restaurantesPorId, mudarQuantidade, esvaziar } = useLoja();
  const [endereco, setEndereco] = useState('');
  const [pagamento, setPagamento] = useState<Pedido['pagamento']>('pix');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const restaurante = sacola.restauranteId ? restaurantesPorId.get(sacola.restauranteId) : undefined;

  async function fazerPedido() {
    setErro('');
    if (!restaurante) return;
    if (totais.faltaParaMinimo > 0) {
      setErro(`Faltam ${reais(totais.faltaParaMinimo)} para o pedido mínimo deste restaurante.`);
      return;
    }
    if (endereco.trim().length < 8) {
      setErro('Informe o endereço completo, com número e bairro.');
      return;
    }
    setEnviando(true);
    try {
      const pedido = await api.criarPedido({
        restauranteId: restaurante.id,
        restauranteNome: restaurante.nome,
        itens: sacola.itens.flatMap((item) => {
          const produto = produtosPorId.get(item.produtoId);
          return produto
            ? [{ produtoId: produto.id, nome: produto.nome, quantidade: item.quantidade, precoUnitario: produto.preco, observacao: item.observacao }]
            : [];
        }),
        subtotal: totais.subtotal,
        taxaEntrega: totais.taxaEntrega,
        total: totais.total,
        endereco: endereco.trim(),
        pagamento,
        criadoEm: new Date().toISOString(),
      });
      esvaziar();
      router.replace({ pathname: '/pedidos', params: { novo: pedido.id } });
    } catch {
      setErro('Não deu para enviar o pedido. Confira a conexão e tente de novo.');
      setEnviando(false);
    }
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
        <Text accessibilityRole="header" className="flex-1 text-lg font-bold text-tinta">
          Sacola
        </Text>
        {sacola.itens.length > 0 ? (
          <Pressable onPress={esvaziar} accessibilityRole="button" className="px-3 py-2">
            <Text className="font-semibold text-marca">Limpar</Text>
          </Pressable>
        ) : null}
      </View>

      {!restaurante || sacola.itens.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Feather name="shopping-bag" size={36} color="#6b6660" />
          <Text className="mt-3 text-base font-semibold text-tinta">Sua sacola está vazia</Text>
          <Pressable onPress={() => router.replace('/')} accessibilityRole="button" className="mt-3 py-2">
            <Text className="font-semibold text-marca">Ver restaurantes</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
            <Text className="text-sm text-suave">Pedido em</Text>
            <Text className="text-lg font-bold text-tinta">{restaurante.nome}</Text>

            <View className="mt-3 rounded-2xl bg-white px-4">
              {sacola.itens.map((item, indice) => {
                const produto = produtosPorId.get(item.produtoId);
                if (!produto) return null;
                return (
                  <View key={`${item.produtoId}-${item.observacao}`} className="flex-row items-center gap-3 border-b border-linha py-3 last:border-b-0">
                    <View className="flex-1">
                      <Text className="font-semibold text-tinta">{produto.nome}</Text>
                      {item.observacao ? <Text className="text-sm italic text-suave">{`"${item.observacao}"`}</Text> : null}
                      <Text className="mt-0.5 text-sm text-tinta">{reais(produto.preco * item.quantidade)}</Text>
                    </View>
                    <View className="flex-row items-center rounded-xl border border-linha">
                      <Pressable
                        onPress={() => mudarQuantidade(indice, item.quantidade - 1)}
                        accessibilityLabel={item.quantidade === 1 ? `Remover ${produto.nome}` : `Diminuir ${produto.nome}`}
                        className="h-10 w-10 items-center justify-center"
                      >
                        <Feather name={item.quantidade === 1 ? 'trash-2' : 'minus'} size={16} color="#d9480f" />
                      </Pressable>
                      <Text className="w-5 text-center font-bold text-tinta">{item.quantidade}</Text>
                      <Pressable
                        onPress={() => mudarQuantidade(indice, item.quantidade + 1)}
                        accessibilityLabel={`Aumentar ${produto.nome}`}
                        className="h-10 w-10 items-center justify-center"
                      >
                        <Feather name="plus" size={16} color="#d9480f" />
                      </Pressable>
                    </View>
                  </View>
                );
              })}
            </View>

            <Pressable onPress={() => router.push({ pathname: '/restaurante/[id]', params: { id: restaurante.id } })} className="mt-3 py-2">
              <Text className="font-semibold text-marca">Adicionar mais itens</Text>
            </Pressable>

            <Text className="mt-4 font-semibold text-tinta">Endereço de entrega</Text>
            <TextInput
              value={endereco}
              onChangeText={setEndereco}
              placeholder="Rua, número, bairro e complemento"
              placeholderTextColor="#9b958d"
              accessibilityLabel="Endereço de entrega"
              className="mt-2 rounded-xl border border-linha bg-white p-3 text-base text-tinta"
            />

            <Text className="mt-5 font-semibold text-tinta">Pagamento</Text>
            <View className="mt-2 gap-2">
              {PAGAMENTOS.map((opcao) => (
                <Pressable
                  key={opcao.valor}
                  onPress={() => setPagamento(opcao.valor)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: pagamento === opcao.valor }}
                  className={`flex-row items-center gap-3 rounded-xl border p-3 ${pagamento === opcao.valor ? 'border-marca bg-marca-claro' : 'border-linha bg-white'}`}
                >
                  <Feather name={pagamento === opcao.valor ? 'check-circle' : 'circle'} size={20} color={pagamento === opcao.valor ? '#d9480f' : '#9b958d'} />
                  <View>
                    <Text className="font-semibold text-tinta">{opcao.nome}</Text>
                    <Text className="text-sm text-suave">{opcao.detalhe}</Text>
                  </View>
                </Pressable>
              ))}
            </View>

            <View className="mt-5 gap-1.5 rounded-2xl bg-white p-4">
              <View className="flex-row justify-between">
                <Text className="text-suave">Subtotal</Text>
                <Text className="text-tinta">{reais(totais.subtotal)}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-suave">Entrega</Text>
                <Text className={totais.taxaEntrega === 0 ? 'font-semibold text-verde' : 'text-tinta'}>
                  {totais.taxaEntrega === 0 ? 'Grátis' : reais(totais.taxaEntrega)}
                </Text>
              </View>
              <View className="mt-1 flex-row justify-between">
                <Text className="text-base font-bold text-tinta">Total</Text>
                <Text className="text-base font-bold text-tinta">{reais(totais.total)}</Text>
              </View>
              {totais.faltaParaMinimo > 0 ? (
                <Text className="mt-1 text-sm text-marca">
                  Pedido mínimo de {reais(restaurante.pedidoMinimo)}: faltam {reais(totais.faltaParaMinimo)}.
                </Text>
              ) : null}
            </View>
          </ScrollView>

          <View className="border-t border-linha bg-white p-4 pb-6">
            {erro ? (
              <Text accessibilityRole="alert" className="mb-2 text-sm text-marca">
                {erro}
              </Text>
            ) : null}
            <Pressable
              onPress={fazerPedido}
              disabled={enviando}
              accessibilityRole="button"
              className={`flex-row items-center justify-between rounded-xl px-4 py-4 ${enviando ? 'bg-marca/60' : 'bg-marca'}`}
            >
              <Text className="font-bold text-white">{enviando ? 'Enviando...' : 'Fazer pedido'}</Text>
              <Text className="font-bold text-white">{reais(totais.total)}</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}
