import type { RaceNeutralisations } from '../db/neutralisation.db';
import type { SessionDTO } from './session.dto';

export interface RaceNeutralisationDTO extends Omit<
  RaceNeutralisations,
  'sessionId'
> {
  session: SessionDTO | null;
}
