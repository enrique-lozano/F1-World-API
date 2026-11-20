import type { Chassis } from '../db/chassis.db';
import type { ConstructorDTO } from './constructor.dto';

export interface ChassisDTO extends Omit<Chassis, 'constructorId'> {
  /** The constructor that designed the chassis, whatever the entrant declared */
  chassisConstructor: ConstructorDTO | null;
}
