import type { QualyFormat } from '../enums/session.enums';

export interface Events {
  id: string;
  grandPrixId: string;
  name: string;
  qualyFormat: QualyFormat;
  circuitLayoutId: string;
  scheduledLaps: number | null;
  posterURL: string | null;
}

export interface GrandsPrix {
  id: string;
  name: string;
  fullName: string;
  shortName: string;
  countryId: string | null;
}
