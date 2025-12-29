import { envObj } from '@peernest/config/static';
import { TSignInRo, TSignUpRo } from '@peernest/contract';
import { Helmet } from 'react-helmet-async';

import useAuth from '@/features/auth/hooks/use-auth';
import { useRedirectIfAuthenticated } from '@/features/auth/hooks/use-redirect-if-authenticated';

export default function SignInPage() {
  const { signIn, signUp, googleAuthenticate, isLoading } = useAuth();
  useRedirectIfAuthenticated();

  const signInData: TSignInRo = {
    email: 'lalelilolu7729@gmail.com',
    password: 'PeerNest!6214',
  };

  const signUpData: TSignUpRo = {
    ...signInData,
    displayName: 'Alex Bob',
    confirmPassword: 'PeerNest!6214',
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
          {'Sign In'} - {envObj.BRAND_NAME}
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
