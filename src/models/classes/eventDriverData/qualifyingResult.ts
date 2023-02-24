import { EventDriverData, EventDriverDataInStorage } from './eventDriverData';

export type QualifyingResultStorage = EventDriverDataInStorage &
  QualifyingResult;

export class QualifyingResult extends EventDriverData {
  laps?: number;
  preQualyTime?: number;
  preQualyPos?: string;
  qualy1Time?: number;
  qualy1Pos?: string;
  qualy2Time?: number;
  qualy2Pos?: string;
  Q1?: number;
  Q2?: number;
  Q3?: number;
  time?: number;
  pos: string;

  constructor(data: QualifyingResultStorage, completeObjects: EventDriverData) {
    super({ ...completeObjects });

    this.pos = data.pos;

    Object.assign(this, data);
  }
}
