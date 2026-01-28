import { MAX_PERCHER_NOTE_LEN, MIN_PERCHER_NOTE_LEN } from '@peernest/core';
import z from 'zod';

import { TApiMethod } from '../types';
import { userIdSchema, zMinMaxString } from '../utils';

export const ADD_PERCHER_METHOD: TApiMethod = 'post';

export const ADD_PERCHER_URL = '/counselors/me/perchers';

export const addPercherFields = {
  percherId: 'Percher Id',
  note: 'Note',
} as const;

export const addPercherRoSchema = z.object({
  percherId: userIdSchema(addPercherFields.percherId),
  note: zMinMaxString(addPercherFields.note, MIN_PERCHER_NOTE_LEN, MAX_PERCHER_NOTE_LEN).nullable(),
});

export type TAddPercherRo = z.infer<typeof addPercherRoSchema>;
