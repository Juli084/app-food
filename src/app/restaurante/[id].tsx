import { Feather, Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { BarraDaSacola, Carregando, Confirmacao, FalhaNaApi, FotoDoRestaurante, Nota } from '../../components/comuns';
import { useLoja } from '../../contexto/Loja';
import { agruparPorSecao, reais, textoDaEntrega } from '../../dominio/filtros';
import type { Produto } from '../../dominio/tipos';
import { fotoDoPrato } from '../../imagens';

// O tamanho vai no style: na versão web, uma imagem empacotada traz a própria largura e
// altura, que passariam por cima das classes.
function FotoDoPrato({ produto, largura, altura, className }: { produto: Produto; largura: number | '100%'; altura: number; className: string }) {
  const foto = fotoDoPrato(produto.imagem);
  return foto ? <Image source={foto} alt="" style={{ width: largura, height: altura }} className={className} /> : null;
}

function Voltar() {
  return (
    <Pressable
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
      accessibilityRole="button"
      accessibilityLabel="Voltar"
      className="h-11 w-11 items-center justify-center rounded-full bg-white/95"
    >
      <Feather name="arrow-left" size={20} color="#1f1d1a" />
    </Pressable>
  );
}

export default function TelaDoRestaurante() {
  const { id, produto: produtoInicial } = useLocalSearchParams<{ id: string; produto?: string }>();
  const { catalogo, restaurantesPorId, produtosPorId, adicionar, trocarSacolaPor, favoritos, alternarFavorito } = useLoja();
  const [aberto, setAberto] = useState<string | null>(produtoInicial ?? null);
  const [quantidade, setQuantidade] = useState(1);
  const [observacao, setObservacao] = useState('');
  const [conflito, setConflito] = useState<{ produto: Produto; atual: string } | null>(null);

  if (catalogo.estado === 'carregando') return <Carregando />;
  if (catalogo.estado === 'erro') return <FalhaNaApi />;
  const restaurante = restaurantesPorId.get(id);
  if (!restaurante) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-base font-semibold text-tinta">Restaurante não encontrado.</Text>
        <Pressable onPress={() => router.replace('/')} className="mt-3 py-2">
          <Text className="font-semibold text-marca">Voltar ao início</Text>
        </Pressable>
      </View>
    );
  }

  const cardapio = agruparPorSecao(catalogo.produtos.filter((produto) => produto.restauranteId === restaurante.id));
  const produtoAberto = aberto ? produtosPorId.get(aberto) : undefined;
  const favorito = favoritos.has(restaurante.id);

  function abrir(produto: Produto) {
    setQuantidade(1);
    setObservacao('');
    setAberto(produto.id);
  }

  function confirmarAdicao() {
    if (!produtoAberto) return;
    const resultado = adicionar(produtoAberto, quantidade, observacao);
    if (resultado.tipo === 'outro-restaurante') {
      setConflito({ produto: produtoAberto, atual: restaurantesPorId.get(resultado.restauranteAtual)?.nome ?? 'outro restaurante' });
    }
    setAberto(null);
  }

  return (
    <View className="flex-1 bg-fundo">
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="bg-white" style={{ paddingTop: Constants.statusBarHeight + 8 }}>
          <View className="flex-row items-center justify-between px-3">
            <Voltar />
            <Pressable
              onPress={() => alternarFavorito(restaurante.id)}
              accessibilityRole="button"
              accessibilityLabel={favorito ? 'Tirar dos favoritos' : 'Favoritar'}
              className="h-11 w-11 items-center justify-center"
            >
              <Ionicons name={favorito ? 'heart' : 'heart-outline'} size={24} color={favorito ? '#d9480f' : '#1f1d1a'} />
            </Pressable>
          </View>
          <View className="flex-row items-center gap-4 px-4 pb-5 pt-2">
            <FotoDoRestaurante restaurante={restaurante} tamanho={76} />
            <View className="flex-1">
              <Text accessibilityRole="header" className="text-2xl font-bold text-tinta">
                {restaurante.nome}
              </Text>
              <View className="mt-1 flex-row items-center gap-2">
                <Nota valor={restaurante.nota} />
                <Text className="text-sm text-suave">({restaurante.avaliacoes} avaliações)</Text>
              </View>
              <Text className="mt-1 text-sm text-suave">
                {restaurante.tempoMin}-{restaurante.tempoMax} min · {textoDaEntrega(restaurante.taxaEntrega)} · Mínimo{' '}
                {reais(restaurante.pedidoMinimo)}
              </Text>
            </View>
          </View>
        </View>

        {cardapio.map(({ secao, produtos }) => (
          <View key={secao} className="mt-5 px-4">
            <Text accessibilityRole="header" className="text-lg font-bold text-tinta">
              {secao}
            </Text>
            {produtos.map((produto) => (
              <Pressable
                key={produto.id}
                onPress={() => abrir(produto)}
                accessibilityRole="button"
                accessibilityLabel={`${produto.nome}, ${reais(produto.preco)}`}
                className="mt-2 flex-row items-center gap-3 rounded-2xl bg-white p-3"
              >
                <View className="flex-1">
                  <Text className="font-semibold text-tinta">{produto.nome}</Text>
                  {produto.descricao ? (
                    <Text className="mt-0.5 text-sm text-suave" numberOfLines={2}>
                      {produto.descricao}
                    </Text>
                  ) : null}
                  <Text className="mt-1.5 font-semibold text-tinta">{reais(produto.preco)}</Text>
                </View>
                <FotoDoPrato produto={produto} largura={80} altura={80} className="rounded-xl bg-linha" />
              </Pressable>
            ))}
          </View>
        ))}
      </ScrollView>

      <BarraDaSacola onAbrir={() => router.push('/sacola')} />

      <Modal visible={Boolean(produtoAberto)} transparent animationType="slide" onRequestClose={() => setAberto(null)}>
        <View className="flex-1 justify-end bg-black/45">
          {produtoAberto ? (
            <View accessibilityViewIsModal className="max-h-[90%] rounded-t-3xl bg-white">
              <ScrollView>
                <FotoDoPrato produto={produtoAberto} largura="100%" altura={256} className="rounded-t-3xl bg-linha" />
                <View className="p-5">
                  <View className="flex-row items-start justify-between gap-3">
                    <Text accessibilityRole="header" className="flex-1 text-xl font-bold text-tinta">
                      {produtoAberto.nome}
                    </Text>
                    <Pressable onPress={() => setAberto(null)} accessibilityRole="button" accessibilityLabel="Fechar" className="h-10 w-10 items-center justify-center">
                      <Feather name="x" size={22} color="#6b6660" />
                    </Pressable>
                  </View>
                  {produtoAberto.descricao ? <Text className="mt-1 text-base text-suave">{produtoAberto.descricao}</Text> : null}
                  <Text className="mt-3 text-lg font-bold text-tinta">{reais(produtoAberto.preco)}</Text>
                  <Text className="mt-5 font-semibold text-tinta">Alguma observação?</Text>
                  <TextInput
                    value={observacao}
                    onChangeText={setObservacao}
                    maxLength={140}
                    multiline
                    placeholder="Ex.: sem cebola, molho à parte"
                    placeholderTextColor="#9b958d"
                    accessibilityLabel="Observação"
                    className="mt-2 min-h-16 rounded-xl border border-linha p-3 text-base text-tinta"
                  />
                </View>
              </ScrollView>
              <View className="flex-row items-center gap-3 border-t border-linha p-4 pb-6">
                <View className="flex-row items-center rounded-xl border border-linha">
                  <Pressable
                    onPress={() => setQuantidade((q) => Math.max(1, q - 1))}
                    accessibilityLabel="Diminuir quantidade"
                    className="h-12 w-12 items-center justify-center"
                  >
                    <Feather name="minus" size={18} color={quantidade > 1 ? '#d9480f' : '#c9c3ba'} />
                  </Pressable>
                  <Text accessibilityLabel={`Quantidade ${quantidade}`} className="w-6 text-center text-base font-bold text-tinta">
                    {quantidade}
                  </Text>
                  <Pressable
                    onPress={() => setQuantidade((q) => Math.min(20, q + 1))}
                    accessibilityLabel="Aumentar quantidade"
                    className="h-12 w-12 items-center justify-center"
                  >
                    <Feather name="plus" size={18} color="#d9480f" />
                  </Pressable>
                </View>
                <Pressable onPress={confirmarAdicao} accessibilityRole="button" className="flex-1 flex-row items-center justify-between rounded-xl bg-marca px-4 py-3.5">
                  <Text className="font-bold text-white">Adicionar</Text>
                  <Text className="font-bold text-white">{reais(produtoAberto.preco * quantidade)}</Text>
                </Pressable>
              </View>
            </View>
          ) : null}
        </View>
      </Modal>

      <Confirmacao
        visivel={conflito !== null}
        titulo="Trocar a sacola?"
        texto={`Sua sacola tem itens de ${conflito?.atual}. Cada restaurante entrega o próprio pedido, então para adicionar este item a sacola atual será esvaziada.`}
        confirmar="Esvaziar e adicionar"
        onCancelar={() => setConflito(null)}
        onConfirmar={() => {
          if (conflito) trocarSacolaPor(conflito.produto, quantidade, observacao);
          setConflito(null);
        }}
      />
    </View>
  );
}
