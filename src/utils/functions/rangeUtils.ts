/**
 * Given an ordered array of numbers, return the ranges of this numbers.
 *
 * For example, [1,2,3,6,7,10,14] wil return in "1-3, 6-7, 10, 14"
 */
export function getTextFromOrderedArray(array: number[]) {
  return array
    .reduce((prev: any, curr) => {
      const lastGroup = prev.pop() || [];
      const lastValue = lastGroup.slice(-1)[0];
      if (curr - lastValue > 1) {
        return [...prev, lastGroup, [curr]];
      }
      return [...prev, [...lastGroup, curr]];
    }, [])
    .map((group: number[]) => {
      const first = group[0];
      const last = group[group.length - 1];
      return first !== last ? `${first}-${last}` : `${first}`;
    })
    .join(', ');
}

export function getOrderedArrayFromRangeText(text: string) {
  const ranges = text.split(',');

  const toReturn: number[] = [];

  const genRangeArray = (start: number, end: number) => {
    return Array.from({ length: end + 1 - start }, (v, k) => start + k);
  };

  ranges.forEach((range) => {
    const limits = range.split('-').map((x) => Number(x));

    if (limits.length > 1) {
      genRangeArray(limits[0], limits[1]).forEach((x) => {
        toReturn.push(x);
      });
    } else if (limits[0]) {
      toReturn.push(limits[0]);
    }
  });

  return toReturn;
}

/** Given an ascending array of seasons, return its ranges of consecutive ones: [1,2,3,6] -> [{from: 1, to: 3}, {from: 6, to: 6}] */
export function toSeasonRanges(seasons: number[]) {
  return seasons.reduce<{ from: number; to: number }[]>((ranges, season) => {
    const last = ranges[ranges.length - 1];
    if (last && season <= last.to + 1) last.to = season;
    else ranges.push({ from: season, to: season });
    return ranges;
  }, []);
}
