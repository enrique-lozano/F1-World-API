/** Tyre compound, relative to the dry ones of the weekend: `SOFT` is the softest. With only two dry compounds they are `SOFT` and `HARD` */
export enum TyreCompound {
  /** The softest dry compound of the weekend */
  SOFT = 'SOFT',
  /** The middle dry compound */
  MEDIUM = 'MEDIUM',
  /** The hardest dry compound of the weekend */
  HARD = 'HARD',
  /** For a damp track */
  INTERMEDIATE = 'INTERMEDIATE',
  /** For a very wet track */
  WET = 'WET'
}
