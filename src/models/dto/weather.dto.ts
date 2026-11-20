import type { WeatherPeriods } from '../db/weather.db';
import type { SessionDTO } from './session.dto';

export interface WeatherPeriodDTO extends Omit<WeatherPeriods, 'sessionId'> {
  session: SessionDTO | null;
}
