import { SIGN_IN, SIGN_OUT, SIGN_UP, TSignInRo, TSignUpRo } from '@peernest/contract';

import api from '@/lib/api-client';

export async function signUp(data: TSignUpRo) {
  await api.post<void>(SIGN_UP, data);
}

export async function signIn(data: TSignInRo) {
  await api.post<void>(SIGN_IN, data);
}

export async function signOut() {
  await api.post<void>(SIGN_OUT);
}
