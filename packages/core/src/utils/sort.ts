export function orderIdPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

export function sortStringCompareFn(a: string, b: string, isAsc = true): number {
  if (!isAsc) {
    const temp = a;
    a = b;
    b = temp;
  }

  if (a < b) return -1;
  else if (a > b) return 1;
  else return 0;
}
