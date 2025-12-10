import { envObj } from '@peernest/config/static';
import { useAtom } from 'jotai';
import { Helmet } from 'react-helmet-async';

import useAuth from '@/features/auth/hooks/use-auth';
import { currentUserAtom } from '@/features/user/atoms/current-user.atom';

export default function HomePage() {
  const { signOut, isLoading } = useAuth();

  const [currentUser] = useAtom(currentUserAtom);

  async function onSignOutClick() {
    await signOut();
  }

  // this is just testing purpose

  return (
    <>
      <Helmet>
        <title>
          {'Home'} - {envObj.BRAND_NAME}
        </title>
      </Helmet>
      <div>
        <p>This is a home page</p>
        <br />
        <p>{envObj.PUBLIC_ORIGIN}</p>
        <br />
        <pre>{JSON.stringify(currentUser, null, 2)}</pre>
        <br />

        {currentUser?.avatarUrl && (
          <img
            src={`${currentUser.avatarUrl}?v=${currentUser.lastSignedTime}`}
            width={40}
            height={40}
            alt='avatar url'
            referrerPolicy='no-referrer'
          />
        )}

        <button type='button' onClick={onSignOutClick} disabled={isLoading}>
          Sign out
        </button>
      </div>
    </>
  );
}
