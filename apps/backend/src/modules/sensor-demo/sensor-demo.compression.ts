import type {
  AnomalyEvent,
  AnomalyEventType,
  CompressedBlock,
  DriftSegment,
  ResolutionLevel,
  SensorAnalysisResult,
  ThresholdConfig,
  TimePattern,
} from '@atalayax/types';

type DataPoint = { timestamp: string; value: number; index: number };

const K_BY_RESOLUTION: Record<ResolutionLevel, number> = { 1: 3, 2: 2, 3: 1 };
const MIN_DRIFT_BLOCKS = 4; // consecutive blocks trending same direction to flag as drift

type ProcessingState = {
  rawBuffer: DataPoint[];
  prevBlockMean: number | null;
  superMean: number | null;
  blockCount: number;
  // Welford online variance
  wN: number; wMean: number; wM2: number;
  // Consecutive trend tracking
  consecutiveUp: number; consecutiveDown: number;
  lastBlockMean: number | null;
};

function createState(): ProcessingState {
  return {
    rawBuffer: [], prevBlockMean: null, superMean: null, blockCount: 0,
    wN: 0, wMean: 0, wM2: 0,
    consecutiveUp: 0, consecutiveDown: 0, lastBlockMean: null,
  };
}

function updateWelford(s: ProcessingState, v: number): void {
  s.wN++;
  const d = v - s.wMean;
  s.wMean += d / s.wN;
  s.wM2 += d * (v - s.wMean);
}

function stdDev(s: ProcessingState): number {
  return s.wN < 2 ? 0 : Math.sqrt(s.wM2 / (s.wN - 1));
}

function parseHour(ts: string): number | null {
  const m = ts.match(/(\d{1,2}):(\d{2})/);
  if (!m) return null;
  const h = parseInt(m[1], 10);
  return h >= 0 && h <= 23 ? h : null;
}

function detectPointType(
  value: number,
  prevValue: number | null,
  bufMean: number | null,
  state: ProcessingState,
  thresholds: ThresholdConfig,
  approachMargin: number,
  K: number,
): AnomalyEventType | null {
  const { warnLow, warnHigh } = thresholds;

  // 1. Absolute threshold breach (highest priority)
  if (value > warnHigh) return 'above_warn';
  if (value < warnLow) return 'below_warn';

  // 2. Approaching threshold
  if (value > warnHigh - approachMargin) return 'approaching_high';
  if (value < warnLow + approachMargin) return 'approaching_low';

  // 3. Statistical detection (Welford) — needs enough data
  if (state.wN >= 10) {
    const sd = stdDev(state);
    if (sd > 0) {
      const z = Math.abs(value - state.wMean) / sd;
      if (z > K) return value > state.wMean ? 'statistical_high' : 'statistical_low';
    }
  }

  return null;
}

function detectDriftSegments(blocks: CompressedBlock[]): DriftSegment[] {
  const segments: DriftSegment[] = [];
  if (blocks.length < MIN_DRIFT_BLOCKS) return segments;

  let runDir: 'up' | 'down' | null = null;
  let runStart = 0;

  for (let i = 1; i <= blocks.length; i++) {
    const prev = blocks[i - 1];
    const curr = blocks[i];
    const dir: 'up' | 'down' | null =
      curr ? (curr.mean > prev.mean ? 'up' : curr.mean < prev.mean ? 'down' : null) : null;

    if (dir && dir === runDir) continue;

    // Run ended — check if long enough
    const runLen = i - runStart;
    if (runDir && runLen >= MIN_DRIFT_BLOCKS) {
      const s = blocks[runStart];
      const e = blocks[i - 1];
      segments.push({
        startTimestamp: s.startTimestamp,
        endTimestamp: e.endTimestamp,
        direction: runDir,
        blockCount: runLen,
        startMean: s.mean,
        endMean: e.mean,
        totalDrift: Math.abs(e.mean - s.mean),
      });
    }

    runDir = dir;
    runStart = i - 1;
  }

  return segments;
}

