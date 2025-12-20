import ms, { StringValue } from 'ms';

export function second(value: StringValue) {
  return Math.floor(ms(value) / 1000);
}
