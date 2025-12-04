export function isEmptyObject(obj: object) {
  return Object.keys(obj).length === 0;
}

export function isNumber(value: unknown): value is number {
  return !isNaN(Number(value));
}
