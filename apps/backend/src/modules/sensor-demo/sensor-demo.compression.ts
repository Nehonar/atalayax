import type { AnomalyEvent, AnomalyEventType, CompressedBlock, ResolutionLevel, SensorAnalysisResult, ThresholdConfig } from '@atalayax/types';

type DataPoint = {
  timestamp: string;
  value: number;
  index: number;
};

// K value per resolution level
const K_BY_RESOLUTION: Record<ResolutionLevel, number> = { 1: 3, 2: 2, 3: 1 };

type ProcessingState = {
  rawBuffer: DataPoint[];
  prevBlockMean: number | null;
  superMean: number | null;
  blockCount: number;
  // Welford online algorithm — incremental mean + variance, no history stored
  wN: number;
  wMean: number;
  wM2: number;
};

function createState(): ProcessingState {
  return { rawBuffer: [], prevBlockMean: null, superMean: null, blockCount: 0, wN: 0, wMean: 0, wM2: 0 };
}

function updateWelford(state: ProcessingState, value: number): void {
  state.wN++;
  const delta = value - state.wMean;
  state.wMean += delta / state.wN;
  state.wM2 += delta * (value - state.wMean);
}

function getStdDev(state: ProcessingState): number {
  return state.wN < 2 ? 0 : Math.sqrt(state.wM2 / (state.wN - 1));
}

function detectTypes(
  value: number,
  thresholds: Partial<ThresholdConfig>,
  approachMargin: number,
  state: ProcessingState,
  K: number,
): AnomalyEventType[] {
  const types: AnomalyEventType[] = [];
  const { warnLow, warnHigh } = thresholds;

  // Explicit threshold detection
  if (warnHigh !== undefined) {
    if (value > warnHigh) types.push('above_warn');
    else if (value > warnHigh - approachMargin) types.push('approaching_high');
  }
  if (warnLow !== undefined) {
    if (value < warnLow) types.push('below_warn');
    else if (value < warnLow + approachMargin) types.push('approaching_low');
  }

  // Statistical detection via Welford (kicks in after enough data)
  if (state.wN >= 10) {
    const stdDev = getStdDev(state);
    if (stdDev > 0) {
      const zScore = Math.abs(value - state.wMean) / stdDev;
      if (zScore > K && types.length === 0) {
        types.push(value > state.wMean ? 'statistical_high' : 'statistical_low');
      }
    }
  }

  return types;
}

export function analyzeDataPoints(
  points: DataPoint[],
  resolution: ResolutionLevel,
  thresholds?: Partial<ThresholdConfig>,
): SensorAnalysisResult {
  const K = K_BY_RESOLUTION[resolution];
  const warnLow = thresholds?.warnLow;
  const warnHigh = thresholds?.warnHigh;
  const approachMargin =
    warnLow !== undefined && warnHigh !== undefined
      ? Math.max((warnHigh - warnLow) * 0.2, 0.001)
      : 0;

  const state = createState();
  const anomalies: AnomalyEvent[] = [];
  const compressedBlocks: CompressedBlock[] = [];

  let sumAll = 0;
  let minValue = Infinity;
  let maxValue = -Infinity;

  for (const point of points) {
    sumAll += point.value;
    if (point.value < minValue) minValue = point.value;
    if (point.value > maxValue) maxValue = point.value;

    const bufMean =
      state.rawBuffer.length > 0
        ? state.rawBuffer.reduce((s, p) => s + p.value, 0) / state.rawBuffer.length
        : null;

    const types = detectTypes(point.value, { warnLow, warnHigh }, approachMargin, state, K);

    for (const type of types) {
      const refValue = warnHigh !== undefined && (type === 'above_warn' || type === 'approaching_high')
        ? warnHigh
        : warnLow !== undefined && (type === 'below_warn' || type === 'approaching_low')
          ? warnLow
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
      break; // one anomaly per point, most specific first
    }

    updateWelford(state, point.value);
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
    const partialMean = state.rawBuffer.reduce((s, p) => s + p.value, 0) / state.rawBuffer.length;
    compressedBlocks.push({
      mean: partialMean,
      count: state.rawBuffer.length,
      startTimestamp: state.rawBuffer[0].timestamp,
      endTimestamp: state.rawBuffer[state.rawBuffer.length - 1].timestamp,
      blockIndex: state.blockCount,
    });
  }

  return {
    totalPoints: points.length,
    anomalies,
    compressedBlocks,
    overallMean: points.length > 0 ? sumAll / points.length : 0,
    minValue: points.length > 0 ? minValue : 0,
    maxValue: points.length > 0 ? maxValue : 0,
  };
}
