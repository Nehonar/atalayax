import type { AnomalyEvent, AnomalyEventType, CompressedBlock, SensorAnalysisResult, ThresholdConfig } from '@atalayax/types';

type DataPoint = {
  timestamp: string;
  value: number;
  index: number;
};

type ProcessingState = {
  rawBuffer: DataPoint[];
  prevBlockMean: number | null;
  superMean: number | null;
  blockCount: number;
};

function createState(): ProcessingState {
  return { rawBuffer: [], prevBlockMean: null, superMean: null, blockCount: 0 };
}

function detectType(value: number, warnLow: number, warnHigh: number, approachMargin: number): AnomalyEventType | null {
  if (value > warnHigh) return 'above_warn';
  if (value < warnLow) return 'below_warn';
  if (value > warnHigh - approachMargin) return 'approaching_high';
  if (value < warnLow + approachMargin) return 'approaching_low';
  return null;
}

export function analyzeDataPoints(points: DataPoint[], thresholds: ThresholdConfig): SensorAnalysisResult {
  const { warnLow, warnHigh } = thresholds;
  const approachMargin = Math.max((warnHigh - warnLow) * 0.2, 0.001);

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

    const currentBufferMean =
      state.rawBuffer.length > 0
        ? state.rawBuffer.reduce((s, p) => s + p.value, 0) / state.rawBuffer.length
        : null;

    const type = detectType(point.value, warnLow, warnHigh, approachMargin);

    if (type !== null) {
      const deviation =
        type === 'above_warn' || type === 'approaching_high'
          ? point.value - warnHigh
          : warnLow - point.value;

      anomalies.push({
        timestamp: point.timestamp,
        value: point.value,
        index: point.index,
        type,
        comparedToMean: currentBufferMean ?? state.prevBlockMean,
        comparedToPrevBlock: state.prevBlockMean,
        deviation: Math.abs(deviation),
      });
    }

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
