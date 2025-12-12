import { envObj } from '@peernest/config/dynamic';
import { Button, Heading, Text } from '@react-email/components';

import type { TChangeEmailOptions } from '../../types';
import BaseLayout from '../layouts/baseLayout';
import { button, heading2, paragraph } from '../styles';

type TChangeEmailPageProps = TChangeEmailOptions;

function ChangeEmailPage({ userDisplayName, changeEmailUrl }: TChangeEmailPageProps) {
  return (
    <BaseLayout>
      <Heading as='h2' style={heading2}>
        Hey {userDisplayName},
      </Heading>
      <Text style={paragraph}>
        Your {envObj.BRAND_NAME} email can be changed by clicking the button below. If you did not
        request a new email verification, please ignore this email.
      </Text>
      <Button href={changeEmailUrl} style={button}>
        Change Email
      </Button>
    </BaseLayout>
  );
}

export default ChangeEmailPage;

ChangeEmailPage.PreviewProps = {
  changeEmailUrl: 'http://peernest.com/change-email?code=superSecretToken',
  userDisplayName: 'johnDoe_1490',
} as TChangeEmailPageProps;
