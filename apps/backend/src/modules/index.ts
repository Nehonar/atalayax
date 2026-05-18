import { authModule } from './auth/auth.module.js';
import { dashboardModule } from './dashboard/dashboard.module.js';
import { healthModule } from './health/health.module.js';
import { sensorDemoModule } from './sensor-demo/sensor-demo.module.js';

export const routeModules = [healthModule, authModule, dashboardModule, sensorDemoModule];
