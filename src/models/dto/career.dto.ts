/**
 * Career statistics of a driver or a constructor. Only the main races (session `R`) are taken into account, except for the points.
 */
export interface CareerStats {
  /** Number of race entries: races (session `R`) with at least one result that is a position or a code with `raceEntry` = 1 in `/result-statuses` (it includes `DNS`, `DNQ`, `DNPQ`, `EX` and `DNP`, but not `WD` and `DNA`) */
  races: number;

  /** Number of races (session `R`) started: with at least one result that is a position or a code with `started` = 1 in `/result-statuses` (`DNF`, `NC`, `DSQ`) */
  starts: number;

  /** Number of races (session `R`) won, that is, with a result in the first position (`positionText` = `1`). Sprint races are not counted */
  wins: number;

  /** Number of podium positions (`positionText` = `1`, `2` or `3`) obtained in the races (session `R`). A disqualified result is not a podium. For the constructors, each podium position of its cars counts */
  podiums: number;

  /** Number of races (session `R`) started from the first position of the grid (`gridPosition` = `1` in the race results). This is the pole position in almost all the races, but it may differ from the qualifying result if there were grid penalties */
  poles: number;

  /** Number of races (session `R`) in which the fastest lap of the race was set (`time` of the lap equal to the minimum of the session). Only available for the races with lap times (from 1996 onwards) */
  fastestLaps: number;

  /** Sum of the points of all the race results (main races and sprint races), including the results that were dropped from the championship. For the constructors this is the sum of the points of its drivers, which is not the same as the points of the constructors' championship */
  points: number;
}

export interface ConstructorCareerStats extends CareerStats {
  /** Number of Constructors' Championships won, that is, seasons in which a car of the constructor (with any engine) finished in the first position of the calculated standings (see `/championships/{season}/constructors`). Only available from 1958 */
  championships: number;
}

export interface DriverCareerStats extends CareerStats {
  /** Number of drivers' world championships won, that is, seasons that the driver finished in the first position of the standings (see `/championships/{season}/drivers`). A season still in progress is counted if the driver leads it */
  championships: number;
}
