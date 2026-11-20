import type { SuccessionType } from '../enums/entrant.enums';

export interface Entrants {
  id: string;
  /** Clean name of the team, without sponsors */
  name: string;
  companyId: string | null;
}

export interface EntrantSeasons {
  id: string;
  entrantId: string;
  season: number;
  ownConstructorId: string | null;
  licenceCountryId: string | null;
}

export interface EntrantSuccessions {
  predecessorId: string;
  successorId: string;
  year: number;
  type: SuccessionType;
}
