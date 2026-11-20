/** What happened to the pace of the race */
export enum RaceNeutralisationKind {
  /** The field follows a pace car and bunches up (F1 safety car, IndyCar full-course caution) */
  SAFETY_CAR = 'SAFETY_CAR',
  /** Every car slows down to a limit and keeps its gaps, without a pace car (F1 virtual safety car, FCY of WEC and Formula E) */
  FULL_COURSE_YELLOW = 'FULL_COURSE_YELLOW',
  /** The race is stopped */
  RED_FLAG = 'RED_FLAG'
}

export enum RaceNeutralisationCause {
  /** One or more cars crashed */
  ACCIDENT = 'ACCIDENT',
  /** Rain, mist or any other weather */
  WEATHER = 'WEATHER',
  /** Pieces of a car or of something else on the track */
  DEBRIS = 'DEBRIS',
  /** A car stopped in a dangerous place, or a vehicle on the track */
  STRANDED_CAR = 'STRANDED_CAR',
  /** The track or its barriers needed repair (loose drain cover, damaged barrier) */
  TRACK_DAMAGE = 'TRACK_DAMAGE',
  /** Any other cause (a person on the track, a vehicle...) */
  OTHER = 'OTHER'
}
