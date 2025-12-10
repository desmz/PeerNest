import { mainSection } from '../emails';

export type TGenericLayoutProps = {
  children: React.ReactNode;
  mainSectionStyle?: Partial<typeof mainSection>;
};

export type TResetPasswordOptions = {
  userDisplayName: string;
  resetPasswordUrl: string;
};

export type TResetPasswordSuccessOptions = {
  userDisplayName: string;
};
