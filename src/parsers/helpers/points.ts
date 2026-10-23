import { Lane } from 'src/components/types';

export const PLANNING_POKER_VALUES = [
  '0',
  '0.5',
  '1',
  '2',
  '3',
  '5',
  '8',
  '13',
  '20',
  '40',
  '100',
  '?',
] as const;

export const TSHIRT_VALUES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;

export const TSHIRT_POINTS: Record<string, number> = {
  XS: 1,
  S: 2,
  M: 3,
  L: 5,
  XL: 8,
  XXL: 13,
};

export const POINT_REGEX =
  /(?:\[|\()\s*(?:points?|story-points?|sp)\s*::\s*([^\])]+)\s*(?:\]|\))/i;
export const POINT_REGEX_GLOBAL =
  /(?:\[|\()\s*(?:points?|story-points?|sp)\s*::\s*([^\])]+)\s*(?:\]|\))/gi;

export function extractPoints(str: string): string | undefined {
  const match = str.match(POINT_REGEX);
  return match ? match[1].trim() : undefined;
}

export function removePointsFromTitle(title: string): string {
  return title.replace(POINT_REGEX_GLOBAL, '').replace(/ +/g, ' ').trim();
}

export function setPointsInTitleRaw(titleRaw: string, points?: string): string {
  const match = titleRaw.match(POINT_REGEX);
  if (points !== undefined && points !== null && points !== '') {
    const formatted = `[points:: ${points}]`;
    if (match) {
      return titleRaw.replace(POINT_REGEX, formatted);
    } else {
      const lines = titleRaw.split(/\r?\n/);
      lines[0] = lines[0].trim() ? `${lines[0].trim()} ${formatted}` : formatted;
      return lines.join('\n');
    }
  } else {
    // Remove points
    const lines = titleRaw.split(/\r?\n/);
    lines[0] = lines[0].replace(POINT_REGEX, '').trim();
    return lines.join('\n');
  }
}

export function getNumericPointValue(points?: string): number | null {
  if (points === undefined || points === null || points === '') return null;
  const trimmed = points.trim();
  const num = parseFloat(trimmed);
  if (!isNaN(num)) return num;
  const upper = trimmed.toUpperCase();
  if (upper in TSHIRT_POINTS) return TSHIRT_POINTS[upper];
  return null;
}

export function calculateLanePoints(lane: Lane): number {
  let total = 0;
  for (const item of lane.children) {
    const val = getNumericPointValue(item.data.metadata.points);
    if (val !== null) {
      total += val;
    }
  }
  return Math.round(total * 100) / 100;
}

export function laneHasPoints(lane: Lane): boolean {
  return lane.children.some(
    (item) => item.data.metadata.points !== undefined && item.data.metadata.points !== ''
  );
}

export function formatPointDisplay(points: string): string {
  const upper = points.toUpperCase();
  if (upper in TSHIRT_POINTS) {
    return upper;
  }
  if (points === '?') {
    return '? pts';
  }
  return `${points} pts`;
}
