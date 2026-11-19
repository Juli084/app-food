import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { ActivityIndicator, Image, Modal, Pressable, Text, View } from 'react-native';
import { useLoja } from '../contexto/Loja';
import { reais, textoDaEntrega } from '../dominio/filtros';
import type { Restaurante } from '../dominio/tipos';
import { fotoDoRestaurante } from '../imagens';

const CORES_DO_MONOGRAMA = ['#d9480f', '#2b8a3e', '#1971c2', '#9c36b5', '#e67700', '#0c8599'];

/** Iniciais no lugar da foto, para restaurante sem imagem. */
export function Monograma({ nome, tamanho = 64 }: { nome: string; tamanho?: number }) {
  const iniciais = nome
    .split(/\s+/)
    .filter((parte) => /^[A-Za-zÀ-ÿ]/.test(parte) && parte.length > 2)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join('');
  const cor = CORES_DO_MONOGRAMA[[...nome].reduce((soma, letra) => soma + letra.charCodeAt(0), 0) % CORES_DO_MONOGRAMA.length];
  return (
    <View style={{ width: tamanho, height: tamanho, backgroundColor: cor }} className="items-center justify-center rounded-2xl">
      <Text style={{ fontSize: tamanho * 0.34 }} className="font-bold text-white">
        {iniciais}
      </Text>
    </View>
  );
}

export function FotoDoRestaurante({ restaurante, tamanho = 64 }: { restaurante: Restaurante; tamanho?: number }) {
  const foto = fotoDoRestaurante(restaurante.capa);
  if (!foto) return <Monograma nome={restaurante.nome} tamanho={tamanho} />;
  return (
    <Image
      source={foto}
      alt=""
      style={{ width: tamanho, height: tamanho }}
      className="rounded-2xl bg-linha"
    />
  );
}

export function Nota({ valor }: { valor: number }) {
  return (
    <View className="flex-row items-center gap-1">
      <Ionicons name="star" size={13} color="#e67700" />
      <Text className="text-sm font-semibold text-[#9a5b00]">{valor.toFixed(1).replace('.', ',')}</Text>
    </View>
  );
}

export function CartaoRestaurante({ restaurante, onAbrir }: { restaurante: Restaurante; onAbrir: () => void }) {
  const { favoritos, alternarFavorito } = useLoja();
  const favorito = favoritos.has(restaurante.id);
  return (
    <View className="flex-row items-center gap-3 border-b border-linha py-3">
      <Pressable
        onPress={onAbrir}
        accessibilityRole="button"
        accessibilityLabel={`${restaurante.nome}, nota ${restaurante.nota.toFixed(1)}, ${restaurante.tempoMin} a ${restaurante.tempoMax} minutos, ${textoDaEntrega(restaurante.taxaEntrega)}`}
        className="flex-1 flex-row items-center gap-3"
      >
        <FotoDoRestaurante restaurante={restaurante} />
        <View className="flex-1">
          <Text className="text-base font-bold text-tinta" numberOfLines={1}>
            {restaurante.nome}
          </Text>
          <View className="mt-0.5 flex-row items-center gap-2">
            <Nota valor={restaurante.nota} />
            <Text className="text-sm text-suave">· {restaurante.bairro}</Text>
          </View>
          <Text className="mt-0.5 text-sm text-suave">
            {restaurante.tempoMin}-{restaurante.tempoMax} min ·{' '}
            <Text className={restaurante.taxaEntrega === 0 ? 'font-semibold text-verde' : 'text-suave'}>
              {textoDaEntrega(restaurante.taxaEntrega)}
            </Text>
          </Text>
        </View>
      </Pressable>
      <Pressable
        onPress={() => alternarFavorito(restaurante.id)}
        accessibilityRole="button"
        accessibilityLabel={favorito ? `Tirar ${restaurante.nome} dos favoritos` : `Favoritar ${restaurante.nome}`}
        className="h-11 w-11 items-center justify-center"
      >
        <Ionicons name={favorito ? 'heart' : 'heart-outline'} size={22} color={favorito ? '#d9480f' : '#6b6660'} />
      </Pressable>
    </View>
  );
}

export function Carregando() {
  return (
    <View className="flex-1 items-center justify-center py-16">
      <ActivityIndicator color="#d9480f" />
    </View>
  );
}

export function FalhaNaApi() {
  const { recarregar } = useLoja();
  return (
    <View className="items-center px-6 py-16">
      <Ionicons name="cloud-offline-outline" size={36} color="#6b6660" />
      <Text className="mt-3 text-center text-base font-semibold text-tinta">Não deu para carregar os restaurantes.</Text>
      <Text className="mt-1 text-center text-sm text-suave">Confira a conexão. Em desenvolvimento, a API sobe com npm run api.</Text>
      <Pressable onPress={recarregar} accessibilityRole="button" className="mt-4 rounded-xl bg-tinta px-5 py-3">
        <Text className="font-semibold text-white">Tentar de novo</Text>
      </Pressable>
    </View>
  );
}

/** Barra fixa com o resumo da sacola, nas telas de navegação. */
export function BarraDaSacola({ onAbrir }: { onAbrir: () => void }) {
  const { totais, sacola, restaurantesPorId } = useLoja();
  if (totais.quantidade === 0) return null;
  const restaurante = sacola.restauranteId ? restaurantesPorId.get(sacola.restauranteId) : undefined;
  return (
    <View className="absolute bottom-0 left-0 right-0 px-4 pb-5">
      <Pressable
        onPress={onAbrir}
        accessibilityRole="button"
        accessibilityLabel={`Ver sacola: ${totais.quantidade} ${totais.quantidade === 1 ? 'item' : 'itens'}, ${reais(totais.subtotal)}`}
        className="flex-row items-center gap-3 rounded-2xl bg-marca px-4 py-3.5 shadow-lg"
      >
        <View className="h-7 min-w-7 items-center justify-center rounded-full bg-white/25 px-1.5">
          <Text className="font-bold text-white">{totais.quantidade}</Text>
        </View>
        <View className="flex-1">
          <Text className="font-bold text-white">Ver sacola</Text>
          {restaurante ? (
            <Text className="text-xs text-white/85" numberOfLines={1}>
              {restaurante.nome}
            </Text>
          ) : null}
        </View>
        <Text className="font-bold text-white">{reais(totais.subtotal)}</Text>
      </Pressable>
    </View>
  );
}

/** Confirmação que funciona igual no celular e na web (o Alert do React Native não abre na web). */
export function Confirmacao({
  visivel,
  titulo,
  texto,
  confirmar,
  onConfirmar,
  onCancelar,
}: {
  visivel: boolean;
  titulo: string;
  texto: ReactNode;
  confirmar: string;
  onConfirmar: () => void;
  onCancelar: () => void;
}) {
  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={onCancelar}>
      <View className="flex-1 items-center justify-center bg-black/45 px-6">
        <View accessibilityRole="alert" className="w-full max-w-sm rounded-2xl bg-white p-5">
          <Text className="text-lg font-bold text-tinta">{titulo}</Text>
          <Text className="mt-2 text-base text-suave">{texto}</Text>
          <View className="mt-5 flex-row justify-end gap-2">
            <Pressable onPress={onCancelar} accessibilityRole="button" className="rounded-xl px-4 py-3">
              <Text className="font-semibold text-suave">Cancelar</Text>
            </Pressable>
            <Pressable onPress={onConfirmar} accessibilityRole="button" className="rounded-xl bg-marca px-4 py-3">
              <Text className="font-semibold text-white">{confirmar}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
