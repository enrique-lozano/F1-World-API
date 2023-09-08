import { Get, Path, Queries, Route, Tags } from 'tsoa';
import { Event, EventInDB } from '../models/classes/event';
import {
  PageMetadata,
  PageQueryParams,
  Paginator
} from '../models/interfaces/paginated-items';
import { Sorter, SorterQueryParams } from '../models/interfaces/sorter';
import { DbService } from '../services/db.service';
import { parseSearchQueryParams } from '../utils/objAttributesToStr';
import { CircuitService } from './circuit.controller';
import { EventEntrantService } from './eventEntrant.controller';
import { FreePracticeResultService } from './freePracticeResult.controller';
import { GrandPrixService } from './grandPrix.controller';
import { LapService } from './lap.controller';
import { PitStopService } from './pitStop.controller';
import { RaceResultService } from './raceResult.controller';

interface EventQueryParams extends PageQueryParams, SorterQueryParams {
  circuitId?: string;

  year?: number;

  /** @default id */
  orderBy?: keyof EventInDB;
}

@Route('/events')
@Tags('Events')
export class EventService extends DbService {
  private instanciateNewClass(elToInstanciate: EventInDB) {
    const grandPrix = this.grandPrixService.getById(
      elToInstanciate.grandPrixId
    );
    const circuit = this.circuitService.getById(elToInstanciate.circuitId);

    return new Event(elToInstanciate, null as any, grandPrix);
  }

  /** Get events based on some params */ @Get('/')
  get(@Queries() obj: EventQueryParams) {
    const sorter = new Sorter<EventInDB>(obj.orderBy || 'id', obj.orderDir);

    const paginator = new Paginator(obj.pageNo, obj.pageSize);

    let whereStatement = '';

    const params = parseSearchQueryParams(obj);

    if (Object.values(params).length) {
      whereStatement += ' WHERE ';

      let searchQueries: string[] = [];

      if (params.circuitId) searchQueries.push(`circuitId = :circuitId`);
      if (params.year)
        searchQueries.push(`cast(substr(eventId, 1, 4) as INT) = :year`);

      whereStatement += searchQueries.join(' AND ');
    }

    const eventsInDB = this.db
      .prepare(
        'SELECT * FROM events' +
          `${whereStatement} ${sorter.sqlStatement} ${paginator.sqlStatement}`
      )
      .all(params) as EventInDB[];

    const totalElements = this.db
      .prepare('SELECT COUNT(*) FROM events' + whereStatement)
      .get(params)['COUNT(*)'];

    return {
      pageData: new PageMetadata(
        totalElements,
        paginator.pageNo,
        paginator.pageSize
      ),
      items: eventsInDB.map((x) => this.instanciateNewClass(x))
    };
  }

  /** Get a event by its ID
   *
   * @param eventId The ID of the event to get */ @Get('{eventId}')
  getById(@Path() eventId: string) {
    const el = this.db
      .prepare('SELECT * FROM events WHERE id = ?')
      .get(eventId) as EventInDB;

    return this.instanciateNewClass(el);
  }

  private get circuitService() {
    return new CircuitService();
  }

  private get grandPrixService() {
    return new GrandPrixService();
  }

  private get lapService() {
    return new LapService();
  }

  private get pitStopService() {
    return new PitStopService();
  }

  private get raceResultService() {
    return new RaceResultService();
  }

  private get FPService() {
    return new FreePracticeResultService();
  }

  private get eventEntrantService() {
    return new EventEntrantService();
  }
}
