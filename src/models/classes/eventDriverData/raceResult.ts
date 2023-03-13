import { EventDriverData, EventDriverDataInStorage } from './eventDriverData';

export type RaceResultStorage = EventDriverDataInStorage &
  Pick<
    RaceResult,
    | 'positionOrder'
    | 'positionText'
    | 'position'
    | 'laps'
    | 'time'
    | 'timePenalty'
    | 'timePenaltyMillis'
    | 'gap'
    | 'reasonRetired'
    | 'gridPos'
    | 'points'
    | 'pointsGained'
  > & {
    pointsCountForWDC: 1 | 0;
  };

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

  /** Points that this result awards the driver for the WDC */
  points: number;

  /** Difference between the points that the driver has in the WDC at the end of this round and the ones he/she had after the previous round. This number usually coincides with the points awarded for the result, except in some cases until 1990, where only the N best results were taken into account.
   *
   * @see https://en.wikipedia.org/wiki/List_of_Formula_One_World_Championship_points_scoring_systems#Points_scoring_systems
   */
  pointsGained: number;

  /** Whether or not the result counts for the final calculation of the WDC points (at the end of the year). It is usually true, except in some cases until 1990, where only the N best results were taken into account.
   *
   * @see https://en.wikipedia.org/wiki/List_of_Formula_One_World_Championship_points_scoring_systems#Points_scoring_systems
   */
  pointsCountForWDC: boolean;

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
    this.gridPos = data.gridPos;

    this.points = data.points;
    this.pointsGained = data.pointsGained;
    this.pointsCountForWDC = data.pointsCountForWDC == 1 ? true : false;

    if (this.position && Number(this.gridPos))
      this.positionsGained = Number(this.gridPos) - this.position;
  }
}
