import type { FastifyInstance } from 'fastify';
import type { HealthResponseDto } from '@atalayax/types';
import type { RouteModule } from '../../common/types/route-module.js';

async function registerHealthRoutes(app: FastifyInstance) {
  app.get('/health', async (): Promise<HealthResponseDto> => ({
    status: 'ok',
    service: 'backend',
    timestamp: new Date().toISOString(),
  }));
}

export const healthModule: RouteModule = {
  prefix: '/api',
  register: registerHealthRoutes,
};
