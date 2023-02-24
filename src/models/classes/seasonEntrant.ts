import { Except } from 'type-fest';
import { getOrderedArrayFromRangeText } from './../../utils/rangeUtils';
import { Modify } from './../../utils/types';
import { Constructor } from './constructor';
import { Driver } from './driver';
import { EngineManufacturer } from './engineManufacturer';
import { TyreManufacturer } from './tyreManufacturer';

export type SeasonEntrantStorage = Except<SeasonEntrant, 'constructors'>;

export class SeasonEntrant {
  id: string;
  season: number;
  countryId: string;
  name: string;

  constructors: SeasonEntrantConstructor[];

  constructor(
    data: SeasonEntrantStorage,
    constructors: SeasonEntrantConstructor[]
  ) {
    this.id = data.id;
    this.season = data.season;
    this.countryId = data.countryId;
    this.name = data.name;

    this.constructors = constructors;
  }
}

export type SeasonEntrantConstructorStorage = Except<
  SeasonEntrantConstructor,
  'constructorData' | 'engineManufacturer' | 'tyreManufacturers' | 'drivers'
> & {
  entrantId: string;
  constructorId: string;
  engineManufacturerId: string;
};

export class SeasonEntrantConstructor {
  id: string;
  engineManufacturer: EngineManufacturer;
  constructorData: Constructor;

  tyreManufacturers: SeasonEntrantConstructorTyres[];
  drivers: SeasonEntrantConstructorDriver[];

  constructor(
    data: SeasonEntrantConstructorStorage,
    tyres: SeasonEntrantConstructorTyres[],
    drivers: SeasonEntrantConstructorDriver[],
    constructor: Constructor,
    engineManufacturer: EngineManufacturer
  ) {
    this.id = data.id;

    this.constructorData = constructor;
    this.engineManufacturer = engineManufacturer;

    this.tyreManufacturers = tyres;
    this.drivers = drivers;
  }
}

export type SeasonEntrantConstructorTyresStorage = Except<
  SeasonEntrantConstructorTyres,
  'tyreManufacturer'
> & {
  tyreManufacturerId: string;
  entrantConstructorId: string;
};

export class SeasonEntrantConstructorTyres {
  tyreManufacturer: TyreManufacturer;
  roundsText: string | null;
  rounds: number[] | null;

  constructor(
    data: SeasonEntrantConstructorTyresStorage,
    tyre: TyreManufacturer
  ) {
    this.roundsText = data.roundsText;
    this.rounds = this.roundsText
      ? getOrderedArrayFromRangeText(this.roundsText)
      : null;

    this.tyreManufacturer = tyre;
  }
}

export type SeasonEntrantConstructorDriverStorage = Modify<
  Except<SeasonEntrantConstructorDriver, 'driver'> & {
    driverId: string;
    entrantConstructorId: string;
  },
  {
    roundsText: string | number;
  }
>;

export class SeasonEntrantConstructorDriver {
  driver: Driver;
  roundsText: string;
  rounds: number[];
  testDriver: boolean;

  constructor(data: SeasonEntrantConstructorDriverStorage, driver: Driver) {
    this.roundsText = String(data.roundsText);
    this.rounds = getOrderedArrayFromRangeText(this.roundsText);
    this.testDriver = data.testDriver;
    this.driver = driver;
  }
}
