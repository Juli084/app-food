import { TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface Props {
  valor: string;
  aoMudar: (texto: string) => void;
}

export function Search({ valor, aoMudar }: Props) {
  return (
    <View className="w-full flex-row border border-slate-500 h-14 rounded-full items-center gap-2 px-4 bg-transparent">
      <Feather name="search" size={24} color="#64748b" />
      <TextInput
        placeholder="Procure sua comida..."
        aria-label="Buscar comida ou restaurante"
        value={valor}
        onChangeText={aoMudar}
        className="w-full h-full flex-1 bg-transparent"
      />
    </View>
  );
}
