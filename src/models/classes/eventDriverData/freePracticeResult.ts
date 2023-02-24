import { EventDriverData, EventDriverDataInStorage } from './eventDriverData';

export type FreePracticesResultStorage = EventDriverDataInStorage &
  FreePracticesResult;

export class FreePracticesResult extends EventDriverData {
  fp1Time?: number;
  fp1Pos?: number;
  fp1Laps?: number;
  fp2Time?: number;
  fp2Pos?: number;
  fp2Laps?: number;
  fp3Time?: number;
  fp3Pos?: number;
  fp3Laps?: number;
  fp4Time?: number;
  fp4Pos?: number;
  fp4Laps?: number;
  wuTime?: number;
  wuPos?: number;
  wuLaps?: number;

  constructor(
    data: FreePracticesResultStorage,
    completeObjects: EventDriverData
  ) {
    super({ ...completeObjects });

    Object.assign(this, data);
  }
}
