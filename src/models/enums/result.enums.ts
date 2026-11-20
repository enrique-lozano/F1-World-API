/** The codes that a result can have in `positionText` instead of a finishing position (`"1"`, `"2"`...).
 *
 * These codes represent special result statuses such as Did Not Finish (DNF), Did Not Start (DNS), Disqualified (DSQ), etc.
 * Many of them are extracted from this Wikipedia legend: https://en.wikipedia.org/wiki/Template:F1_driver_results_legend_2 (some of them have been merged for this API)
 */
export enum ResultStatusCode {
  /** Took the start but retired and was not classified */
  DNF = 'DNF',
  /** Took the start and was running at the end but did not complete enough laps to be classified */
  NC = 'NC',
  /** Took the start but was disqualified from the race */
  DSQ = 'DSQ',
  /** Was due to take the start but did not take it: a failure or an accident on the way to the grid, the formation lap or the warm-up... (Tsunoda, Saudi Arabia 2022). In the old races, also the drivers that qualified and did not start, as the sources give it */
  DNS = 'DNS',
  /** Took part in qualifying but did not get a place on the grid */
  DNQ = 'DNQ',
  /** Took part in pre-qualifying but did not get through to qualifying */
  DNPQ = 'DNPQ',
  /** Was excluded from the event before the race */
  EX = 'EX',
  /** Was at the event but did not take part in any session */
  DNP = 'DNP',
  /** Was withdrawn from the event by the team or the driver, before the race: before the weekend, or after taking part in practice or qualifying (injured, ill, replaced, car not repaired...). E.g. Mick Schumacher, Saudi Arabia 2022, or Massa, Hungary 2017 */
  WD = 'WD',
  /** Was entered but did not arrive at the event */
  DNA = 'DNA',
  /** Only took part in free practice as a third or test driver. Calculated by the API: it is never stored in the race results */
  TD = 'TD'
}
