export interface Entries {
  id: string;
  driverId: string;
  driverNumber: number;
  entrantSeasonId: string;
  /** Registered name of the entrant, sponsors included. It can change within a season */
  entrantName: string;
  chassisId: string;
  engineId: string;
  /** Brand the engine is sold under when it is not its builder (Ford for a Cosworth). `null` if it is the builder */
  engineBrandId: string | null;
  tyreManufacturerId: string | null;
  /** 1 if the driver was entered as a third, reserve or test driver: he can only take part in free practice, and his result of a GP without a race result is `TD` */
  testDriver: number;
}
