# RaceDex

Open Formula 1 data, from 1950 onwards, served as CSV files, a SQLite database and a REST API.

## Circuits

**Circuit**:
The venue where races are held (Silverstone, Monza). It is one place and one facility whatever the configuration raced on it.
_Avoid_: Track, venue

**Circuit status**:
`IN_USE` if the Circuit still holds motorsport events of any category, `HISTORIC` if it is closed, abandoned, demolished or built over. It is about the venue, not about Formula 1.

**Layout**:
One configuration of a Circuit, with its own race-lap length and corner sequence. A new Layout exists whenever the race lap changes, whatever its length; a Layout that comes back years later is the same Layout.
_Avoid_: Track layout, configuration, variant, circuit version

**Race lap**:
The lap that is driven in a race on a Layout, from the start line to the start line. It defines the length and the corners of the Layout.

**Geometry**:
The shape of a Layout as lat/lon points. It is optional: a Layout without it still has its text data.

**Start line**:
The line where each lap of a Layout starts and ends. It is the first point of the Geometry when the Geometry says so (`startLine`), and every distance along a Layout is measured from it.
_Avoid_: Finish line, start/finish line, meta

**Turns**:
The official number of corners of a Layout, as the sources count them. It is a count, not the list of Corners.

**Corner**:
A numbered bend of a Layout, as in the official track map, marked by a point on its apex in the Geometry. Its distance from the Start line is derived. Its name is optional.
_Avoid_: Turn (except for the official count, `turns`), bend

**Sector**:
One of the three parts of a Layout timed separately. Where they end is a point of the Geometry, valid for every season of the Layout unless it says otherwise (`from`, `until`), since the timing lines can move without changing the lap. Only where sector 1 and sector 2 end is stored: sector 3 ends at the Start line.

**Pit lane**:
The lane beside the track that cars use to stop for tyres or repairs. It is an optional line of the Geometry.

**Track record**:
The fastest lap ever set in a qualifying session on a Layout.
_Avoid_: Pole lap

**Lap record**:
The fastest lap ever set in a race on a Layout. Lap times exist from 1996.
_Avoid_: Fastest lap (which is the best lap of one race)

## Races

**Leader's lap**:
The lap the race leader is on. It is the time axis of weather, neutralisations and stints, so they work for races of any age. Lap 0 is the time before the first lap.
_Avoid_: Lap number (alone), time of day

**Neutralisation**:
Any interruption of the pace of a race: a Safety car, a Full-course yellow or a Red flag.

**Safety car**:
A pace car leads the field, which bunches up behind it. It includes the full-course caution of other series.

**Full-course yellow**:
Every car slows down to a limit and keeps its gaps, with no pace car. It is the virtual safety car of Formula 1 and the FCY of the endurance series and Formula E.
_Avoid_: VSC, virtual safety car (the F1 name of the same thing)

**Stint**:
The time a driver runs on one set of tyres, between two stops.
