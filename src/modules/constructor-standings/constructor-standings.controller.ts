import { Get, Path, Query, Response, Route, Tags } from 'tsoa';
import { CommonController } from '../../controllers/common.controller';
import { ConstructorDTO, EngineManufacturerDTO } from '../../models/types.dto';
import { JsonApiError } from '../../utils/custom-error';
import { ConstructorStandingService } from './constructor-standings.service';

export interface ConstructorChampResult {
  /** Position in the standings (1 = champion) */
  position: number;

  /** Name used in the championship: the chassis constructor and, when it is not the maker of the engine, the engine brand (`Tyrrell-Ford`, `Ferrari`) */
  name: string;

  /** Designer of the chassis */
  chassisConstructor: ConstructorDTO | null;

  /** Brand of the engine of the cars (`engineBrand` of the entry, or its builder if it is not rebadged) */
  engineManufacturer: EngineManufacturerDTO | null;

  /** Points of the constructor in the season, in the specified round, applying the rules that only counted the best results of the season (until 1967) */
  points: number;

  /** Points that the constructor would have without excluding any result */
  totalPoints: number;

  /** Races (session `R`) won by a car of the constructor */
  wins: number;
}

@Route('championships')
@Tags('Championships')
export class ConstructorStandingController extends CommonController {
  /** Get the constructors' world championship for the specified season, calculated from the race results. It is not stored: it is the sum of the points of the results grouped by chassis constructor and engine brand, since two cars with the same chassis and different engines score separately (Tyrrell-Ford and Tyrrell-Renault in 1985).
   *
   * Rules applied:
   * - It exists since 1958. Earlier seasons return an empty list.
   * - Until 1978 only the best placed car of each constructor in a race scores; since 1979 all of them.
   * - The results with `pointsCountForWCC` = 0 (non-eligible third cars, constructors that were disqualified) do not score.
   * - The Indianapolis 500 of 1958-1960 does not count for the constructors.
   * - The point of the fastest lap (1958-1959) and the split points of the shared cars (until 1960) do not count.
   * - From 1958 to 1967 only the best N results of the season count (`points`), as in the drivers' championship. `totalPoints` are the points without excluding any result.
   *
   * What is NOT applied, so the points can differ from the official tables: the points deducted by the FIA that are not tied to a race result (e.g. Racing Point in 2020).
   *
   * @param round If specified, the result obtained will be the championship situation immediately after that round. */
  @Get('/{season}/constructors')
  @Response<JsonApiError>('4XX', 'Client error')
  async getConstructorChampionshipResults(
    @Path() season: number,
    @Query() round?: number
  ): Promise<ConstructorChampResult[]> {
    return this.tryKyselyExecution(
      new ConstructorStandingService().getConstructorChampionshipResults(
        season,
        round
      )
    );
  }
}
