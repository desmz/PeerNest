import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { isNumber } from '@peernest/core';

import { TQueryParamsParsedValues } from '@/types/query-params';

@Injectable()
export class ParseQueryParamsPipe implements PipeTransform {
  transform(values: Record<string, string> | string, metadata: ArgumentMetadata) {
    if (metadata.type !== 'query' || typeof values === 'undefined') {
      return values;
    }

    const parseValue = (value: string): TQueryParamsParsedValues => {
      if (value === 'true') {
        return true;
      } else if (value === 'false') {
        return false;
      } else if (value.length === 0) {
        return value;
      } else if (isNumber(value)) {
        return Number(value);
      } else if (value.includes(',')) {
        return value.split(',').filter(Boolean).map(parseValue).flat();
      }

      return value;
    };

    if (typeof values !== 'object') {
      return parseValue(values);
    }

    const parsedValues: Record<string, TQueryParamsParsedValues> = {};

    for (const key in values) {
      const value = values[key];

      if (!value) {
        continue;
      }

      parsedValues[key] = parseValue(value);
    }

    return parsedValues;
  }
}
