import { MAX_PERCHER_NOTE_LEN, MIN_PERCHER_NOTE_LEN } from '@peernest/core';
import z from 'zod';

import { TApiMethod } from '../types';
import { userIdSchema, zMinMaxString } from '../utils';

export const UPDATE_PERCHER_NOTE_METHOD: TApiMethod = 'patch';

export const UPDATE_PERCHER_NOTE_URL = '/counselors/me/perchers/{percherId}/note';

export const updatePercherNoteParamFields = {
  percherId: 'Percher Id Param',
} as const;

export const updatePercherNoteParamsSchema = z.object({
  percherId: userIdSchema(updatePercherNoteParamFields.percherId),
});

export type TUpdatePercherNoteParams = z.infer<typeof updatePercherNoteParamsSchema>;

export const updatePercherNoteFields = {
  note: 'Note',
} as const;

export const updatePercherNoteRoSchema = z.object({
  note: zMinMaxString(
    updatePercherNoteFields.note,
    MIN_PERCHER_NOTE_LEN,
    MAX_PERCHER_NOTE_LEN
  ).nullable(),
});

export type TUpdatePercherNoteRo = z.infer<typeof updatePercherNoteRoSchema>;
