import { render } from '@react-email/render';

import { TChangeEmailOptions, TResetPasswordOptions, TResetPasswordSuccessOptions } from '../types';

import ChangeEmailPage from './pages/changeEmail';
import ResetPasswordPage from './pages/resetPassword';
import ResetPasswordSuccessPage from './pages/resetPasswordSuccess';

export async function renderResetPasswordPage(options: TResetPasswordOptions): Promise<string> {
  return render(<ResetPasswordPage {...options} />);
}

export async function renderResetPasswordSuccessPage(
  options: TResetPasswordSuccessOptions
): Promise<string> {
  return render(<ResetPasswordSuccessPage {...options} />);
}

export async function renderChangeEmailPage(options: TChangeEmailOptions): Promise<string> {
  return render(<ChangeEmailPage {...options} />);
}
