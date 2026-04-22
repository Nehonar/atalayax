import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import type { RouteModule } from '../../common/types/route-module.js';
import { DashboardService } from './dashboard.service.js';

const dashboardService = new DashboardService();
const dashboardQuerySchema = z.object({
  role: z.enum(['admin', 'analyst', 'operator']).default('analyst'),
});

async function registerDashboardRoutes(app: FastifyInstance) {
  app.get('/dashboard/summary', async (request) => {
    const query = dashboardQuerySchema.parse(request.query);
    return dashboardService.getOverview(query.role).summary;
  });

  app.get('/dashboard/overview', async (request) => {
    const query = dashboardQuerySchema.parse(request.query);
    return dashboardService.getOverview(query.role);
  });
}

export const dashboardModule: RouteModule = {
  prefix: '/api',
  register: registerDashboardRoutes,
};
