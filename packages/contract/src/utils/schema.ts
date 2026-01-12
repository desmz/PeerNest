import { CheckTypeParams } from 'zod/v4/core';

// utils functions
const zRequired = (field: string) => `${field} is required`;

const zInvalidType = (field: string, dataType: string) => `${field} must be a ${dataType}`;

const zDataType = (field: string, dataType: string): CheckTypeParams => ({
  error: (issue) => (issue.input === undefined ? zRequired(field) : zInvalidType(field, dataType)),
});

// main functions
// datatype error functions
export const zString = (field: string): CheckTypeParams => zDataType(field, 'string');

export const zBoolean = (field: string): CheckTypeParams => zDataType(field, 'boolean');

export const zNumber = (field: string): CheckTypeParams => zDataType(field, 'number');

export const zInt = (field: string): CheckTypeParams => zDataType(field, 'integer');

export const zArray = (field: string): CheckTypeParams => zDataType(field, 'array');

export const zDate = (field: string): CheckTypeParams => zDataType(field, 'date');

export const zIsoDuration = (field: string): CheckTypeParams =>
  zDataType(field, 'ISO duration. (exp: P0Y0M0DT6H30M0S)');

// constraint error functions
export const zNonEmpty = (field: string): CheckTypeParams => ({
  message: `${field} must not be empty`,
});

export const zStartWith = (field: string, prefix: string): CheckTypeParams => ({
  message: `${field} must start with "${prefix}"`,
});

export const zMin = (field: string, min: number, unit = 'characters'): CheckTypeParams => ({
  message: `${field} must be at least ${min} ${unit}`,
});

export const zMax = (field: string, max: number, unit = 'characters'): CheckTypeParams => ({
  message: `${field} must be at most ${max} ${unit}`,
});

export const zArrayMin = (field: string, min: number): CheckTypeParams => ({
  error: `${field} must be at least ${min} items`,
});

export const zArrayMax = (field: string, max: number): CheckTypeParams => ({
  error: `${field} must be at most ${max} items`,
});

export const zEmail = (field: string): CheckTypeParams => ({
  message: `${field} must be a valid email`,
});

export const zEnum = (field: string): CheckTypeParams => ({
  message: `${field} is not a valid enum`,
});

export const zPositive = (field: string): CheckTypeParams => ({
  message: `${field} must be a positive number`,
});
