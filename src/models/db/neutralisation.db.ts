import type {
  RaceNeutralisationCause,
  RaceNeutralisationKind
} from '../enums/neutralisation.enums';

export interface RaceNeutralisations {
  sessionId: string;
  /** Order inside the session */
  number: number;
  kind: RaceNeutralisationKind;
  /** Leader's lap on which it starts. 0 = before the first lap */
  lapStart: number;
  /** Leader's lap on which racing resumes (for a safety car, the lap after the one in which it comes in). `null` if unknown or if the race did not resume */
  lapEnd: number | null;
  /** Main cause. `null` if unknown */
  cause: RaceNeutralisationCause | null;
  /** `RED_FLAG` only: `Y`, `N`, `R` or `S`, as in the source. `N` is the race that ended with the stop */
  resumed: string | null;
  /** `RED_FLAG` only: who was not allowed to restart, as free text */
  excluded: string | null;
  description: string | null;
}
