export interface LapTimes {
  entryId: string;
  sessionId: string;
  lap: number;
  time: number | null;
  /** Position of the driver in the race at the end of this lap */
  position: number | null;
}

export interface PitStops {
  entryId: string;
  sessionId: string;
  lap: number;
  time: number | null;
  timeOfDay: string | null;
  annotation: string | null;
}
