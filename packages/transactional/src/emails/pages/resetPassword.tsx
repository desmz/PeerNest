import { envObj } from '@peernest/config/dynamic';
import { Button, Heading, Text } from '@react-email/components';

import type { TResetPasswordOptions } from '../../types';
import BaseLayout from '../layouts/baseLayout';
import { button, heading2, paragraph } from '../styles';

type TResetPasswordPageProps = TResetPasswordOptions;

function ResetPasswordPage({ userDisplayName, resetPasswordUrl }: TResetPasswordPageProps) {
  return (
    <BaseLayout>
      <Heading as='h2' style={heading2}>
        Hey {userDisplayName},
      </Heading>
      <Text style={paragraph}>
        Your {envObj.BRAND_NAME} password can be reset by clicking the button below. If you did not
        request a new password, please ignore this email.
      </Text>
      <Button href={resetPasswordUrl} style={button}>
        Reset Password
      </Button>
    </BaseLayout>
  );
}

export default ResetPasswordPage;

ResetPasswordPage.PreviewProps = {
  resetPasswordUrl: 'http://peernest.com/reset-password?code=superSecretToken',
  userDisplayName: 'johnDoe_1490',
} as TResetPasswordPageProps;
