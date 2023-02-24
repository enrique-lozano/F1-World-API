import { Get, Path, Route, Tags } from 'tsoa';
import { Event, RaceEventStorage } from './../models/classes/raceEvent';
import { CircuitService } from './circuit.service';
import { DbService } from './db.service';
import { GrandPrixService } from './grandPrix.service';
import { LapService } from './lap.service';

@Route('/events')
@Tags('Events')
export class EventService extends DbService {
  private instanciateNewClass(elToInstanciate: RaceEventStorage) {
    const grandPrix = this.grandPrixService.getById(
      elToInstanciate.grandPrixId
    );
    const circuit = this.circuitService.getById(elToInstanciate.circuitId);

    return new Event(elToInstanciate, circuit, grandPrix);
  }

  get() {
    const raceEvents = this.db
      .prepare('SELECT * FROM events')
      .all() as RaceEventStorage[];

    return raceEvents.map((x) => this.instanciateNewClass(x));
  }

  /** Gets a event by its ID
   *
   * @param id The ID of the event to get */ @Get('{id}')
  getById(@Path() id: string) {
    const el = this.db
      .prepare('SELECT * FROM events WHERE id = ?')
      .get(id) as RaceEventStorage;

    return this.instanciateNewClass(el);
  }

  /** Gets the fastest lap of a race event
   *
   * @param id The ID of the event to get */ @Get('{id}/fastest-lap')
  getEventFastestLap(@Path() id: string) {
    const raceLapTimes = this.lapService.getLaps({
      raceId: id,
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
