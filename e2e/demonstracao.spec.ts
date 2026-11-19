import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
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

  // Entra pelo link direto: a página do restaurante é gerada na exportação.
  await page.goto('/restaurante/1');
  await expect(page.getByRole('heading', { name: 'Brasa & Cia' })).toBeVisible();
  // O Expo Router pode manter outras telas na página; só o botão visível é o desta tela.
  await page.getByRole('button', { name: 'Picanha na brasa, R$ 59,90' }).filter({ visible: true }).click();
  await page.getByRole('button', { name: /^Adicionar/ }).filter({ visible: true }).click();
  await page.getByRole('button', { name: /Ver sacola/ }).filter({ visible: true }).click();
  await page.getByLabel('Endereço de entrega').fill('Rua das Flores, 123, Campolim');
  await page.getByRole('button', { name: /Fazer pedido/ }).click();
  await expect(page.getByText(/Na demonstração, ele não vai a restaurante nenhum/)).toBeVisible();

  await page.reload();
  await expect(page.getByText('1x Picanha na brasa')).toBeVisible();
  expect(chamadasDeApi).toEqual([]);
  expect(erros).toEqual([]);
});

test('cada página exportada tem só scripts que a política de segurança da Vercel libera', async ({ request }) => {
  const politica = JSON.stringify(JSON.parse(readFileSync('vercel.json', 'utf-8')).headers);
  for (const caminho of ['/', '/restaurante/4', '/sacola', '/pedidos']) {
    const html = await (await request.get(caminho)).text();
    const embutidos = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1] ?? '');
    for (const script of embutidos) {
      const hash = `sha256-${createHash('sha256').update(script).digest('base64')}`;
      expect(politica, `${caminho}: ${script.slice(0, 60)}`).toContain(hash);
    }
    expect(html, caminho).not.toMatch(/ on[a-z]+="/);
  }
});
