import { env } from './common/config/env.js';
import { createServer } from './common/http/server.js';
import { routeModules } from './modules/index.js';

async function bootstrap() {
  const app = createServer();

  for (const routeModule of routeModules) {
    await app.register(async (moduleApp) => {
      await routeModule.register(moduleApp);
    }, { prefix: routeModule.prefix });
  }

  await app.listen({
    host: '0.0.0.0',
    port: env.PORT,
  });
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
