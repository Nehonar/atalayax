import * as XLSX from 'xlsx';
import { randomUUID } from 'crypto';
import type { SensorAnalysisResult, SensorColumn, SensorParseResponseDto } from '@atalayax/types';
import type { ResolutionLevel } from '@atalayax/types';
import { analyzeDataPoints } from './sensor-demo.compression.js';

type StoredFile = {
  buffer: Buffer;
  storedAt: number;
};

// In-memory store; files expire after 30 minutes
const fileStore = new Map<string, StoredFile>();

setInterval(
  () => {
    const cutoff = Date.now() - 30 * 60 * 1000;
    for (const [id, file] of fileStore) {
      if (file.storedAt < cutoff) fileStore.delete(id);
    }
  },
  5 * 60 * 1000,
);

const DATE_PATTERN = /\d{4}[-/]\d{2}[-/]\d{2}|\d{2}[-/]\d{2}[-/]\d{4}|\d{1,2}:\d{2}/;
const NUMERIC_PATTERN = /^-?\d+(\.\d+)?([eE][+-]?\d+)?$/;

function inferColumnType(samples: string[]): SensorColumn['type'] {
  if (samples.length === 0) return 'string';
  const filled = samples.filter(Boolean);
  const dateHits = filled.filter((s) => DATE_PATTERN.test(s)).length;
  const numHits = filled.filter((s) => NUMERIC_PATTERN.test(s.trim())).length;
  if (dateHits >= filled.length / 2) return 'timestamp';
  if (numHits >= filled.length / 2) return 'numeric';
  return 'string';
}

function parseWorkbook(buffer: Buffer): Record<string, unknown>[] {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    raw: false,
    dateNF: 'yyyy-mm-dd hh:mm:ss',
  });
}

export class SensorDemoService {
  parseAndStore(buffer: Buffer): SensorParseResponseDto {
    const rows = parseWorkbook(buffer);

    if (rows.length === 0) {
      throw new Error('El archivo no contiene datos');
    }

    const headers = Object.keys(rows[0]);
    const columns: SensorColumn[] = headers.map((col) => {
      const samples = rows.slice(0, 8).map((r) => String(r[col] ?? ''));
      return { name: col, type: inferColumnType(samples), sample: samples };
    });

    const fileId = randomUUID();
    fileStore.set(fileId, { buffer, storedAt: Date.now() });

    return {
      fileId,
      columns,
      rowCount: rows.length,
      preview: rows
        .slice(0, 5)
        .map((r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, String(v ?? '')]))),
    };
  }

  analyze(params: {
    fileId: string;
    timestampColumn: string;
    sensorColumn: string;
    resolution: ResolutionLevel;
    warnLow?: number;
    warnHigh?: number;
  }): SensorAnalysisResult {
    const stored = fileStore.get(params.fileId);
    if (!stored) {
      throw new Error('Archivo no encontrado o expirado. Por favor sube el archivo de nuevo.');
    }

    const rows = parseWorkbook(stored.buffer);

    const dataPoints = rows
      .map((row, index) => {
        const ts = String(row[params.timestampColumn] ?? `fila_${index + 1}`);
        const rawVal = row[params.sensorColumn];
        const value = typeof rawVal === 'number' ? rawVal : parseFloat(String(rawVal ?? ''));
        return { timestamp: ts, value, index };
      })
      .filter((p) => isFinite(p.value));

    if (dataPoints.length === 0) {
      throw new Error('No se encontraron datos numéricos válidos en la columna seleccionada.');
    }

    const thresholds =
      params.warnLow !== undefined && params.warnHigh !== undefined
        ? { warnLow: params.warnLow, warnHigh: params.warnHigh }
        : undefined;

    return analyzeDataPoints(dataPoints, params.resolution, thresholds);
  }
}
