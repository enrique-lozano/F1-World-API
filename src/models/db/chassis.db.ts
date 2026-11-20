export interface Chassis {
  id: string;
  constructorId: string;
  /** Model of the chassis (`012`, `MP4/4`). `null` when it is unknown */
  name: string | null;
}
