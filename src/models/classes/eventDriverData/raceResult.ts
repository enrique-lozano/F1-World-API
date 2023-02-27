import { Except } from 'type-fest';
import { EventDriverData, EventDriverDataInStorage } from './eventDriverData';

export type RaceResultStorage = EventDriverDataInStorage &
  Except<RaceResult, 'positionsGained'>;

export class RaceResult extends EventDriverData {
  /** Finishing position in the race, converted to number. Will be `nan` if the driver has not finished the race */
  position: number;

  /** Finishing position in the race. Could be `DNF`, `DNQ`... if the driver has not finished the race */
  positionText: string | number;

  positionOrder: number;

  /** Number of laps completed */
  laps: number;

  time: number;
  timePenalty: string | null;
  timePenaltyMillis?: number;
  gap: string | null;
  reasonRetired: string | null;
  points: number;
  gridPos: string;

  /** The positions gained during the race */
  positionsGained?: number;

  constructor(data: RaceResultStorage, completeObjects: EventDriverData) {
    super({ ...completeObjects });

    this.positionText = data.positionText;
    this.positionOrder = data.positionOrder;
    this.position = data.position;

    this.laps = data.laps;
    this.time = data.time;
    this.timePenalty = data.timePenalty;

    if (this.timePenaltyMillis) this.timePenaltyMillis = data.timePenaltyMillis;

    this.gap = data.gap;

    this.reasonRetired = data.reasonRetired;
    this.points = data.points;
    this.gridPos = data.gridPos;

    if (this.position && Number(this.gridPos))
      this.positionsGained = Number(this.gridPos) - this.position;
  }
}
