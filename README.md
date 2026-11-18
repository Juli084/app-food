# App Food

Aplicativo de delivery para uma cidade: o cliente encontra restaurantes da região, monta o pedido
e acompanha os pedidos feitos. React Native com Expo (SDK 58), Expo Router e NativeWind. Roda no
Android, no iOS e na web.

Os dados vêm de um `json-server` local, a partir de [`db.json`](db.json). Os restaurantes são
fictícios, de Sorocaba.

## O que faz

- **Busca por restaurante ou por prato.** Quem digita "picanha" vê os restaurantes que servem
  picanha. A busca ignora acentos e maiúsculas.
- **Categorias e filtros.** Lanches, brasileira, japonesa, pizza, saudável e açaí, mais os filtros
  de entrega grátis, até 30 minutos e nota 4,5 ou mais. Dá para ordenar por relevância, tempo,
  taxa ou nota.
- **Relevância.** Os favoritos vêm primeiro; depois, os restaurantes por nota, pesada pelo número
  de avaliações: 4,9 com 1.280 avaliações fica à frente de 4,9 com 10.
- **Cardápio de cada restaurante.** Seções, descrição e preço. Cada produto abre com quantidade e
  observação ("sem cebola").
- **Sacola de um restaurante por vez.** É assim nos apps de delivery, porque cada restaurante
  entrega o próprio pedido. Adicionar item de outro restaurante pede confirmação para trocar a
  sacola.
- **Pedido mínimo e taxa.** A sacola mostra quanto falta para o mínimo e não envia antes disso.
- **Pedido gravado.** O pedido vai para a API (`POST /pedidos`) e aparece em "Meus pedidos", com o
  botão "Pedir de novo". O pedido repetido usa o preço de hoje, não o antigo.
- **Favoritos e sacola guardados no aparelho.** Ao reabrir o app, a sacola é conferida contra o
  cardápio atual: o preço nunca vem do que estava salvo.

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

O `npm run api` serve uma cópia do `db.json` em `.dados/`, porque o json-server grava os
pedidos no arquivo que serve. O `npm run api:limpar` recomeça a partir do `db.json`.

O endereço da API vem de `EXPO_PUBLIC_API_URL`. Na web e no simulador do iOS, `localhost` funciona;
no emulador do Android use `http://10.0.2.2:3000`; num celular físico, o IP do computador na rede.

## Testes

```bash
npm test            # regras da sacola, busca, filtros e conferência dos dados de exemplo
npm run test:e2e    # o pedido inteiro na versão web, com a API de verdade
```

O teste de ponta a ponta exporta a versão web, sobe o json-server numa cópia limpa dos dados e
percorre:

1. a busca e os filtros;
2. o produto com observação e quantidade;
3. a tentativa de misturar restaurantes;
4. o pedido com endereço e pagamento;
5. "Pedir de novo";
6. o pedido mínimo;
7. os favoritos depois de recarregar a página.

A integração contínua roda tipos, lint, `expo-doctor`, os testes, o build web e o teste de ponta a
ponta.

## Limitações

- **Só a versão web foi testada de ponta a ponta.** Android e iOS compilam pelo Expo, mas não
  rodei em emulador nem em aparelho.
- **Sem pagamento online.** O pagamento é escolhido no app e feito na entrega.
- **Sem login.** "Meus pedidos" mostra todos os pedidos da API, porque o json-server é uma API de
  demonstração, sem usuários. Num produto de verdade, o pedido teria dono e autenticação.
- **Fotos.** As fotos dos pratos vêm de links externos (imgur) herdados da primeira versão;
  restaurante sem foto aparece com as iniciais.

## Histórico

- **2024:** criado com o SDK 51, a URL da API fixa num IP da rede local e dados com nomes e logos
  de redes reais.
- **2026, primeira atualização:** SDK 58 e API configurável.
- **2026, segunda atualização:** virou um fluxo completo de pedido, com cardápio por restaurante,
  sacola, pedidos gravados e favoritos. Os restaurantes passaram a ser fictícios, e saíram os
  banners de banco de imagens.
