import type { PrimitiveAtom } from 'jotai';

import { atom } from 'jotai';
import { Socket } from 'socket.io-client';

export const socketAtom: PrimitiveAtom<Socket | null> = atom<Socket | null>(null);
