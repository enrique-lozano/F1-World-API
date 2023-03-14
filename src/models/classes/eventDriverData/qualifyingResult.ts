import { EventDriverData } from './eventDriverData';
import {
  TimedSessionResult,
  TimedSessionResultStorage
} from './TimedSessionResult';

export type QualifyingResultStorage = TimedSessionResultStorage &
  Pick<
    QualifyingResult,
    | 'q1Time'
    | 'q2Time'
    | 'q3Time'
    | 'qualy1Pos'
    | 'qualy1Time'
    | 'qualy2Pos'
    | 'qualy2Time'
  >;

export class QualifyingResult extends TimedSessionResult {
  q1Time: number | null;
  q2Time: number | null;
  q3Time: number | null;

  qualy1Time: number | null;
  qualy1Pos: string | null;
  qualy2Time: number | null;
  qualy2Pos: string | null;

  constructor(data: QualifyingResultStorage, completeObjects: EventDriverData) {
    super(data, completeObjects);

    this.q1Time = data.q1Time;
    this.q2Time = data.q2Time;
    this.q3Time = data.q3Time;

    this.qualy1Time = data.qualy1Time;
    this.qualy1Pos = data.qualy1Pos;
    this.qualy2Pos = data.qualy2Pos;
    this.qualy2Time = data.qualy2Time;
  }
}
