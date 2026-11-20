/**
 * - `NATURALLY_ASPIRATED`: no forced induction
 * - `SUPERCHARGED`: with a compressor (`c` in the old names)
 * - `TURBOCHARGED`: with a turbo (`t` in the old names)
 */
export type EngineAspiration =
  'NATURALLY_ASPIRATED' | 'SUPERCHARGED' | 'TURBOCHARGED';
