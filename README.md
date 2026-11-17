# App Food

Tela inicial de um aplicativo de delivery: comidas em alta, restaurantes famosos e lista de
restaurantes, com busca. React Native com Expo (SDK 58), Expo Router e NativeWind. Roda no Android,
no iOS e na web.

Os dados vêm de um `json-server` local, a partir de [`db.json`](db.json).

## O que faz

- lista comidas com preço, tempo e taxa de entrega em reais, e a nota de cada prato;
- lista restaurantes em duas apresentações (carrossel e lista);
- a busca filtra comidas e restaurantes pelo nome, sem diferenciar maiúsculas nem acentos;
- se a API não responder, cada seção avisa em vez de ficar em branco.

## Rodando localmente

Requer Node 22.

```bash
npm install --legacy-peer-deps
cp .env.example .env
npm run api
```

Em outro terminal:

```bash
npm start
```

O endereço da API vem de `EXPO_PUBLIC_API_URL`. Na web e no simulador do iOS, `localhost` funciona;
no emulador do Android use `http://10.0.2.2:3000`; num celular físico, o IP do computador na rede.

## Verificação

```bash
npm run typecheck
npm run lint
npx expo-doctor
npm run build:web
```

A integração contínua roda os quatro. A versão web exportada foi testada no Chrome com o
`json-server` no ar e fora do ar.

## Histórico

Criado em 2024 com o SDK 51, a URL da API fixa num IP da rede local e dados de exemplo. Em 2026 foi
atualizado para o SDK 58, com a API configurável, a busca funcionando e sem botões e notas de
enfeite.
