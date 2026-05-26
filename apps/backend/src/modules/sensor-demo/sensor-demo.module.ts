import type { FastifyInstance } from 'fastify';
import multipart from '@fastify/multipart';
import { z } from 'zod';
import type { RouteModule } from '../../common/types/route-module.js';
import { SensorDemoService } from './sensor-demo.service.js';

const service = new SensorDemoService();

const ALLOWED_EXTENSIONS = new Set(['.xlsx', '.xls', '.csv']);
const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

const analyzeBodySchema = z.object({
  fileId: z.string().uuid(),
  timestampColumn: z.string().min(1),
  sensorColumn: z.string().min(1),
  resolution: z.coerce.number().int().min(1).max(3) as z.ZodType<1 | 2 | 3>,
  warnLow: z.coerce.number().finite().optional(),
  warnHigh: z.coerce.number().finite().optional(),
}).refine((d) => {
  if (d.warnLow !== undefined && d.warnHigh !== undefined) return d.warnLow < d.warnHigh;
  return true;
}, { message: 'warnLow debe ser menor que warnHigh' });

function requireDemoAuth(authHeader: string | undefined): boolean {
  return typeof authHeader === 'string' && authHeader.startsWith('Bearer demo-token-');
}

async function registerSensorDemoRoutes(app: FastifyInstance) {
  // Register multipart scoped to this plugin only
  await app.register(multipart, {
    limits: { fileSize: MAX_FILE_BYTES, files: 1 },
  });

  app.post('/sensor-demo/upload', async (request, reply) => {
    if (!requireDemoAuth(request.headers.authorization)) {
      return reply.status(401).send({ error: 'No autorizado. Inicia sesión para usar la demo.' });
    }

    const data = await request.file();
    if (!data) {
      return reply.status(400).send({ error: 'No se ha enviado ningún archivo.' });
    }

    const ext = data.filename.toLowerCase().match(/\.[^.]+$/)?.[0] ?? '';
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return reply.status(400).send({ error: 'Formato no soportado. Usa .xlsx, .xls o .csv' });
    }

    const buffer = await data.toBuffer();

    try {
      const result = service.parseAndStore(buffer);
      return reply.status(200).send(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al parsear el archivo';
      return reply.status(422).send({ error: message });
    }
  });

  app.post('/sensor-demo/analyze', async (request, reply) => {
    if (!requireDemoAuth(request.headers.authorization)) {
      return reply.status(401).send({ error: 'No autorizado. Inicia sesión para usar la demo.' });
    }

    try {
      const payload = analyzeBodySchema.parse(request.body);
      const result = service.analyze(payload);
      return reply.status(200).send(result);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return reply.status(400).send({ error: err.errors[0]?.message ?? 'Parámetros inválidos' });
      }
      const message = err instanceof Error ? err.message : 'Error en el análisis';
      return reply.status(422).send({ error: message });
    }
  });
}

export const sensorDemoModule: RouteModule = {
  prefix: '/api',
  register: registerSensorDemoRoutes,
};
