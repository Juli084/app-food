// O json-server grava os pedidos no arquivo que serve. Para o db.json do repositório
// continuar sendo só os dados de exemplo, a API usa uma cópia em .dados/.
// `npm run api:limpar` recomeça a partir do db.json.
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';

const destino = '.dados/db.json';
const recomecar = process.argv.includes('--limpar');
mkdirSync('.dados', { recursive: true });
if (recomecar || !existsSync(destino)) copyFileSync('db.json', destino);
