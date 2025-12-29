import { SIGN_IN_URL, SIGN_OUT_URL, SIGN_UP_URL, TSignInRo, TSignUpRo } from '@peernest/contract';

import api from '@/lib/api-client';

export async function signUp(data: TSignUpRo) {
  await api.post<void>(SIGN_UP_URL, data);
}

export async function signIn(data: TSignInRo) {
  await api.post<void>(SIGN_IN_URL, data);
}

export async function signOut() {
  await api.post<void>(SIGN_OUT_URL);
}
