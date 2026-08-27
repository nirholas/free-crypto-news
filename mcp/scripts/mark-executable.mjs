import { chmodSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
for (const file of ['index.js', 'http.js']) {
  chmodSync(path.join(here, '..', 'dist', file), 0o755);
}
