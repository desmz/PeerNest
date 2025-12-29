import { envObj } from '@peernest/config/dynamic';
import { Heading, Text } from '@react-email/components';

import type { TResetPasswordSuccessOptions } from '../../types';
import BaseLayout from '../layouts/baseLayout';
import { heading2, paragraph } from '../styles';

type TResetPasswordSuccessProps = TResetPasswordSuccessOptions;

function ResetPasswordSuccessPage({ userDisplayName }: TResetPasswordSuccessProps) {
  return (
    <BaseLayout>
      <Heading as='h2' style={heading2}>
        What's up {userDisplayName},
      </Heading>
      <Text style={paragraph}>
        We've channeled our psionic energy to change your {envObj.BRAND_NAME} account password.
        Gonna go get a seltzer to calm down.
      </Text>
    </BaseLayout>
  );
}

export default ResetPasswordSuccessPage;

ResetPasswordSuccessPage.PreviewProps = {
  userDisplayName: 'johnDoe_1490',
} as TResetPasswordSuccessProps;
