import { render } from '@react-email/render';

import { TResetPasswordOptions, TResetPasswordSuccessOptions } from '../types';

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
