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

export const zArray = (field: string): CheckTypeParams => zDataType(field, 'array');

// constraint error functions
export const zNonEmpty = (field: string): CheckTypeParams => ({
  message: `${field} must not be empty`,
});

export const zMin = (field: string, min: number): CheckTypeParams => ({
  message: `${field} must be at least ${min} characters`,
});

export const zMax = (field: string, max: number): CheckTypeParams => ({
  message: `${field} must be at most ${max} characters`,
});

export const zEmail = (field: string): CheckTypeParams => ({
  message: `${field} must be a valid email`,
});

export const zEnum = (field: string): CheckTypeParams => ({
  message: `${field} is not a valid enum`,
});
