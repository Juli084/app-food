import { expect, test } from '@playwright/test';

test('busca, monta a sacola, respeita o restaurante e faz o pedido', async ({ page }) => {
  const erros: string[] = [];
  page.on('pageerror', (erro) => erros.push(erro.message));

  await test.step('lista e busca pelo prato, sem acento', async () => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: /^Chapa Quente Burger/ })).toBeVisible();
    await page.getByLabel('Buscar restaurante ou prato').fill('picanha');
    await expect(page.getByRole('button', { name: /^Brasa & Cia/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Chapa Quente Burger/ })).toHaveCount(0);
    await page.getByLabel('Limpar busca').click();
    await page.getByRole('button', { name: 'Entrega grátis', exact: true }).click();
    await expect(page.getByRole('button', { name: /, Entrega grátis$/ })).toHaveCount(2);
    await page.getByRole('button', { name: 'Entrega grátis', exact: true }).click();
  });

  await test.step('adiciona com observação e quantidade', async () => {
    await page.getByRole('button', { name: /^Chapa Quente Burger/ }).click();
    await expect(page.getByRole('heading', { name: 'Chapa Quente Burger' })).toBeVisible();
    await page.getByRole('button', { name: 'Smash duplo, R$ 36,90' }).click();
    await page.getByLabel('Observação').fill('sem picles');
    await page.getByLabel('Aumentar quantidade').click();
    await page.getByRole('button', { name: /^Adicionar/ }).click();
    await expect(page.getByRole('button', { name: /Ver sacola: 2 itens, R\$ 73,80/ })).toBeVisible();
  });

  await test.step('não mistura restaurantes sem perguntar', async () => {
    await page.goBack();
    await page.getByRole('button', { name: /^Brasa & Cia/ }).click();
    await page.getByRole('button', { name: 'Mandioca frita, R$ 18,90' }).click();
    await page.getByRole('button', { name: /^Adicionar/ }).click();
    await expect(page.getByText('Trocar a sacola?')).toBeVisible();
    await page.getByRole('button', { name: 'Cancelar' }).click();
    await expect(page.getByRole('button', { name: /Ver sacola: 2 itens, R\$ 73,80/ })).toBeVisible();
  });

  await test.step('fecha o pedido com taxa e endereço', async () => {
    await page.getByRole('button', { name: /Ver sacola/ }).click();
    await expect(page.getByText('"sem picles"')).toBeVisible();
    await expect(page.getByText('R$ 78,79').first()).toBeVisible();
    await page.getByRole('button', { name: /Fazer pedido/ }).click();
    await expect(page.getByRole('alert')).toHaveText('Informe o endereço completo, com número e bairro.');
    await page.getByLabel('Endereço de entrega').fill('Rua das Flores, 123, Campolim');
    await page.getByRole('radio', { name: /Cartão/ }).click();
    await page.getByRole('button', { name: /Fazer pedido/ }).click();
    await expect(page.getByText('Pedido enviado ao restaurante.')).toBeVisible();
    // O pedido mais novo vem primeiro; a API pode ter pedidos de execuções anteriores.
    await expect(page.getByText('2x Smash duplo').first()).toBeVisible();
    await expect(page.getByText('R$ 78,79 · Cartão').first()).toBeVisible();
  });

  await test.step('pede de novo com os preços de hoje', async () => {
    await page.getByRole('button', { name: 'Pedir de novo' }).first().click();
    // No web, o Expo Router mantém as telas anteriores na página; por isso a busca é pelo
    // botão da sacola, que só existe na tela atual.
    await expect(page.getByRole('button', { name: /Fazer pedido/ })).toContainText('R$ 78,79');
  });

  expect(erros).toEqual([]);
});

test('cobra o pedido mínimo e guarda favoritos', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Favoritar Forno da Esquina' }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Tirar Forno da Esquina dos favoritos' })).toBeVisible();

  await page.getByRole('button', { name: /^Chapa Quente Burger/ }).click();
  await page.getByRole('button', { name: 'Refrigerante lata, R$ 7,00' }).click();
  await page.getByRole('button', { name: /^Adicionar/ }).click();
  await page.getByRole('button', { name: /Ver sacola/ }).click();
  await expect(page.getByText(/faltam R\$ 18,00/)).toBeVisible();
  await page.getByLabel('Endereço de entrega').fill('Rua das Flores, 123, Campolim');
  await page.getByRole('button', { name: /Fazer pedido/ }).click();
  await expect(page.getByRole('alert')).toHaveText('Faltam R$ 18,00 para o pedido mínimo deste restaurante.');
});
