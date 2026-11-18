import '../styles/global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ProvedorDaLoja } from '../contexto/Loja';

export default function RootLayout() {
  return (
    <ProvedorDaLoja>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#f6f5f2' } }} />
    </ProvedorDaLoja>
  );
}
