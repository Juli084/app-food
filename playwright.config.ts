import { defineConfig, devices } from '@playwright/test';

// Testa a versão web exportada, com o json-server numa cópia limpa do db.json.
const canal = process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {};

export default defineConfig({
  testDir: 'e2e',
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4176',
    locale: 'pt-BR',
    trace: 'retain-on-failure',
    ...devices['Pixel 7'],
    ...canal,
  },
  webServer: [
    {
      command:
        "node -e \"require('fs').mkdirSync('.dados',{recursive:true});require('fs').copyFileSync('db.json','.dados/e2e.json')\" && npx json-server .dados/e2e.json --port 3010",
      url: 'http://localhost:3010/restaurantes',
      reuseExistingServer: false,
      timeout: 60_000,
    },
    {
      command: 'npx expo export --platform web --output-dir dist-e2e && npx serve dist-e2e -l 4176 -s',
      url: 'http://localhost:4176',
      env: { EXPO_PUBLIC_API_URL: 'http://localhost:3010' },
      reuseExistingServer: false,
      timeout: 300_000,
    },
  ],
});
