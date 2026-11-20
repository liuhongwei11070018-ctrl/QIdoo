export type SceneRect = {left: number; top: number; width: number; height: number};
export type BubblePlacement = {id: string; left: number; top: number; shift: number; offset: number; arrow: number; compact?: boolean; side?: string};
export function placeSceneBubbles(options: {
  width: number; height: number;
  labels: (SceneRect & {id: string})[];
  bubbles: {id: string; width: number; height: number; status: string; compactWidth?: number; compactHeight?: number}[];
  obstacles?: SceneRect[];
  previous?: BubblePlacement[];
}): BubblePlacement[];
