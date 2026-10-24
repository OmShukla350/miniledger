import { app } from './app';
import { config } from './config';
import { migrate } from './db';

migrate()
  .then(() => app.listen(config.port, () => console.log(`MiniLedger API on http://localhost:${config.port}`)))
  .catch((e) => { console.error('Startup failed:', e); process.exit(1); });
