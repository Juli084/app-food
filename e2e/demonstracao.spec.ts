import { expect, test } from '@playwright/test';

// A versão publicada roda sem servidor: cardápio empacotado e pedidos guardados no aparelho.
test.use({ baseURL: 'http://localhost:4177' });

test('faz o pedido na demonstração sem chamar API nenhuma e guarda no aparelho', async ({ page }) => {
  const chamadasDeApi: string[] = [];
  const erros: string[] = [];
  page.on('request', (pedido) => {
    if (/localhost:(3000|3010)/.test(pedido.url())) chamadasDeApi.push(pedido.url());
  });
  page.on('pageerror', (erro) => erros.push(erro.message));

  await page.goto('/');
  await page.getByRole('button', { name: /^Brasa & Cia/ }).click();
  // A picanha também aparece em "Em alta hoje", na tela inicial que o Expo Router mantém na página.
  await page.getByRole('button', { name: 'Picanha na brasa, R$ 59,90' }).last().click();
  await page.getByRole('button', { name: /^Adicionar/ }).click();
  await page.getByRole('button', { name: /Ver sacola/ }).click();
  await page.getByLabel('Endereço de entrega').fill('Rua das Flores, 123, Campolim');
  await page.getByRole('button', { name: /Fazer pedido/ }).click();
  await expect(page.getByText(/Na demonstração, ele não vai a restaurante nenhum/)).toBeVisible();

  await page.reload();
  await expect(page.getByText('1x Picanha na brasa')).toBeVisible();
  expect(chamadasDeApi).toEqual([]);
  expect(erros).toEqual([]);
});
