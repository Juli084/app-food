import { defineConfig } from 'vitest/config';

// Só as regras puras (src/dominio) têm teste de unidade; as telas são cobertas pelo
// teste de ponta a ponta na versão web.
export default defineConfig({
  test: { include: ['tests/**/*.test.ts'], environment: 'node' },
});
