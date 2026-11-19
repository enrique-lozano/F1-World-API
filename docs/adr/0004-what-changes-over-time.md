# What changes over the life of a layout, and what we do about it

A layout (ADR 0001) is the lap. Around it there are facts that can change without the lap changing. We do not model all of them: how common each is decides what we do.

| Fact | How often it changes | What we keep |
|---|---|---|
| The lap (length, sequence of corners) | The reason a layout exists | A new layout (ADR 0001) |
| Where the timing sectors end | Hardly ever | One pair of points, for every season; optional `from`/`until` if it moved (ADR 0003) |
| Pit lane | Sometimes rebuilt, the lap stays | One shape, the latest known |
| Start line | Rarely moved | One position: the first point of the `track`. If moving it changes the official numbering of the corners, it is a new layout |
| Corner numbers | With the start line, if at all | One `Point` per corner, on its apex |
| Corner names | Occasionally | One name, the current one, as a property of the corner |
| Start and end of the pit speed limit | Rarely, and only since 1994 | Two `pit-limit-start`/`pit-limit-end` points on the pit lane of the layouts raced from 1994 |
| Names of the circuit | A few times in its life | `circuitNames`: each name with its first and last year |
| Whether the circuit is still used | Once, when it closes | `status` (`IN_USE`, `HISTORIC`) and `opened` in `circuits` |
| Different sector lines or pit lane per event or category | Exceptional | Not modelled |

## Consequences

- The shape in the file is the layout as it was last raced and best known, not a different drawing per season. A drawing for an old race can be slightly off in the pit lane or the start line.
- The rules above are only the default: a case that really matters is added as a property of the file (`from`, `until`) or as a new layout, never as a column per season in a CSV.
- RaceDex only holds Formula 1 races. Everything about other categories (their sectors, their pit lane use) is out of scope.
