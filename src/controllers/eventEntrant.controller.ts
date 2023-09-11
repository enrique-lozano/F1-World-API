import { Get, Queries, Route, Tags } from 'tsoa';
import {
  EventDriverData,
  EventDriverDataInStorage
} from '../models/classes/eventDriverData/eventDriverData';
import {
  PageMetadata,
  PageQueryParams,
  Paginator
} from '../models/interfaces/paginated-items';
import { Sorter, SorterQueryParams } from '../models/interfaces/sorter';
import { DbService } from '../services/db.service';
import { parseSearchQueryParams } from '../utils/objAttributesToStr';
import { CompanyService } from './company.controller';
import { DriverService } from './driver.controller';
import { EventService } from './event.controller';
import { SeasonEntrantService } from './seasonEntrant.controller';
import { TyreManufacturerService } from './tyreManufacturer.controller';

export interface EventEntrantQueryParamsWithoutSort
  extends PageQueryParams,
    SorterQueryParams {
  /** If specified, the call will return only the results where the company that has this ID appears as the chassis manufacturer */
  chassisManufacturerId?: string;

  /** If specified, the call will return only the results where the company that has this ID appears as the  engine manufacturer */
  engineManufacturerId?: string;

  /** If specified, it will return only results relative to the event that has this ID */
  eventId?: string;

  /** If specified, it will return only results relative to this year's events */
  year?: number;

  /** If specified, it will return only results relative to the pilot having this ID */
  driverId?: string;
}

export interface EventEntrantQueryParams
  extends EventEntrantQueryParamsWithoutSort {
  /** @default eventId */
  orderBy?: keyof EventDriverDataInStorage;
}

@Route('event-entrants')
@Tags('Event Entrants')
export class EventEntrantService extends DbService {
  private instanciateNewClass(eventEntrant: EventDriverDataInStorage) {
    return new EventDriverData({
      ...eventEntrant,
      seasonEntrant: this.seasonEntrantService.getFromDB(
        eventEntrant.seasonEntrantId
      ),
      driver: this.driverService.getById(eventEntrant.driverId),
      race: this.eventService.getById(eventEntrant.eventId),
      chassisManufacturer: this.companyService.getById(
        eventEntrant.chassisManufacturerId
      ) as any,
      engineManufacturer: this.companyService.getById(
        eventEntrant.engineManufacturerId
      ) as any,
      tyreManufacturer: this.tyreManufacturerService.getById(
        eventEntrant.tyreManufacturerId
      )
    });
  }

  getEntrantInfo(data: EventDriverDataInStorage) {
    return this.instanciateNewClass(data);
  }

  @Get('/')
  getEventEntrants(@Queries() obj: EventEntrantQueryParams) {
    const sorter = new Sorter<EventDriverDataInStorage>(
      obj.orderBy || 'eventId',
      obj.orderDir
    );

    const paginator = new Paginator(obj.pageNo, obj.pageSize);

    let whereStatement = '';

    const params = parseSearchQueryParams(obj);

    if (Object.values(params).length) {
      whereStatement += ' WHERE ';

      let searchQueries: string[] = [];

      if (params.eventId) searchQueries.push(`eventId = :eventId`);
      if (params.driverId) searchQueries.push(`driverId = :driverId`);
      if (params.chassisManufacturerId)
        searchQueries.push(`chassisManufacturerId = :chassisManufacturerId`);
      if (params.engineManufacturerId)
        searchQueries.push(`engineManufacturerId = :engineManufacturerId`);
      if (params.year)
        searchQueries.push(`cast(substr(eventId, 1, 4) as INT) = :year`);

      whereStatement += searchQueries.join(' AND ');
    }

    const eventEntrantsInDB = this.db
      .prepare(
        'SELECT * FROM eventEntrants WHERE eventId = ?' +
          `${whereStatement} ${sorter.sqlStatement} ${paginator.sqlStatement}`
      )
      .all(params) as EventDriverDataInStorage[];

    const totalElements = this.db
      .prepare('SELECT * FROM eventEntrants WHERE eventId = ?' + whereStatement)
      .get(params)['COUNT(*)'];

    return {
      pageData: new PageMetadata(
        totalElements,
        paginator.pageNo,
        paginator.pageSize
      ),
      items: eventEntrantsInDB.map((x) => this.instanciateNewClass(x))
    };
  }

  private get eventService() {
    return new EventService();
  }

  private get driverService() {
    return new DriverService();
  }

  private get tyreManufacturerService() {
    return new TyreManufacturerService();
  }

  private get companyService() {
    return new CompanyService();
  }

  private get seasonEntrantService() {
    return new SeasonEntrantService();
  }
}
