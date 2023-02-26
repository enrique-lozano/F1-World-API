import { Get, Path, Queries, Route, Tags } from 'tsoa';
import { Event, EventInDB } from '../models/classes/event';
import {
  PageMetadata,
  pageQueryParams,
  Paginator
} from '../models/interfaces/paginated-items';
import { Sorter, SorterQueryParams } from '../models/interfaces/sorter';
import { parseSearchQueryParams } from '../utils/objAttributesToStr';
import { CircuitService } from './circuit.service';
import { DbService } from './db.service';
import { GrandPrixService } from './grandPrix.service';
import { LapService } from './lap.service';

interface EventQueryParams extends pageQueryParams, SorterQueryParams {
  circuitId?: string;

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

    return new Event(elToInstanciate, circuit, grandPrix);
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

      whereStatement += searchQueries.join(' AND ');
    }

    const eventsInDB = this.db
      .prepare(
        'SELECT * FROM raceResults' +
          `${whereStatement} ${sorter.sqlStatement} ${paginator.sqlStatement}`
      )
      .all(params) as EventInDB[];

    const totalElements = this.db
      .prepare('SELECT COUNT(*) FROM raceResults' + whereStatement)
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

  /** Gets a event by its ID
   *
   * @param id The ID of the event to get */ @Get('{id}')
  getById(@Path() id: string) {
    const el = this.db
      .prepare('SELECT * FROM events WHERE id = ?')
      .get(id) as EventInDB;

    return this.instanciateNewClass(el);
  }

  /** Gets the fastest lap of a race event
   *
   * @param id The ID of the event to get */ @Get('{id}/fastest-lap')
  getEventFastestLap(@Path() id: string) {
    const raceLapTimes = this.lapService.getLaps({
      eventId: id,
      orderBy: 'time',
      pageSize: 1
    });

    return raceLapTimes.items[0];
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
}
