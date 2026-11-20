import type { Weather } from '../enums/weather.enums';

export interface WeatherPeriods {
  sessionId: string;
  /** Leader's lap on which this period starts. The period with `lapStart` 1 is the base of the session; later ones only exist when something changed */
  lapStart: number;
  weather: Weather | null;
  /** Celsius */
  airTemperature: number | null;
  /** Celsius */
  trackTemperature: number | null;
}
