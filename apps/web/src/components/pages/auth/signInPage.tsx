import { envObj } from '@peernest/config/static';
import { TSignInRo, TSignUpRo } from '@peernest/contract';
import { Helmet } from 'react-helmet-async';

import useAuth from '@/features/auth/hooks/use-auth';
import { useRedirectIfAuthenticated } from '@/features/auth/hooks/use-redirect-if-authenticated';

export default function SignInPage() {
  const { signIn, signUp, googleAuthenticate, isLoading } = useAuth();
  useRedirectIfAuthenticated();

  const signInData: TSignInRo = {
    email: 'lee.desmond2016@gmail.com',
    password: 'fdsf!l0289A',
  };

  const signUpData: TSignUpRo = {
    ...signInData,
    displayName: 'Lee Jia Hee',
  };

  async function onSignUpClick() {
    await signUp(signUpData);
  }

  async function onSignInClick() {
    await signIn(signInData);
  }

  async function onGoogleAuthenticateClick() {
    await googleAuthenticate();
  }

  return (
    <>
      <Helmet>
        <title>
          {'Login'} - {envObj.BRAND_NAME}
        </title>
      </Helmet>
      <div>
        <p>This is a auth page</p>
        <br />
        <p>{envObj.PUBLIC_ORIGIN}</p>
        <br />

        <br />
        <button type='button' onClick={onSignUpClick} disabled={isLoading}>
          Sign Up with Credential
        </button>
        <br />

        <button type='button' onClick={onSignInClick} disabled={isLoading}>
          Login with Credential
        </button>
        <br />

        <button type='button' onClick={onGoogleAuthenticateClick} disabled={isLoading}>
          Login with Google
        </button>
      </div>
    </>
  );
}
