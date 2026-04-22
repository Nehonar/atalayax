import type { FastifyInstance } from 'fastify';
import type { RouteModule } from '../../common/types/route-module.js';
import { loginDtoSchema } from './dto/login.dto.js';
import { AuthService } from './auth.service.js';

const authService = new AuthService();

async function registerAuthRoutes(app: FastifyInstance) {
  app.post('/auth/login', async (request, reply) => {
    const payload = loginDtoSchema.parse(request.body);
    const session = await authService.login(payload);

    return reply.status(200).send(session);
  });
}

export const authModule: RouteModule = {
  prefix: '/api',
  register: registerAuthRoutes,
};
