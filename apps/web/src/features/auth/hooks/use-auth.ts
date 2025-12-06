import { envObj } from '@peernest/config/static';
import { TSignInRo, TSignUpRo } from '@peernest/contract';
import { useAtom } from 'jotai';
import { RESET } from 'jotai/utils';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { currentUserAtom } from '@/features/user/atoms/current-user.atom';
import { APP_ROUTE } from '@/lib/app-route';

import { signIn, signOut, signUp } from '../services/auth-service';

export default function useAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [, setCurrentUser] = useAtom(currentUserAtom);

  const handleSignUp = async (data: TSignUpRo) => {
    setIsLoading(true);

    try {
      await signUp(data);
      setIsLoading(false);
      navigate(APP_ROUTE.HOME);
    } catch (error) {
      setIsLoading(false);
      console.error('Unable to sign up');
      console.error(error);
    }
  };

  const handleSignIn = async (data: TSignInRo) => {
    setIsLoading(true);

    try {
      await signIn(data);
      setIsLoading(false);
      navigate(APP_ROUTE.HOME);
    } catch (error) {
      setIsLoading(false);
      console.error('Unable to sign in');
      console.error(error);
    }
  };

  const handleGoogleAuthenticate = async () => {
    setIsLoading(true);

    try {
      window.location.href = `${envObj.API_BASE_URL}/auth/google`;
    } catch (error) {
      setIsLoading(false);
      console.error('Unable to sign in');
      console.error(error);
    }
  };

  const handleSignOut = async () => {
    setCurrentUser(RESET);
    await signOut();
    window.location.replace(APP_ROUTE.AUTH);
  };

  return {
    signUp: handleSignUp,
    signIn: handleSignIn,
    googleAuthenticate: handleGoogleAuthenticate,
    signOut: handleSignOut,
    isLoading,
  };
}
