export function generateSequence(min: number, max: number, step: number) {
  const result: number[] = [];

  for (let i = min; i <= max; i += step) {
    result.push(i);
  }

  if (result.length > 0 && result[result.length - 1] !== max) {
    result.push(max);
  }

  return result;
}
