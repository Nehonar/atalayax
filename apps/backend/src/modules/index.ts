import { authModule } from './auth/auth.module.js';
import { dashboardModule } from './dashboard/dashboard.module.js';
import { healthModule } from './health/health.module.js';

export const routeModules = [healthModule, authModule, dashboardModule];
