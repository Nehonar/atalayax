import type { FastifyInstance } from 'fastify';

export type RouteModule = {
  prefix: string;
  register: (app: FastifyInstance) => Promise<void>;
};