function detectTimePatterns(
  anomalies: AnomalyEvent[],
  points: DataPoint[],
): TimePattern[] {
  if (anomalies.length === 0) return [];

  const pointsPerHour = new Array<number>(24).fill(0);
  const anomaliesPerHour = new Array<number>(24).fill(0);

  for (const p of points) {
    const h = parseHour(p.timestamp);
    if (h !== null) pointsPerHour[h]++;
  }
  for (const a of anomalies) {
    const h = parseHour(a.timestamp);
    if (h !== null) anomaliesPerHour[h]++;
  }

  const rates = pointsPerHour.map((total, h) =>
    total > 0 ? anomaliesPerHour[h] / total : 0,
  );
  const nonZeroRates = rates.filter((r) => r > 0);
  if (nonZeroRates.length === 0) return [];

  const avgRate = nonZeroRates.reduce((s, r) => s + r, 0) / nonZeroRates.length;

  return rates
    .map((rate, hour) => ({
      hour,
      anomalyCount: anomaliesPerHour[hour],
      totalPoints: pointsPerHour[hour],
      rate,
      significance: avgRate > 0 ? rate / avgRate : 0,
    }))
    .filter((p) => p.significance >= 2 && p.anomalyCount >= 2)
    .sort((a, b) => b.significance - a.significance);
}

export function analyzeDataPoints(
  points: DataPoint[],
  resolution: ResolutionLevel,
  thresholds: ThresholdConfig,
): SensorAnalysisResult {
  const K = K_BY_RESOLUTION[resolution];
  const { warnLow, warnHigh } = thresholds;
  const approachMargin = Math.max((warnHigh - warnLow) * 0.15, 0.001);

  const state = createState();
  const anomalies: AnomalyEvent[] = [];
  const compressedBlocks: CompressedBlock[] = [];

  let sumAll = 0;
  let minValue = Infinity;
  let maxValue = -Infinity;
  let prevValue: number | null = null;

  for (const point of points) {
    sumAll += point.value;
    if (point.value < minValue) minValue = point.value;
    if (point.value > maxValue) maxValue = point.value;

    const bufMean =
      state.rawBuffer.length > 0
        ? state.rawBuffer.reduce((s, p) => s + p.value, 0) / state.rawBuffer.length
        : null;

    const type = detectPointType(point.value, prevValue, bufMean, state, thresholds, approachMargin, K);

    if (type) {
      const refValue =
        type === 'above_warn' || type === 'approaching_high' ? warnHigh
        : type === 'below_warn' || type === 'approaching_low' ? warnLow
        : state.wMean;

      anomalies.push({
        timestamp: point.timestamp,
        value: point.value,
        index: point.index,
        type,
        comparedToMean: bufMean ?? state.prevBlockMean,
        comparedToPrevBlock: state.prevBlockMean,
        deviation: Math.abs(point.value - refValue),
      });
    }

    updateWelford(state, point.value);
    prevValue = point.value;
    state.rawBuffer.push(point);

    if (state.rawBuffer.length === 10) {
      const blockMean = state.rawBuffer.reduce((s, p) => s + p.value, 0) / 10;

      compressedBlocks.push({
        mean: blockMean,
        count: 10,
        startTimestamp: state.rawBuffer[0].timestamp,
        endTimestamp: state.rawBuffer[9].timestamp,
        blockIndex: state.blockCount,
      });

      state.prevBlockMean = blockMean;
      state.blockCount++;
      state.superMean =
        state.superMean === null
          ? blockMean
          : (state.superMean * (state.blockCount - 1) + blockMean) / state.blockCount;
      state.rawBuffer = [];
    }
  }

  if (state.rawBuffer.length > 0) {
    const m = state.rawBuffer.reduce((s, p) => s + p.value, 0) / state.rawBuffer.length;
    compressedBlocks.push({
      mean: m, count: state.rawBuffer.length,
      startTimestamp: state.rawBuffer[0].timestamp,
      endTimestamp: state.rawBuffer[state.rawBuffer.length - 1].timestamp,
      blockIndex: state.blockCount,
    });
  }

  const driftSegments = detectDriftSegments(compressedBlocks);
  const timePatterns = detectTimePatterns(anomalies, points);

  return {
    totalPoints: points.length,
    anomalies,
    compressedBlocks,
    driftSegments,
    timePatterns,
    overallMean: points.length > 0 ? sumAll / points.length : 0,
    minValue: points.length > 0 ? minValue : 0,
    maxValue: points.length > 0 ? maxValue : 0,
  };
}
