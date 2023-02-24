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

  let toReturn: number[] = [];

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
